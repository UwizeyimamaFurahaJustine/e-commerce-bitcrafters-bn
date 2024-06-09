/* eslint-disable no-case-declarations */
import { Request, Response } from 'express'
import Stripe from 'stripe'
import logger from '../utils/logger'
import Order, { OrderStatus } from '../database/models/orderModel'
import OrderService from '../services/orderService'
import { decrementProductServices } from '../services/productServices'
import { STRIPE_SECRET_KEY, URL } from '../config/index'

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
})

/**
 * payment Controller class
 */
export default class PaymentController {
  /**
   * Process payment and update order status
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async processPayment(req: Request, res: Response): Promise<Response> {
    const { currency, paymentMethodId } = req.body
    const orderId = req.params.orderId
    const userId = req.user?.id

    const baseUrl = URL

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' })
    }

    const order = await Order.findByPk(orderId)
    if (!order || order.userId !== userId) {
      return res.status(404).json({ message: 'Order not found' })
    }

    if (!order.items || !Array.isArray(order.items)) {
      return res
        .status(400)
        .json({ message: 'Order items are missing or invalid' })
    }

    const amount = order.totalAmount

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method: paymentMethodId,
      confirm: true,
      metadata: { orderId, userId },
      return_url: `${baseUrl}/stripe-return?orderId=${orderId}&userId=${userId}`,
    })

    order.status = OrderStatus.INITIATED

    const currentDate = new Date()
    currentDate.setDate(currentDate.getDate() + 10)
    order.expectedDeliveryDate = currentDate.toISOString().split('T')[0]

    await order.save()
    await decrementProductServices(order.items)

    return res.status(200).json({
      message: 'Payment initiated',
    })
  }

  /**
   * stripeReturn and update order status
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async stripeReturn(req: Request, res: Response): Promise<Response> {
    const { orderId, userId } = req.query

    const order = await Order.findByPk(orderId as string)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const confirmation = {
      orderNumber: order.orderNumber,
      totalCost: order.totalAmount,
      expectedDeliveryDate: order.expectedDeliveryDate,
    }

    return res.status(200).json({
      message: `Thank you for your payment. Order ID: ${orderId}, User ID: ${userId}`,
      confirmation,
    })
  }

  /**
   * handleStripeWebhook and update order status
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async handleStripeWebhook(
    req: Request,
    res: Response,
  ): Promise<Response> {
    const eventType = req.body.type
    try{
    switch (eventType) {
      case 'payment_intent.succeeded':
        const paymentIntentSucceeded = req.body.data.object
        const orderId = paymentIntentSucceeded.metadata.orderId
        await OrderService.updateOrderStatus(orderId, OrderStatus.COMPLETED)
        logger.info(`Order ${orderId} payment succeeded.`)
        break
      case 'payment_intent.payment_failed':
        const paymentIntentPaymentFailed = req.body.data.object
        const failedOrderId = paymentIntentPaymentFailed.metadata.orderId
        await OrderService.updateOrderStatus(failedOrderId, OrderStatus.FAILED)
        logger.info(`Order ${failedOrderId} payment failed.`)
        break
      default:
        logger.info(`Unhandled event type ${req.body.type}`)
    }
  } catch (error) {
    logger.error('Error handling stripe webhook event: $ {error.message}')
    return res.status(500).json({error: 'internal server error'})
  } finally{

  }

    return res.status(200).json({ received: true })
  }
}

import { Request, Response, NextFunction } from 'express'
import Order, { OrderStatus, PaymentInfo } from '../database/models/orderModel'
import Cart from '../database/models/cartModel'
import { eventEmitter } from '../services/notificationServices'
import { clearCart } from '../services/cartService'

/**
 * checkout  class controller
 */
export default class CheckoutController {
  /**
   * Buyer checkout details.
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express nextFunction objects
   * @returns {Promise<Response>} Promise that resolves to an Express response
   */
  static async checkout(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> {
    const {
      fullName,
      phoneNumber,
      country,
      streetAddress,
      town,
      email,
      deliveryDate,
      paymentMethod,
      cardNumber,
      cardHolderName,
      expiryDate,
      cvv,
      mobileMoneyNumber,
      orderNumber
    } = req.body

    const deliveryInfo = {
      fullName,
      phoneNumber,
      country,
      streetAddress,
      town,
      email,
      deliveryDate,
    }
    const user = req.user

    let paymentInfo: PaymentInfo
    if (paymentMethod === 'creditCard') {
      paymentInfo = {
        method: paymentMethod,
        cardNumber,
        cardHolderName,
        expiryDate,
        cvv,
      }
    } else if (paymentMethod === 'mobileMoney') {
      paymentInfo = { method: paymentMethod, mobileMoneyNumber }
    } else {
      return res.status(400).json({ message: 'Invalid payment method' })
    }
    try {
      const cart = await Cart.findOne({
        where: { buyerId: user.id, status: 'active' },
      })
      const totalAmount = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      )

      const order = await Order.create({
        userId: user.id,
        items: cart.items,
        totalAmount,
        status: OrderStatus.PENDING,
        deliveryInfo,
        paymentInfo,
        orderNumber: `ECB${Math.floor(100000 + Math.random() * 900000)}`,
      })
      await clearCart(cart.id)
      eventEmitter.emit('order:created', { user, order })
      return res
        .status(201)
        .json({ message: 'Order processed successfully', order })
    } catch (error) {
      next(error)
    }
  }
}

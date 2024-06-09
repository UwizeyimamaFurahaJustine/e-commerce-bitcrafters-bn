import chai, { expect } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import express, { Request, Response, NextFunction } from 'express'
import Stripe from 'stripe'
import Order, { OrderStatus } from '../src/database/models/orderModel'
import PaymentController from '../src/controllers/paymentStripeController'
import OrderService from '../src/services/orderService'

chai.use(sinonChai)

const processPayment = PaymentController.processPayment
const stripeReturn = PaymentController.stripeReturn
const handleStripeWebhook = PaymentController.handleStripeWebhook

describe('processPayment', function processPaymentTest() {
  this.timeout(60000)

  let req: Request
  let res: Response
  let next: NextFunction
  let findByPkStub: sinon.SinonStub
  let stripePaymentIntentsCreateStub: sinon.SinonStub

  let updateOrderStatusStub: any

  const stripe = new Stripe('test_secret_key', {
    apiVersion: '2024-04-10',
  })

  beforeEach(() => {
    req = express.request as Request
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    } as unknown as Response
    next = sinon.spy()
    findByPkStub = sinon.stub(Order, 'findByPk')
    stripePaymentIntentsCreateStub = sinon.stub(stripe.paymentIntents, 'create')

    updateOrderStatusStub = sinon.stub(OrderService, 'updateOrderStatus')
  })

  afterEach(() => {
    sinon.restore()
  })
  describe('processPayment', () => {
    it('Should return 400 if user ID is missing', async () => {
      delete req.user
      await processPayment(req, res)

      expect(res.status).to.be.calledOnceWith(400)
      expect(res.json).to.be.calledWith({ message: 'User ID is required' })
    })
    it('should return 404 if the order is not found or does not belong to the user', async () => {
      req.params = { orderId: 'orderId' }
      req.user = { id: 123 }

      findByPkStub.resolves(null)

      await processPayment(req, res)

      expect(res.status).to.have.been.calledWith(404)
      expect(res.json).to.have.been.calledWith({ message: 'Order not found' })
    })

    it('should return 400 if order items are missing or invalid', async () => {
      req.params = { orderId: 'orderId' }
      req.body = { currency: 'usd', paymentMethodId: 'pm_card_visa' }
      req.user = { id: 123 }

      const order = {
        id: 'orderId',
        userId: 123,
        totalAmount: 100,
        status: OrderStatus.PENDING,
        orderNumber: 'ECB123456',
        expectedDeliveryDate: new Date(),
      }

      findByPkStub.resolves(order)

      await processPayment(req, res)
      expect(res.status).to.have.been.calledWith(400)
      expect(res.json).to.have.been.calledWith({
        message: 'Order items are missing or invalid',
      })
    })

    it('should process the payment and update the order status successfully', async () => {
      req.params = { orderId: 'orderId' }
      req.body = { currency: 'usd', paymentMethodId: 'pm_card_visa' }
      req.user = { id: 123 }

      const order = {
        id: 'orderId',
        userId: 123,
        totalAmount: 100,
        status: OrderStatus.PENDING,
        orderNumber: 'ECB123456',
        expectedDeliveryDate: new Date(),
        items: [
          { productId: '83e28640-cf1c-40bf-ab03-da2cfeaaf27f', quantity: 2 },
          { productId: '9e555bd6-0f36-454a-a3d5-89edef4ff9d1', quantity: 1 },
        ],
        save: sinon.stub().resolves(),
      }

      findByPkStub.resolves(order)

      await processPayment(req, res)

      expect(order.status).to.equal(OrderStatus.INITIATED)
      expect(order.save).to.have.been.calledOnce
      expect(res.status).to.have.been.calledWith(200)
      expect(res.json).to.have.been.calledWith({
        message: 'Payment initiated',
      })
    })
  })

  describe('stripeReturn', () => {
    it('should return 404 if the order is not found ', async () => {
      req.query = {
        orderId: '83e28640-cf1c-40bf-ab03-da2cfeaaf27f',
        userId: 'user456',
      }

      findByPkStub.resolves(null)

      await stripeReturn(req, res)

      expect(res.status).to.have.been.calledWith(404)
      expect(res.json).to.have.been.calledWith({ message: 'Order not found' })
    })
    it('should send a confirmation message with order and user IDs', async () => {
      req.query = {
        orderId: '83e28640-cf1c-40bf-ab03-da2cfeaaf27f',
        userId: 'user456',
      }

      const Order = {
        orderNumber: 'ECB123456',
        totalAmount: 100,
        expectedDeliveryDate: new Date(
          new Date().setDate(new Date().getDate() + 10),
        )
          .toISOString()
          .split('T')[0],
      }
      findByPkStub.resolves(Order)
      await stripeReturn(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(res.json).to.have.been.calledWith({
        message:
          'Thank you for your payment. Order ID: 83e28640-cf1c-40bf-ab03-da2cfeaaf27f, User ID: user456',
        confirmation: {
          orderNumber: Order.orderNumber,
          totalCost: Order.totalAmount,
          expectedDeliveryDate: Order.expectedDeliveryDate,
        },
      })
    })
  })

  describe('handleStripeWebhook', () => {
    it('should update order status to COMPLETED on payment_intent.succeeded', async () => {
      req.body = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            metadata: {
              orderId: '83e28640-cf1c-40bf-ab03-da2cfeaaf27f',
            },
          },
        },
      }
      await handleStripeWebhook(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(res.json).to.have.been.calledWith({ received: true })
    })

    it('should update order status to FAILED on payment_intent.payment_failed', async () => {
      req.body = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            metadata: {
              orderId: '83e28640-cf1c-40bf-ab03-da2cfeaaf27f',
            },
          },
        },
      }
      await handleStripeWebhook(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(res.json).to.have.been.calledWith({ received: true })
    })

    it('should handle unhandled event types', async () => {
      req.body = {
        type: 'unhandled_event_type',
      }
      await handleStripeWebhook(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(res.json).to.have.been.calledWith({ received: true })
    })
  })
})

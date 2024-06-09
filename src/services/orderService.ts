import { UUID } from 'crypto'
import Order, { OrderStatus } from '../database/models/orderModel'

/**
 * payment class
 */
export default class OrderService {
  /**
   * Update the status of an order and handle additional logic if necessary
   * @param {number} orderId - The ID of the order to update
   * @param {OrderStatus} status - The new status of the order
   * @returns {Promise<Order | null>} The updated order, or null if the order does not exist
   */
  static async updateOrderStatus(
    orderId: UUID | string,
    status: OrderStatus,
  ): Promise<Order | null> {
    const order = await Order.findByPk(orderId)
    if (!order) {
      return null
    }

    order.status = status

    if (status === OrderStatus.COMPLETED) {
      const currentDate = new Date()
      currentDate.setDate(currentDate.getDate() + 10)
      order.deliveryInfo.deliveryDate = currentDate.toISOString().split('T')[0] as unknown as Date
    }

    await order.save()
    return order
  }
}
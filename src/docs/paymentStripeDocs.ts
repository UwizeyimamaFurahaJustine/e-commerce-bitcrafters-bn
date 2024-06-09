/**
 * @swagger
 * /payment/process-payment/{orderId}:
 *   post:
 *     summary: Process payment for an order
 *     description: Processes the payment for an order using Stripe and updates the order status.
 *     tags:
 *       - PAYMENT STRIPE
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the order for which the payment is being processed
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currency
 *               - paymentMethodId
 *             properties:
 *               currency:
 *                 type: string
 *                 example: "usd"
 *               paymentMethodId:
 *                 type: string
 *                 example: "pm_1Iv9Ao2eZvKYlo2C5xNQ7Gh5"  # Replace with your generated paymentMethodId
 *     responses:
 *       '200':
 *         description: Payment processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 confirmation:
 *                   $ref: '#/components/schemas/PaymentConfirmation'
 *       '404':
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundResponse'
 *     security:
 *       - bearerAuth: []
 *
 * components:
 *   schemas:
 *     PaymentConfirmation:
 *       type: object
 *       properties:
 *         orderId:
 *           type: string
 *         totalCost:
 *           type: number
 *         userId:
 *           type: string
 *     NotFoundResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 */


/**
 * @swagger
 * /stripe-return:
 *   get:
 *     summary: Handle Stripe return after payment
 *     tags:
 *       - PAYMENT STRIPE
 *     parameters:
 *       - in: query
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the order
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: Redirect to a thank you page
 */

/**
 * @swagger
 * /stripe-webhook:
 *   post:
 *     summary: Handle Stripe webhook events
 *     tags:
 *       - PAYMENT STRIPE
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook event handled successfully
 */

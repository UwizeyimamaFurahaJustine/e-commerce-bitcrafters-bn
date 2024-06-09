import express from 'express'
import isAuthenticated, {
  checkPermission,
} from '../middlewares/authenticationMiddleware'
import { UserRole } from '../database/models/userModel'
import paymentController from '../controllers/paymentStripeController'

const router = express.Router()

router.post(
  '/process-payment/:orderId',
  isAuthenticated,
  checkPermission(UserRole.BUYER),
  paymentController.processPayment,
)

export default router

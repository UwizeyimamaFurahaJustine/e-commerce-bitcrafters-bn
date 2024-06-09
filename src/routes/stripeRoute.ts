import express from 'express';
import paymentController from '../controllers/paymentStripeController';


const router = express.Router();


router.post('/', paymentController.handleStripeWebhook);
router.get('/', paymentController.stripeReturn);


export default router;
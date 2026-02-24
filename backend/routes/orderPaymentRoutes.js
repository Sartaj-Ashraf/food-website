import express from 'express';
import {
  createOrder,
  createRazorpayOrder,
  
  createCartOrder,
  createCartRazorpayOrder,
  
  createDirectOrder,
  createDirectRazorpayOrder,
  
 getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  
  createPayment,
  getPaymentById,
  
  validateDeliveryAddress,
  
  razorpayWebhookHandler,
} from '../controllers/orderPaymentController.js';
import { authenticateUser, authorizePermissions, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/razorpay/webhook', razorpayWebhookHandler);

router.use(authenticateUser);

router.post('/orders', createOrder); // Maps to createCartOrder
router.post('/razorpay/order', createRazorpayOrder); // Maps to createCartRazorpayOrder

router.post('/cart/razorpay/order', createCartRazorpayOrder);
router.post('/cart/orders', createCartOrder);

router.post('/direct/razorpay/order', createDirectRazorpayOrder);
router.post('/direct/orders', createDirectOrder);

router.get('/all/orders', authorizePermissions("admin"), getAllOrders);
router.get('/orders',  getUserOrders);
router.get('/orders/:id', getOrderById);
router.patch('/orders/:id/status', authorizePermissions("admin"), updateOrderStatus);

router.post('/payments', createPayment);
router.get('/payments/:id', getPaymentById);

router.post('/validate-delivery-address', validateDeliveryAddress);

export default router;

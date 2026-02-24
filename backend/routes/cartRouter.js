import express from 'express';
import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
  validateCart,
  getGuestCart,
  transferGuestCartToUser
} from '../controllers/cartController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// ---##### Auth middleware, controll who can access the below routes #####---
router.post('/guest', getGuestCart);
router.use(authenticateUser);

// Add item to cart
router.post('/add', addToCart);

// Transfer guest cart to user
router.post('/transfer', transferGuestCartToUser);  

// Get user's cart
router.get('/', getCart);

// Get guest cart

// Update cart item quantity
router.put('/update', updateCartItem);

// Remove item from cart
router.delete('/remove', removeFromCart);

// Clear entire cart
router.delete('/clear', clearCart);

// Get cart count (for header badge)
router.get('/count', getCartCount);

// Validate cart items before checkout
router.get('/validate', validateCart);

export default router;
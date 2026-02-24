import express from 'express';
import {
  createProduct,
  getProducts,
  getDeletedProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  permanentDeleteProduct,
  removeProductImage,
  getFeaturedProducts,
  getProductsByPieceCount,
  getProductsByQuantity,
  getProductStats,
  restoreProduct,
  getproductForFilter,
  getProductsAndCombos  
} from '../controllers/productController.js';
import { upload } from '../utils/imageUtils.js';
import { authenticateUser, authorizePermissions } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/all', getProductsAndCombos);
router.get('/', getProducts);
router.get('/for-filter', getproductForFilter);
router.get('/featured', getFeaturedProducts);
router.get('/stats', getProductStats);
router.get('/pieces/:pieces', getProductsByPieceCount);
router.get('/quantity/:quantity', getProductsByQuantity);
router.get('/slug/:slug', getProductBySlug);
router.get('/deleted', authenticateUser, authorizePermissions("admin"), getDeletedProducts);
router.get('/:id', getProductById);

// Admin routes
router.use(authenticateUser);
router.use(authorizePermissions("admin"));

router.post('/', upload.array('images', 10), createProduct);
router.put('/:id', upload.array('images', 10), updateProduct);
router.delete('/:id', deleteProduct);
router.put('/:id/restore', restoreProduct);
router.delete('/:id/permanent', permanentDeleteProduct);
router.delete('/:productId/images/:imageUrl', removeProductImage);

export default router;
import express from 'express';
import {
    checkComboAvailability,removeComboImage,permanentDeleteCombo,restoreCombo,deleteCombo,updateCombo,getComboBySlug,getComboById,getDeletedCombos,getCombos,createCombo  
} from '../controllers/comboController.js';
import { upload } from '../utils/imageUtils.js';
import { authenticateUser, authorizePermissions } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getCombos);
router.get('/availability', checkComboAvailability);
router.get('/combo/:id', getComboById);
router.get('/combo/slug/:slug', getComboBySlug);



router.use(authenticateUser);
router.use(authorizePermissions("admin"));

router.post('/', upload.array('images', 10), createCombo);
router.put('/:id', upload.array('images', 10), updateCombo);
router.delete('/:id', deleteCombo);
router.get('/deleted', getDeletedCombos);
router.put('/:id/restore', restoreCombo);
router.delete('/:id/permanent', permanentDeleteCombo);
router.delete('/:productId/images/:imageUrl', removeComboImage);




export default router;
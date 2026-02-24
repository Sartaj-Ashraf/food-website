import express from "express";
import {
  addServiceArea,
  editServiceArea,
  deleteServiceArea,
  toggleActive,
  getAllServiceAreas,
  getServiceAreaById,
} from "../controllers/serviceAreaController.js";

import { authenticateUser, authorizePermissions } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (if you want customers to fetch all active service areas)
router.get("/all", getAllServiceAreas);
router.get("/:id", getServiceAreaById);

// Admin routes
router.use(authenticateUser);
router.use(authorizePermissions("admin"));

router.post("/", addServiceArea);
router.put("/:id", editServiceArea);
router.delete("/:id", deleteServiceArea);
router.put("/:id/toggle", toggleActive);

export default router;

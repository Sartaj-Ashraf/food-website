import { Router } from "express";
const router = Router();

import {
    createContactQuery,
    getAllContactQueries,
    deleteContactQuery,
    exportContactQueries,
    addBulkContactQuery
} from "../controllers/contactQueriesController.js";

import {
    authenticateUser,
    authorizePermissions,
} from "../middleware/authMiddleware.js";


// Bulk- @params: name, phoneNumber, message - Create new contact form entry
router.post("/bulk", addBulkContactQuery);

// Create- @params: name, phoneNumber, message - Create new contact form entry
router.post("/", createContactQuery);

// ---##### Auth middleware, controll who can access the below routes #####---
router.use(authenticateUser);
router.use(authorizePermissions("admin"));

// Read- @params: search, startDate, endDate, sortBy - Get all contacts
router.get("/", getAllContactQueries);

// Delete- @params: id - Delete by id 
router.delete("/:id", deleteContactQuery);

// Export- @params: format - Export format (xlsx)
router.get("/export", exportContactQueries);

export default router;

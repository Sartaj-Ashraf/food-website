import { Router } from "express";
const router = Router();

import {
    createTestimonial,
    getAllTestimonials,
    getTestimonialById,
    getFeaturedTestimonials,
    updateTestimonialById,
    deleteTestimonialById,
    deleteAllTestimonials,
} from "../controllers/testimonailsController.js";

import { authenticateUser, authorizePermissions } from "../middleware/authMiddleware.js";

// Read- @params: search - Get all testimonials
router.get("/", getAllTestimonials);

// Read- @params: search - Get all featured testimonials
router.get("/featured-testimonials", getFeaturedTestimonials);

// Read- @params: id - Get by id
router.get("/:id", getTestimonialById);

// Create- @params: name, message - Create new testimonial
router.post("/", createTestimonial);

// Delete- @params: id - Delete all testimonials
router.delete("/delete-all-testimonials", deleteAllTestimonials);

// ---##### Auth middleware, controll who can access the below routes #####---
router.use(authenticateUser);
router.use(authorizePermissions("admin"));

// Update- @params: id, name, message - Update by id
router.patch("/:id", updateTestimonialById);

// Delete- @params: id - Delete by id 
router.delete("/:id", deleteTestimonialById);


export default router;

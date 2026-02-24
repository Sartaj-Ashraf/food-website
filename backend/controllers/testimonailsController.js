// controllers/testimonials.js

import MoonlightTestimonial from "../models/testimonials.js";
import { StatusCodes } from "http-status-codes";
import { getPaginationParams, getPaginationInfo } from "../utils/pagination.js";
import { NotFoundErr } from "../errors/customErors.js";

// Create a new testimonial
export const createTestimonial = async (req, res) => {
    const testimonial = await MoonlightTestimonial.create(req.body);
    res.status(StatusCodes.CREATED).json({
        testimonial,
        status: "success",
        message: "Success! Testimonial created successfully",
    });
};

// Get all testimonials, paginated, with search
export const getAllTestimonials = async (req, res) => {
    const { search } = req.query;
    const queryObject = {};
    if (search) {
        queryObject.$or = [
            { name: { $regex: search, $options: "i" } },
            { review: { $regex: search, $options: "i" } },
        ];
    }

    // --- Use pagination util
    const { page, limit, skip } = getPaginationParams(req);

    const testimonials = await MoonlightTestimonial.find(queryObject)
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });

    const totalDocs = await MoonlightTestimonial.countDocuments(queryObject);

    // --- Use pagination info util
    const pagination = getPaginationInfo(totalDocs, page, limit);

    res.status(StatusCodes.OK).json({
        status: "success",
        testimonials,
        ...pagination
    });
};

// Get a single testimonial by ID
export const getTestimonialById = async (req, res) => {
    const { id } = req.params;
    const testimonial = await MoonlightTestimonial.findById(id);
    if (!testimonial) {
        throw new NotFoundErr(`No testimonial with id ${id}`);
    }
    res.status(StatusCodes.OK).json({ status: "success", testimonial });
};

// Get all featured testimonials (not paginated, just limited to 30)
export const getFeaturedTestimonials = async (req, res) => {
    const testimonials = await MoonlightTestimonial.find({ isFeatured: true })
        .sort({ createdAt: -1 })
        .limit(30);
    res.status(StatusCodes.OK).json({ status: "success", testimonials });
};

// Update testimonial by ID
export const updateTestimonialById = async (req, res) => {
    const { id } = req.params;
    const updatedTestimonial = { ...req.body };
    const testimonial = await MoonlightTestimonial.findByIdAndUpdate(
        id,
        updatedTestimonial,
        { new: true }
    );
    if (!testimonial) {
        throw new NotFoundErr(`No testimonial with id ${id}`);
    }
    res.status(StatusCodes.OK).json({ status: "success", message: "Testimonial updated", testimonial });
};

// Delete testimonial by ID
export const deleteTestimonialById = async (req, res) => {
    const { id } = req.params;
    const testimonial = await MoonlightTestimonial.findByIdAndDelete(id);
    if (!testimonial) {
        throw new NotFoundErr(`No testimonial with id ${id}`);
    }
    res.status(StatusCodes.OK).json({ status: "success", message: "Testimonial deleted" });
};

// Delete all testimonials
export const deleteAllTestimonials = async (req, res) => {
    const result = await MoonlightTestimonial.deleteMany();
    res.status(StatusCodes.OK).json({ status: "success", message: "All testimonials deleted", testimonials: result });
};

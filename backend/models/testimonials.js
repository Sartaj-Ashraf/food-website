import mongoose from "mongoose"
const testimonialSchema = new mongoose.Schema({
    rating: {
        type: Number,
    },
    review: {
        type: String,
    },
    name: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    source: {
        type: String,
        enum: ["google", "instagram", "facebook", "twitter", "youtube"],
        default: "google",
    },
    sourceLink: {
        type: String,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    

    
})

export default mongoose.model("MoonlightTestimonial", testimonialSchema);

import mongoose from "mongoose";

// Single product schema with variants
const productSchema = mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true, // "Treat", "Family Pack", "Bulk Pack"
  },
     
  description: {
    type: String,
    required: true,
  },
     
  // Product variants (different weights/size)
  quantity: {
    type: String,
    required: true, // "100g", "400g", "1kg"
  },
  
  // Number of pieces in the product
  numberOfPieces: {
    type: Number,
    default: null,
  },
       
  price: {
    type: Number,
    required: true,
  },
  discountPrice: {
    type: Number,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
     
  // Common product images
  images: [{
    type: String, // Image URLs
  }],
     
  // Product status
  status: {
    type: String,
    enum: ["out_of_stock", "in_stock"],
    default: "in_stock",
  },
     
  // Basic ingredients
  ingredients: [{
    type: String,
  }],
     
  // Featured flag
  isFeatured: {
    type: Boolean,
    default: false,
  },
  // Created by admin
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "moonlightUser",
    required: true,
  },
   
}, {
  timestamps: true,
});

// Indexes
productSchema.index({ title: "text", description: "text" });
productSchema.index({ title: "text" });
productSchema.index({ isActive: "text", title: "text" });
productSchema.index({ isFeatured: "text", title: "text" });
productSchema.index({ status: "text", title: "text" });

export default mongoose.model("walnutFudgeProduct", productSchema);
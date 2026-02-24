import mongoose from "mongoose";

// Combo schema for product combinations
const comboSchema = mongoose.Schema({
  name: {
    type: String,
    required: true, // "Sweet Delight Combo", "Family Pack Mix", "Festival Special"
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  
  // Products included in the combo
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "walnutFudgeProduct",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1, // How many units of this product in the combo
    }
  }],
  
  // Combo pricing
  originalPrice: {
    type: Number,
    required: true, // Sum of individual product prices
  },
  comboPrice: {
    type: Number,
    required: true, // Discounted combo price
  },
  
  // Combo images
  images: [{
    type: String, // Image URLs for the combo
  }],
  
  // Combo status
  isActive: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ["out_of_stock", "in_stock"],
    default: "in_stock",
  },
  
  // Featured combo
  isFeatured: {
    type: Boolean,
    default: false,
  },
  
  // Combo tags for better organization
  tags: [{
    type: String, // "bestseller", "new", "limited_time", "gift"
  }],
  
  // Created by admin
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "moonlightUser",
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes for better performance
comboSchema.index({ name: "text", description: "text" });
comboSchema.index({ isActive: 1, status: 1 });
comboSchema.index({ isFeatured: 1 });
comboSchema.index({ comboPrice: 1 });

export default mongoose.model("walnutFudgeCombo", comboSchema);
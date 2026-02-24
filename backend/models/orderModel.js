import mongoose from "mongoose";

// Order schema for storing user orders with products and combos (shallow copies)
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "moonlightUser",
      required: true,
    },
    deliveryCharge: {
      type: Number,
      default: parseInt(process.env.DELIVERY_CHARGE) || 150,
      required: true,
    },
    
    finalTotal: {
      type: Number,
      required: true
    },

    // Items copied from cart at time of order (shallow copy)
    items: [
      {
        itemType: {
          type: String,
          enum: ["product", "combo"],
          required: true,
        },
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        title: String,
        slug: String,
        price: Number,
        discountPrice: Number,
        comboPrice: Number,
        images: [String],
        description: String,
        quantityLabel: String, // quantity field from product/combo (like "100g", "1kg")
        numberOfPieces: Number,
        tags: [String], // for combos
      },
    ],

    // Order status
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    // Payment reference (optional initially, to be linked after payment)
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },

    // Total prices captured at checkout
    totalPrice: {
      type: Number,
      required: true,
    },

    totalDiscountPrice: {
      type: Number,
      required: true,
    },
    address: {
        address: { type: String },
        location: { type: String },
        city: { type: String },
        state: { type: String },
        postalCode: { type: String },
        country: { type: String },
        isDefault: { type: Boolean, default: false },
        coordinates: { type: [Number], required: true }, // [longitude, latitude]
      },
      phone: { type: String, required: true }, 
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ paymentId: 1 });

export default mongoose.models.Order || mongoose.model("Order", orderSchema);

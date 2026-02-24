import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "moonlightUser",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    razorpay_payment_id: { type: String, required: true }, // Payment gateway transaction ID
    razorpay_order_id: { type: String, required: true },
    razorpay_signature: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Success", "Failed", "Pending"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

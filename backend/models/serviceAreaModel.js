import mongoose from "mongoose";

const serviceAreaSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deliveryRadius: {
      type: Number, // in kilometers
      default: 5,   // default range if not specified
    },
  },
  { timestamps: true }
);

// Add geospatial index on location for geospatial queries
serviceAreaSchema.index({ location: "2dsphere" });

export default mongoose.model("ServiceArea", serviceAreaSchema);

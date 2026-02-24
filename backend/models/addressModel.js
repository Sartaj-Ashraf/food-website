// models/addressModel.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const addressSchema = new Schema(
  {
    // Complete address string (what frontend calls "location")
    address: { 
      type: String, 
      required: true,
      trim: true
    },
    
    // GeoJSON location for MongoDB geospatial queries
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude] - GeoJSON format
        required: true,
      },
    },
    
    // Address components
    city: { 
      type: String, 
      trim: true
    },
    state: { 
      type: String, 
      trim: true
    },
    postalCode: { 
      type: String, 
      trim: true
    },
    country: { 
      type: String, 
      default: "India",
      trim: true
    },
    
    // Default address flag
    isDefault: { 
      type: Boolean, 
      default: false 
    },
    
    // Additional metadata from geocoding
    accuracy: {
      type: String,
      default: 'APPROXIMATE'
    },
    placeId: {
      type: String,
      trim: true
    }
  },
  { 
    timestamps: true
  }
);

// Create 2dsphere index for geospatial queries
addressSchema.index({ location: "2dsphere" });

export default mongoose.model("MoonlightAddress", addressSchema);

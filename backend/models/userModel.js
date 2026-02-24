import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    avatar: String,
    role: {
      type: String,
      enum: ["user", "admin","subadmin" ],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false, 
    },
    verified: {
      type: Date,
      default: Date.now,
    },
    verificationToken: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("moonlightUser", userSchema);

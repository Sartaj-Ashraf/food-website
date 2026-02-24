import { StatusCodes } from "http-status-codes";
import User from "../models/userModel.js";
import { createJWT, verifyJWT } from "../utils/tokenUtils.js";
import sendVerificationEmail from "../utils/sendVerificationEmail.js";
import { compareOtp, hashOtp } from "../utils/passwordUtils.js";
import { sendOtp, verifyOtp } from "../utils/twillo.js";

// SMS OTP Sign Up
export const signUpWithSmsOtp = async (req, res) => {
  const { phoneNumber } = req.body;
  
  // Check if user already exists
  const existingUser = await User.findOne({ phoneNumber });
  if (existingUser) {
    return res.status(StatusCodes.CONFLICT).json({
      status: "error",
      message: "User already exists with this phone number",
    });
  }

  const isFirst = (await User.countDocuments()) === 0;
  req.body.role = isFirst ? "admin" : "user";
  req.body.isVerified = false;
  req.body.email = "";

  // Send OTP
  await sendOtp(phoneNumber);
  
  // Create new user
  await User.create(req.body);
  
  res.status(StatusCodes.CREATED).json({
    status: "success",
    message: "Success! Please check your SMS to verify account",
  });
};

// SMS OTP Sign In
export const signInWithSmsOtp = async (req, res) => {
  const { phoneNumber } = req.body;
  
  // Check if user exists
  const user = await User.findOne({ phoneNumber });
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: "error",
      message: "No account found with this phone number please register",
    });
  }

  // Send OTP
  await   (phoneNumber);
  
  res.status(StatusCodes.OK).json({
    status: "success",
    message: "Success! Please check your SMS to verify account",
  });
};

// Email OTP Sign Up
export const signUpWithEmailOtp = async (req, res) => {
  const { email, fullName } = req.body;
  
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(StatusCodes.CONFLICT).json({
      status: "error",
      message: "User already exists with this email",
    });
  }

  const isFirst = (await User.countDocuments()) === 0;
  req.body.role = isFirst ? "admin" : "user";
  req.body.isVerified = false;
  req.body.phoneNumber = "";

  // Generate and hash OTP
  const otp = Math.floor(100000+Math.random() * 900000).toString();
  req.body.verificationToken = await hashOtp(otp);

  // Send verification email
  await sendVerificationEmail({
    name: fullName,
    email: email,
    otp: otp,
  });

  // Create new user
  await User.create(req.body);
  
  res.status(StatusCodes.CREATED).json({
    status: "success",
    message: "Success! Please check your email to verify account",
  });
};

// Email OTP Sign In
export const signInWithEmailOtp = async (req, res) => {
  const { email, fullName } = req.body;
  
  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: "error",
      message: "No account found with this email please register",
    });
  }

  // Generate and hash OTP
  const otp = Math.floor(100000+Math.random() * 900000).toString();
  user.verificationToken = await hashOtp(otp);
  await user.save();

  // Send verification email
  await sendVerificationEmail({
    name: fullName || user.fullName,
    email: email,
    otp: otp,
  });
  
  res.status(StatusCodes.OK).json({
    status: "success",
    message: "Success! Please check your email to verify account",
  });
};

// Verify SMS OTP (for both sign up and sign in)
export const verifySmsOtp = async (req, res) => {
  const { phoneNumber, otp } = req.body;
  
  const user = await User.findOne({ phoneNumber });
  if (!user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: "error",
      message: "User not found",
    });
  }

  const isVerified = await verifyOtp(phoneNumber, otp);
  if (!isVerified) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: "error",
      message: "Invalid OTP",
    });
  }

  user.isVerified = true;
  user.verified = Date.now();
  await user.save();

  const token = createJWT({
    userId: user._id,
    role: user.role,
    phoneNumber: user.phoneNumber,
    email: user.email,
    fullName: user.fullName,
  });

  const oneDay = 1000 * 60 * 60 * 24;
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.status(StatusCodes.OK).json({ 
    message: "User logged in successfully", 
    role: user.role 
  });
};

// Verify Email OTP (for both sign up and sign in)
export const verifyEmailOtp = async (req, res) => {
  const { email, otp } = req.body;
  
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: "error",
      message: "User not found",
    });
  }

  const isVerified = await compareOtp(otp, user.verificationToken);
  if (!isVerified) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: "error",
      message: "Invalid OTP",
    });
  }

  user.isVerified = true;
  user.verified = Date.now();
  await user.save();

  const token = createJWT({
    userId: user._id,
    role: user.role,
    email: user.email,
    fullName: user.fullName,
    phoneNumber: user.phoneNumber,
  });

  const oneDay = 1000 * 60 * 60 * 24;
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.status(StatusCodes.OK).json({ 
    message: "User logged in successfully", 
    role: user.role 
  });
};

// Logout
export const logout = (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.status(StatusCodes.OK).json({ message: "User logged out successfully!" });
};

// Google OAuth Success Handler
export const googleCallback = async (req, res) => {
  try {
    const user = req.user;
    const redirectTo = req.query.state || "/";

    const token = createJWT({
      userId: user._id,
      role: user.role,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      });

    const oneDay = 1000 * 60 * 60 * 24;
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + oneDay),
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    // Redirect to frontend with success
    if (user.role === "admin") {
      res.redirect(`${process.env.CLIENT_URL}/admin`);
    } else {
      res.redirect(`${process.env.CLIENT_URL}/${redirectTo}`);
    }
  } catch (error) {
    console.error("Google callback error:", error);
    res.redirect(`${process.env.CLIENT_URL}/login?auth=error`);
  }
};

// Google OAuth Failure Handler
export const googleFailure = (req, res) => {
  res.redirect(`${process.env.CLIENT_URL}/login?auth=failed`);
};

export const checkAuth = (req, res) => {
 const token = req.cookies.token;
  
  if (!token || token === 'logout') {
    req.user = null;
    return res.status(StatusCodes.OK).json({
      success: false,
      user: null,
      message: "User is not authenticated"
    });
  }
  
  try {
    const payload = verifyJWT(token);
    req.user = {
      userId: payload.userId,
      role: payload.role,
      email: payload.email,
      fullName: payload.fullName,
      phoneNumber: payload.phoneNumber,
    };
    return res.status(StatusCodes.OK).json({
      success: true,
      user: req.user,
      message: "User is authenticated"
    });
  } catch (error) {
    console.log('Invalid token in optionalAuth:', error.message);
    req.user = null;
    return res.status(StatusCodes.OK).json({
      success: false,
      user: null,
      message: "User is not authenticated"
    });
  }
};

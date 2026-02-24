"use client";
import { useState, useEffect, useContext, createContext } from "react";
import { useRouter } from "next/navigation";
import { customFetch } from "@/utils/customFetch";
import {
  customVerifyEmailOtp,
  customVerifySmsOtp,
  customSignUpWithEmail,
  customSignInWithEmail,
  customSignUpWithSms,
  customSignInWithSms,
  customLogout,
  customCheckAuth
} from "@/services/authservices";
import { mergeGuestCartToUserCart } from "@/services/cartServices";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data, error } = await customCheckAuth();
    if (data) {
      setUser(data.user);
    }
    if (error) {
      setUser(null);
    }
    setIsLoading(false);
  };

  // Email Sign Up
  const signUpWithEmail = async (email, fullName, additionalData = {}) => {
    try {
      const { data, error } = await customSignUpWithEmail(email, fullName, additionalData);
      if (error) {
        const message = error.response?.data?.message || "Failed to sign up. Please try again.";
        return { success: false, message };
      }
      return { success: true, message: data.message };
    } catch (error) {
      console.error("Email sign up failed:", error);
      const message = error.response?.data?.message || "Failed to sign up. Please try again.";

      return { success: false, message };
    }
  };

  // Email Sign In
  const signInWithEmail = async (email, fullName = null) => {
    try {
      const { data, error } = await customSignInWithEmail(email, fullName);
      if (error) {
        const message = error.response?.data?.message || "Failed to sign in. Please try again.";
        return { success: false, message };
      }
      return { success: true, message: data.message };
    } catch (error) {
      console.error("Email sign in failed:", error);
      const message = error.response?.data?.message || "Failed to sign in. Please try again.";
      return { success: false, message };
    }
  };

  // SMS Sign Up
  const signUpWithSms = async (phoneNumber, fullName, additionalData = {}) => {
    try {
      const { data, error } = await customSignUpWithSms(phoneNumber, fullName, additionalData);
      if (error) {
        const message = error.response?.data?.message || "Failed to sign up. Please try again.";
        return { success: false, message };
      }
      return { success: true, message: data.message };
    } catch (error) {
      console.error("SMS sign up failed:", error);
      const message = error.response?.data?.message || "Failed to sign up. Please try again.";
      return { success: false, message };
    }
  };

  // SMS Sign In
  const signInWithSms = async (phoneNumber) => {
    try {
      const { data, error } = await customSignInWithSms(phoneNumber);
      if (error) {
        const message = error.response?.data?.message || "Failed to sign in. Please try again.";
        return { success: false, message };
      }

      return { success: true, message: data.message };
    } catch (error) {
      console.error("SMS sign in failed:", error);
      const message = error.response?.data?.message || "Failed to sign in. Please try again.";
      return { success: false, message };
    }
  };

  // Verify email OTP
  const verifyEmailOtp = async (email, otp) => {
    try {
      const { data, error } = await customVerifyEmailOtp(email, otp);
      if (error) {
        const message = error.response?.data?.message || "Invalid OTP. Please try again.";
        return { success: false, message };
      }
      await checkAuth(); // Refresh user data
      await mergeGuestCartToUserCart();
      if (data.role === "admin") {
        router.push("/admin/products");
      }
      return { success: true, message: data.message, role: data.role };
    } catch (error) {
      console.error("Verify email OTP failed:", error);
      const message = error.response?.data?.message || "Invalid OTP. Please try again.";
      return { success: false, message };
    }
  };

  // Verify SMS OTP
  const verifySmsOtp = async (phoneNumber, otp) => {
    try {
      const { data, error } = await customVerifySmsOtp(phoneNumber, otp);
      if (error) {
        const message = error.response?.data?.message || "Invalid OTP. Please try again.";
        return { success: false, message };
      }
      await mergeGuestCartToUserCart();
      await checkAuth(); // Refresh user data
      if (data.role === "admin") {
        router.push("/admin");
      }
      return { success: true, message: data.message, role: data.role };
    } catch (error) {
      console.error("Verify SMS OTP failed:", error);
      const message = error.response?.data?.message || "Invalid OTP. Please try again.";
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await customLogout();
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Legacy methods for backward compatibility (deprecated)
  const sendEmailOtp = async (email, fullName) => {
    console.warn("sendEmailOtp is deprecated. Use signUpWithEmail or signInWithEmail instead.");
    return signUpWithEmail(email, fullName);
  };

  const sendSmsOtp = async (phoneNumber, fullName) => {
    console.warn("sendSmsOtp is deprecated. Use signUpWithSms or signInWithSms instead.");
    return signUpWithSms(phoneNumber, fullName);
  };

  const value = {
    user,
    isLoading,
    logout,
    checkAuth,
    // New separated methods
    signUpWithEmail,
    signInWithEmail,
    signUpWithSms,
    signInWithSms,
    verifyEmailOtp,
    verifySmsOtp,
    // Legacy methods (deprecated)
    sendEmailOtp,
    sendSmsOtp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
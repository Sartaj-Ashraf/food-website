"use client";
import React, { useState, useEffect } from "react";
import { X, User, Mail, Phone, ArrowLeft, ChevronDown } from "lucide-react";
import Image from "next/image";
import { loginImg } from "@/assets";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "./Input";
import { useCartCount } from "@/hooks/useCartCount";

const COUNTRY_CODES = [
  { code: "+91", country: "IN", flag: "🇮🇳", name: "India" },
  { code: "+1", country: "US", flag: "🇺🇸", name: "United States" },
  { code: "+44", country: "GB", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+33", country: "FR", flag: "🇫🇷", name: "France" },
  { code: "+49", country: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "+81", country: "JP", flag: "🇯🇵", name: "Japan" },
  { code: "+86", country: "CN", flag: "🇨🇳", name: "China" },
  { code: "+61", country: "AU", flag: "🇦🇺", name: "Australia" },
];

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [authMode, setAuthMode] = useState("login");
  const {refreshCartCount} = useCartCount()
  const [inputMode, setInputMode] = useState("email");
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState(
    COUNTRY_CODES[0]
  );
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [status, setStatus] = useState({
    error: "",
    success: "",
    isLoading: false,
    canResend: false,
    resendCooldown: 0,
  });
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
  });

  const {
    signUpWithEmail,
    signInWithEmail,
    signUpWithSms,
    signInWithSms,
    verifyEmailOtp,
    verifySmsOtp,
  } = useAuth();

  // Cooldown timer
  useEffect(() => {
    let timer;
    if (status.resendCooldown > 0) {
      timer = setInterval(() => {
        setStatus((prev) => ({
          ...prev,
          resendCooldown: prev.resendCooldown - 1,
          canResend: prev.resendCooldown <= 1,
        }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status.resendCooldown]);

  // Close country dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isCountryDropdownOpen && !e.target.closest(".country-dropdown")) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCountryDropdownOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const startResendCooldown = () => {
    setStatus((prev) => ({ ...prev, canResend: false, resendCooldown: 60 }));
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setStatus((prev) => ({ ...prev, error: "", success: "" }));
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(value);
    setStatus((prev) => ({ ...prev, error: "", success: "" }));
  };

  const handleCountrySelect = (country) => {
    setSelectedCountryCode(country);
    setIsCountryDropdownOpen(false);
  };

  const getFullPhoneNumber = () =>
    `${selectedCountryCode.code}${formData.phoneNumber}`;

  const sendOtp = async () => {
    setStatus((prev) => ({ ...prev, isLoading: true, error: "", success: "" }));
    try {
      const fullPhone = inputMode === "phone" ? getFullPhoneNumber() : null;
      let result;

      if (authMode === "register") {
        result =
          inputMode === "email"
            ? await signUpWithEmail(formData.email, formData.fullName)
            : await signUpWithSms(fullPhone, formData.fullName);
      } else {
        result =
          inputMode === "email"
            ? await signInWithEmail(formData.email)
            : await signInWithSms(fullPhone);
      }

      const success = result?.success || result?.data?.status === "success";
      const message = result?.message || result?.data?.message;

      if (success) {
        setStatus((prev) => ({ ...prev, success: message, isLoading: false }));
        setStep(2);
        startResendCooldown();
      } else {
        setStatus((prev) => ({
          ...prev,
          error: message || "Something went wrong",
          isLoading: false,
        }));
      }
    } catch (err) {
      setStatus((prev) => ({
        ...prev,
        error:
          err?.response?.data?.message ||
          "Something went wrong. Please try again.",
        isLoading: false,
      }));
    }
  };

  const verifyOtp = async () => {
    setStatus((prev) => ({ ...prev, isLoading: true, error: "", success: "" }));
    try {
      const fullPhone = inputMode === "phone" ? getFullPhoneNumber() : null;
      const result =
        inputMode === "email"
          ? await verifyEmailOtp(formData.email, otp)
          : await verifySmsOtp(fullPhone, otp);

      const success = result?.success || result?.data?.status === "success";
      const message = result?.message || result?.data?.message;

      if (success) {
        setStatus((prev) => ({
          ...prev,
          success: "Authentication successful!",
          isLoading: false,
        }));
        setOtp("");
        setStep(1);
  
        setTimeout(() => {
          setStatus((prev) => ({
          ...prev,
          success: "",
        }));
          onSuccess();
          onClose();
        }, 1000);

      } else {
        setStatus((prev) => ({
          ...prev,
          error: message || "Invalid OTP",
          isLoading: false,
        }));
      }
    } catch {
      setStatus((prev) => ({
        ...prev,
        error: "Something went wrong. Please try again.",
        isLoading: false,
      }));
    }
  };

  const handleSubmit = () => {
    if (step === 1) {
      if (authMode === "register" && !formData.fullName.trim()) {
        setStatus((prev) => ({
          ...prev,
          error: "Full name is required for registration",
        }));
        return;
      }
      if (inputMode === "email" && !formData.email.trim()) {
        setStatus((prev) => ({ ...prev, error: "Email is required" }));
        return;
      }
      if (inputMode === "phone" && !formData.phoneNumber.trim()) {
        setStatus((prev) => ({ ...prev, error: "Phone number is required" }));
        return;
      }
      sendOtp();
    } else {
      if (!otp.trim()) {
        setStatus((prev) => ({ ...prev, error: "OTP is required" }));
        return;
      }
      verifyOtp();
    }
  };

  const switchAuthMode = () => {
    setAuthMode((prev) => (prev === "login" ? "register" : "login"));
    setStep(1);
    setStatus({
      error: "",
      success: "",
      isLoading: false,
      canResend: false,
      resendCooldown: 0,
    });
    setOtp("");
    setFormData({ fullName: "", email: "", phoneNumber: "" });
  };

  const switchInputMode = (mode) => {
    setInputMode(mode);
    setStep(1);
    setStatus({
      error: "",
      success: "",
      isLoading: false,
      canResend: false,
      resendCooldown: 0,
    });
    setOtp("");
    setFormData((prev) => ({
      ...prev,
      email: mode === "email" ? prev.email : "",
      phoneNumber: mode === "phone" ? prev.phoneNumber : "",
    }));
  };

  const goBack = () => {
    setStep(1);
    setStatus({
      error: "",
      success: "",
      isLoading: false,
      canResend: false,
      resendCooldown: 0,
    });
    setOtp("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex overflow-hidden">
        {/* Left: Image - Hidden on mobile, shown on larger screens */}
        <div className="hidden md:block lg:w-1/2 relative">
          <Image
            src={loginImg.src}
            alt="Auth Illustration"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Right: Auth Form */}
        <div className="w-full lg:w-1/2 flex flex-col max-h-fit overflow-y-auto">
          {/* Header with close button */}
          <div className="flex justify-between items-center pt-2 pb-0">
            {step === 2 && (
              <button
                onClick={goBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div className={step === 1 ? "ml-auto" : ""}>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
            {/* Header */}
            <div className="text-center mb-6 lg:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--primary-color)] mb-2">
                {step === 1
                  ? authMode === "login"
                    ? "Welcome Back"
                    : "Create Account"
                  : "Verify OTP"}
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                {step === 1
                  ? authMode === "login"
                    ? "Sign in to your account"
                    : "Join us for exclusive benefits"
                  : `Enter the OTP sent to your ${inputMode}`}
              </p>
            </div>

            {/* Status Messages */}
            {status.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-[var(--delete-color)] text-sm text-center">
                {status.error}
              </div>
            )}
            {status.success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm text-center">
                {status.success}
              </div>
            )}

            {/* Step 1: Input */}
            {step === 1 ? (
              <div className="space-y-6">
                {/* Toggle Phone / Email */}
                {/* <div className="mb-6">
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => switchInputMode("phone")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-md text-sm font-medium transition-all ${
                        inputMode === "phone"
                          ? "bg-white text-black shadow-sm"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      <Phone size={16} className="flex-shrink-0" /> 
                      <span className="hidden xs:inline">Phone</span>
                    </button>
                    <button
                      onClick={() => switchInputMode("email")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-md text-sm font-medium transition-all ${
                        inputMode === "email"
                          ? "bg-white text-black shadow-sm"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      <Mail size={16} className="flex-shrink-0" /> 
                      <span className="hidden xs:inline">Email</span>
                    </button>
                  </div>
                </div> */}

                {/* Form Fields */}
                <div className="space-y-4">
                  {authMode === "register" && (
                    <div className="relative">
                      <User
                        className="absolute left-3 top-12 transform -translate-y-1/2 text-gray-400 z-10"
                        size={18}
                      />
                      <Input
                        label="Full Name"
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className="pl-10"
                        required
                      />
                    </div>
                  )}
                  <div className="relative">
                      <Mail
                        className="absolute left-3 top-10 text-gray-400 z-10"
                        size={18}
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        className="pl-10"
                        required
                      />
                    </div>

                  {/* {inputMode === "email" ? (
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-10 text-gray-400 z-10"
                        size={18}
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        className="pl-10"
                        required
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="flex gap-2">
                        <div className="relative country-dropdown">
                          <button
                            type="button"
                            onClick={() =>
                              setIsCountryDropdownOpen((open) => !open)
                            }
                            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors min-w-[80px] sm:min-w-[100px]"
                          >
                            <span className="text-base sm:text-lg">
                              {selectedCountryCode.flag}
                            </span>
                            <span className="text-xs sm:text-sm font-medium">
                              {selectedCountryCode.code}
                            </span>
                            <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                          </button>
                          {isCountryDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1 w-64 sm:w-72 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                              {COUNTRY_CODES.map((country) => (
                                <button
                                  key={country.code}
                                  type="button"
                                  onClick={() => handleCountrySelect(country)}
                                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left text-sm"
                                >
                                  <span className="text-lg">
                                  {country.flag}
                                  </span>
                                  <span className="font-medium">
                                    {country.code}
                                  </span>
                                  <span className="text-gray-600 truncate">
                                    {country.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 relative">
                          <Phone
                            className="absolute left-3 top-1/2 transform -translate-y-1/2  text-gray-400 z-10"
                            size={18}
                          />
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            placeholder="Enter phone number"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                            required
                          />
                        </div>
                      </div>
                      {formData.phoneNumber && (
                        <p className="text-xs text-gray-500 mt-2">
                          Full number: {getFullPhoneNumber()}
                        </p>
                      )}
                    </div>
                  )} */}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={status.isLoading}
                  className="w-full bg-[var(--primary-color)] text-white py-3 sm:py-4 mt-6 rounded-lg hover:bg-[var(--primary-color)]/90 active:bg-[var(--primary-color)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                >
                  {status.isLoading
                    ? authMode === "register"
                      ? "Creating account..."
                      : "Sending OTP..."
                    : authMode === "register"
                    ? `Create Account with ${inputMode}`
                    : `Send OTP to ${inputMode}`}
                </button>

                <div className="text-center mt-6">
                  <p className="text-sm sm:text-base text-gray-600">
                    {authMode === "login"
                      ? "Don't have an account?"
                      : "Already have an account?"}
                    <button
                      onClick={switchAuthMode}
                      className="ml-1 text-black font-medium hover:underline focus:underline"
                    >
                      {authMode === "login" ? "Sign up" : "Sign in"}
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              /* Step 2: OTP Verification */
              <div className="space-y-6">
                <div className="space-y-4">
                  <Input
                    label="Enter OTP"
                    type="text"
                    name="otp"
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder="000000"
                    maxLength="6"
                    className="text-center text-lg sm:text-xl font-mono tracking-widest"
                    required
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={status.isLoading || !otp}
                    className="w-full bg-black text-white py-3 sm:py-4 rounded-lg hover:bg-gray-800 active:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ease-in-out cursor-pointer font-medium"
                  >
                    {status.isLoading ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
                
                <div className="text-center">
                  <button
                    onClick={sendOtp}
                    disabled={!status.canResend || status.isLoading}
                    className={`text-sm sm:text-base transition-colors ${
                      status.canResend
                        ? "text-black hover:underline focus:underline"
                        : "text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {status.resendCooldown > 0
                      ? `Resend OTP in ${status.resendCooldown}s`
                      : "Didn't receive OTP? Resend"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
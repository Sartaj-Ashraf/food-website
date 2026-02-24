import { customFetch } from "@/utils/customFetch";

// SMS Authentication Functions
export const customSignUpWithSms = async (phoneNumber, fullName, additionalData = {}) => {
    try {
        const { data } = await customFetch.post("/auth/signup-sms", {
            phoneNumber,
            fullName,
            ...additionalData,
        });
        return { data };
    } catch (error) {
        console.error("SMS Sign Up failed:", error);
        return { error };
    }
};

export const customSignInWithSms = async (phoneNumber) => {
    try {
        const { data } = await customFetch.post("/auth/signin-sms", {
            phoneNumber,
        });
        return { data };
    } catch (error) {
        console.error("SMS Sign In failed:", error);
        return { error };
    }
};

export const customVerifySmsOtp = async (phoneNumber, otp) => {
    try {
        const { data } = await customFetch.post("/auth/verify-sms-otp", {
            phoneNumber,
            otp,
        });
        return { data };
    } catch (error) {
        console.error("Verify SMS OTP failed:", error);
        return { error };
    }
};

// Email Authentication Functions
export const customSignUpWithEmail = async (email, fullName, additionalData = {}) => {
    try {
        const { data } = await customFetch.post("/auth/signup-email", {
            email,
            fullName,
            ...additionalData,
        });
        return { data };
    } catch (error) {
        console.error("Email Sign Up failed:", error);
        return { error };
    }
};

export const customSignInWithEmail = async (email, fullName = null) => {
    try {
        const { data } = await customFetch.post("/auth/signin-email", {
            email,
            ...(fullName && { fullName }),
        });
        return { data };
    } catch (error) {
        console.error("Email Sign In failed:", error);
        return { error };
    }
};

export const customVerifyEmailOtp = async (email, otp) => {
    try {
        const { data } = await customFetch.post("/auth/verify-email-otp", {
            email,
            otp,
        });
        return { data };
    } catch (error) {
        console.error("Verify email OTP failed:", error);
        return { error };
    }
};

export const customLogout = async () => {
    try {
        const { data } = await customFetch.get("/auth/logout");
        return { data };
    } catch (error) {
        console.error("Logout failed:", error);
        return { error };
    }
};
export const customCheckAuth = async () => {
    try {
        const { data } = await customFetch.get("/auth/check-auth");
        return { data };
    } catch (error) {
        console.error("Check auth failed:", error);
        return { error };
    }
};
export const customCheckLoggedInUser = async () => {
    try {
        const { data } = await customFetch.get("/auth/get-logged-in-user");
        return { data };
    } catch (error) {
        console.error("Check logged-in user failed:", error);
        return { error };
    }
};

// Legacy functions for backward compatibility (deprecated)
export const customSendSmsOtp = async (phoneNumber, fullName) => {
    console.warn("customSendSmsOtp is deprecated. Use customSignUpWithSms or customSignInWithSms instead.");
    return customSignUpWithSms(phoneNumber, fullName);
};

export const customSendEmailOtp = async (email, fullName) => {
    console.warn("customSendEmailOtp is deprecated. Use customSignUpWithEmail or customSignInWithEmail instead.");
    return customSignUpWithEmail(email, fullName);
};


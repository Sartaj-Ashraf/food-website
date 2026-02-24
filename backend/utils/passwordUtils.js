import bcrypt from "bcryptjs";


export const hashOtp = async (otp) =>{
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);
    return hashedOtp;
}

export const compareOtp = async (otp, hashedOtp) =>{
    const isMatch = await bcrypt.compare(otp, hashedOtp)
    return isMatch
}
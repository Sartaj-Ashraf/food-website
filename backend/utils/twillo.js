import twilio from "twilio";
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const sendOtp = async (phoneNumber) => {
  try {
  await client.verify.services(process.env.TWILIO_SERVICE_SID)
          .verifications.create({ to: `${phoneNumber}`, channel: 'sms' });
  } catch (err) {
    console.error('Error sending OTP:', err);
    throw new Error('Failed to send OTP');
  }
};

export const verifyOtp = async (phoneNumber, otp) => {
  try {
    const verification_check = await client.verify
      .services(process.env.TWILIO_SERVICE_SID)
      .verificationChecks.create({ to: `${phoneNumber}`, code: otp });
    if (verification_check.status === 'approved') {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error('Error verifying OTP:', err);
    throw new Error('Failed to verify OTP');
  }
};


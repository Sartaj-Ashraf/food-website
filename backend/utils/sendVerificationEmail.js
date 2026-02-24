import SendEmail from "./SendEmail.js";

const sendVerificationEmail = async ({ name, email, otp }) => {
  const html = `
    <div style="
      font-family: Arial, Helvetica, sans-serif;
      background-color: #f4f6f8;
      padding: 30px;
    ">
      <div style="
        max-width: 500px;
        margin: auto;
        background-color: #ffffff;
        border-radius: 8px;
        padding: 24px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      ">
        <h2 style="
          color: #333333;
          text-align: center;
          margin-bottom: 20px;
        ">
          Email Verification
        </h2>

        <p style="color: #555555; font-size: 14px;">
          Hello <strong>${name}</strong>,
        </p>

        <p style="color: #555555; font-size: 14px;">
          Please use the following OTP to verify your email address:
        </p>

        <div style="text-align: center; margin: 24px 0;">
          <span style="
            display: inline-block;
            font-size: 24px;
            letter-spacing: 4px;
            font-weight: bold;
            color: #ffffff;
            background-color: #5A432A;
            padding: 12px 24px;
            border-radius: 6px;
          ">
            ${otp}
          </span>
        </div>

        <p style="color: #777777; font-size: 13px;">
          This OTP is valid for a limited time. Do not share it with anyone.
        </p>

        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 24px 0;" />

        <!-- Moonlight branding -->
        <p style="
          color: #666666;
          font-size: 13px;
          text-align: center;
          margin-bottom: 6px;
        ">
          This email was sent by <strong>Moonlight</strong>
        </p>

        <p style="
          color: #999999;
          font-size: 12px;
          text-align: center;
          margin: 0;
        ">
          © ${new Date().getFullYear()} Moonlight. All rights reserved.
        </p>
      </div>
    </div>
  `;

  return SendEmail({
    to: email,
    subject: "Email Verification",
    html,
  });
};

export default sendVerificationEmail;

  // import nodemailer from "nodemailer";
  // import dotenv from "dotenv";
  // dotenv.config();

  // const SendEmail = async ({ to, subject, html }) => {
  //   const transporter = nodemailer.createTransport({
  //     service: "gmail", 
  //     auth: {
  //       user: process.env.EMAIL_USER,
  //       pass: process.env.EMAIL_PASS,
      
  //     },
  //   });

  //   await transporter.sendMail({
  //     from: "sartajashraf842@gmail.com",
  //     to,
  //     subject,
  //     html,
  //   });
  // };

  // export default SendEmail;

  import nodemailer from "nodemailer";
  import dotenv from "dotenv";
  dotenv.config();

  const SendEmail = async ({ to, subject, html }) => {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.hostinger.com", // default to Hostinger
        port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 465, // SSL
        secure: true, // true for 465, false for 587
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || "Your Company"}" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });

      console.log("✅ Email sent:", info.messageId);
    } catch (error) {
      console.error("❌ Error sending email:", error);
    }
  };

  export default SendEmail;

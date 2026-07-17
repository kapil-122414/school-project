const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_EMAIL_PASSWORD,
  },
});

// SMTP connection check
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ SMTP Verify Error:", error);
  } else {
    console.log("✅ SMTP Server is ready");
  }
});

const sendMail = async (Email, otp) => {
  try {
    console.log("========== EMAIL DEBUG ==========");
    console.log("To :", Email);
    console.log("SMTP User :", process.env.USER_EMAIL);
    console.log(
      "SMTP Password :",
      process.env.USER_EMAIL_PASSWORD ? "Loaded ✅" : "Missing ❌",
    );

    const info = await transporter.sendMail({
      from: '"Cut Edge" <cet@globaltravelglob.shop>',
      to: Email,
      subject: "Password Reset OTP",
      html: `
        <h2>Password Reset OTP</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
      `,
    });

    console.log("✅ Mail Sent Successfully");
    console.log("Message ID :", info.messageId);
    console.log("Response :", info.response);

    return info;
  } catch (error) {
    console.log("❌ Email Sending Error");
    console.log(error);

    throw error;
  }
};

module.exports = sendMail;

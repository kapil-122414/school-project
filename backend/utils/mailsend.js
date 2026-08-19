const nodemailer = require("nodemailer");

const BREVO_USER = process.env.USER_EMAIL;
const BREVO_PASS = process.env.USER_EMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: BREVO_USER,
    pass: BREVO_PASS,
  },
});


const sendMail = async (Email, otp) => {
  try {
    console.log(`Attempting to send email to ${Email}...`);
    const info = await transporter.sendMail({
      from: process.env.SENDER_EMAIL || '"Cut Edge" <cet@globaltravelglob.shop>',
      to: Email,
      subject: "Password Reset OTP",
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Verification</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px; -webkit-font-smoothing: antialiased;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e0e0e0;">
          <h2 style="color: #333333; margin-top: 0; font-size: 20px;">Password Reset Request</h2>
          <p style="color: #555555; font-size: 16px; line-height: 1.5;">
            We received a request to reset your account password. Please use the following One-Time Password (OTP) to complete the verification process:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; background-color: #f0f4f8; color: #1a73e8; font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 12px 30px; border-radius: 4px; border: 1px dashed #1a73e8;">
              ${otp}
            </span>
          </div>
          <p style="color: #666666; font-size: 14px; line-height: 1.5;">
            This security code is valid for <strong>5 minutes</strong>. If you did not request this change, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
          <p style="color: #999999; font-size: 12px; text-align: center; margin-bottom: 0;">
            This is an automated message, please do not reply directly to this email.
          </p>
        </div>
      </body>
      </html>
    `,
    });
    console.log("Email sent successfully! Message ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
};
module.exports = sendMail;

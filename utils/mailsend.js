const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4, // 👈 yaha add karo
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async (Email, otp) => {
  await transporter.sendMail({
    from: process.env.USER_EMAIL,
    to: Email,
    subject: "password reset otp",

    html: `
        <h2>Password Reset</h2>

        <p>Your OTP is:</p>

        <h1>${otp}</h1>

        <p>This OTP will expire in 5 minutes.</p>
    `,
  });
};
module.exports = sendMail;

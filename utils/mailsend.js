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
transporter.verify((err) => {
  if (err) {
    console.log("SMTP Error:", err);
  } else {
    console.log("SMTP Ready");
  }
});

const sendMail = async (Email, otp) => {
  const info = await transporter.sendMail({
    from: '"Cut Edge" <cet@globaltravelglob.shop>',
    replyTo: "cet@globaltravelglob.shop",
    to: Email,
    subject: "Password Reset OTP",
    html: `
      <h2>Password Reset OTP</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP will expire in 5 minutes.</p>
    `,
  });

  console.log("Mail Info:", info);

  return info;
};
module.exports = sendMail;
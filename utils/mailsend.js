const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});
transporter.verify((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("SMTP Ready");
  }
});

await transporter.sendMail({
  from: process.env.BREVO_USER,
  to: Email,
  subject: "Password Reset OTP",
  html: `
    <h2>Password Reset</h2>
    <h1>${otp}</h1>
    <p>This OTP will expire in 5 minutes.</p>
  `,
});
module.exports = sendMail;

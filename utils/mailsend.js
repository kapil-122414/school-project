const nodemailer = require("nodemailer");
const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  service: "gmail",
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});
transporter.verify((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("SMTP Ready");
  }
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

require('dotenv').config();
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_EMAIL_PASSWORD
    }
});
transporter.verify((err, success) => {
    if (err) console.error('Error:', err.message);
    else console.log('Server is ready to take our messages');
    process.exit(0);
});

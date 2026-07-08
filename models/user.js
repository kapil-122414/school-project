const { Schema, model } = require("mongoose");

const Register = new Schema(
  {
    Email: {
      type: String,
      required: true,
      unique: true,
    },
    Password: {
      type: String,
      required: true,
    },
    referenceToken: {
      type: String,
      default: null,
    },
    otp: {
      type: String,
      default: null,
    },
    otpexpire: {
      type: String,
      default: null,
    },
    otpCount: {
      type: Number,
      default: 0,
    },
    resetToken: {
      type: String,
    },
    resetTokenExpire: {
      type: String,
    },
    otpDate: {
      type: Date,
    },

    lastOtpSentAt: {
      type: Date,
    },
  },

  {
    timestamps: true,
  },
);

module.exports = model("user", Register);

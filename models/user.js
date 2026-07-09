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
      type: Date,
      default: null,
    },
    resetTokenExpire: {
      type: Date,
      default: null,
    },
    otpDate: {
      type: Date,
    },
    otpverify: {
      type: Boolean,
      default: false,
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

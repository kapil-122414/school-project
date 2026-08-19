const { Schema, model } = require("mongoose");

const Register = new Schema(
  {
    Email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
    },
    Password: {
      type: String,
      required: true,
    },





    accessToken: {
      type: String,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    otp: {
      type: String,
      default: null,
    },
    remember_Me: {
      type: Boolean,
      default: false,
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
      default: null,
    },
    resetTokenExpire: {
      type: String,
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
    fcmToken: {
      type: String,
      default: "",
    },
  },

  {
    timestamps: true,
  },
);

module.exports = model("user", Register);

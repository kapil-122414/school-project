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
  },

  {
    timestamps: true,
  },
);

module.exports = model("user", Register);

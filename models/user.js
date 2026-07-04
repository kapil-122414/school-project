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
  },

  {
    timestamps: true,
  },
);

module.exports = model("user", Register);

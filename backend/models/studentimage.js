const mongoose = require("mongoose");

const studentimg = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },

    public_id: {
      type: String,
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "newAdmission",
      default: null,
    },

    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "institude",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("studentImg", studentimg);

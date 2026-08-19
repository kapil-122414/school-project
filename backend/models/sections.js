const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");
const Sections = new Schema(
  {
    sectionName: {
      type: String,
      required: true,
      trim: true,
      match: /^[A-Z]$/,
    },
    capacity: {
      type: String,
      required: true,
      min: 20,
      max: 40,
    },
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "institude",
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "program",
    },
  },
  {
    timestamp: true,
  },
);

module.exports = model("section", Sections);

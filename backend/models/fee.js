const { Schema, model } = require("mongoose");

const feeSchema = new Schema(
  {
    createby: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    program: {
      type: Schema.Types.ObjectId,
      ref: "addprogram",
      required: true,
    },
    planName: {
      type: String,
      required: true,
      trim: true,
    },
    application: {
      type: String,
      required: true,
    },
    feeComponent: {
      type: Map,
      of: Number,
      default: {},
    },
    otherSetting: {
      discountType: {
        type: String,
        enum: ["none", "fixed", "percentage"],
        default: "none",
      },
      discount: {
        type: Number,
        default: 0,
      },
      tax: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true },
);

module.exports = model("fee", feeSchema);
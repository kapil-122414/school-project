const { Schema, model } = require("mongoose");
const institudeSchema = new Schema(
  {
    institudeName: {
      type: String,
      required: true,
    },
    institudeType: {
      type: String,
      enum: ["School", "College", "Coaching", "University"],
    },
    institudeId: {
      type: String,
      unique: true,
    },
    institudeLogo: {
      URL: String,
      public_id: String,
    },
    institudeEmail: {
      type: String,
    },
    institudeNumber: {
      type: Number,
    },
    website: String,
    address: {
      country: String,
      state: String,
      city: String,
      pincode: String,
      fullAddress: String,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      default: "Active",
    },
  },
  { timestamps: true },
);

module.exports = model("institude", institudeSchema);

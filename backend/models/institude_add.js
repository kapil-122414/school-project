const { Schema, model } = require("mongoose");
const instituteSchema = new Schema(
  {
    instituteName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
      minlength: 5,
    },
    instituteType: {
      type: String,
      enum: ["School", "College", "Coaching", "University"],
      required: true,
    },
    instituteId: {
      type: String,
      unique: true,

      required: true,
      trim: true,
    },
    instituteLogo: {
      URL: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
    createby: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    instituteNumber: {
      type: String,
      required: true,
      trim: true,
      match: [/^[0-9]{10}$/, "Invalid phone number"],
    },
    website: String,
    address: {
      country: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
      fullAddress: {
        type: String,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      default: "Active",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = model("institude", instituteSchema);

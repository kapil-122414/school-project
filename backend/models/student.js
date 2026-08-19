const { Schema, model } = require("mongoose");

const studentSchema = new Schema(
  {
    institute: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "institude",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    avatar: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
    parentInf: {
      father: { type: String, trim: true, default: "" },
      mother: { type: String, trim: true, default: "" },
      mobileNumber: {
        type: String,
        match: [/^[0-9]{10}$/, "Invalid phone number"],
        default: "",
      },
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      default: "Active",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true },
);

studentSchema.index({ institute: 1, name: 1 });

module.exports = model("Student", studentSchema);
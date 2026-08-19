const { Schema, model } = require("mongoose");

const admissionSchema = new Schema(
  {
    institute: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "institude",
    },
    student: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Student",
    },
    academicInf: {
      session: {
        type: String,
        required: true,
        match: [/^\d{4}(-\d{2,4})?$/, "Invalid session format (e.g., 2025-26)"],
      },
      program: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "program",
      },
      section: {
        type: Schema.Types.ObjectId,
        ref: "section",
        default: null,
      },
      rollNo: {
        type: String,
        trim: true,
      },
    },
    feeInf: {
      feePlan: {
        type: Schema.Types.ObjectId,
        ref: "fee",
      },
      totalfee: { type: String, default: "0" },
      discount: { type: String, default: "0" },
      payable: { type: String, default: "0" },
    },
    status: {
      type: String,
      enum: [
        "Active",
        "Inactive",
        "Suspended",
        "Promoted",
        "Graduated",
        "Transferred",
      ],
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

admissionSchema.index(
  { institute: 1, student: 1, "academicInf.session": 1 },
  { unique: true },
);

admissionSchema.index(
  { institute: 1, "academicInf.session": 1, "academicInf.rollNo": 1 },
  { unique: true, sparse: true },
);

module.exports = model("Admission", admissionSchema);

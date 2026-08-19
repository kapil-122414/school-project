const { Schema, model, default: mongoose } = require("mongoose");

const addProgram = new Schema(
  {
    intituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "institude",
      required: true,
    },
    program: {
      type: String,
      required: true,
    },
    shortName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);
addProgram.index(   


  
  {
    intituteId: 1,
    program: 1,
  },
  {
    unique: true,
  },
);
module.exports = model("program", addProgram);

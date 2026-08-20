const fees = require("../models/fee");
const programs = require("../models/addprogram");
const institute = require("../models/institude_add");
// const feePlan = async (req, res) => {
//   try {
//     const userid = req.user.Id;
//     const data = req.body;

//     const instituteFind = await institute.findOne({
//       createby: userid,
//     });

//     if (!instituteFind) {
//       return res.status(404).json({
//         success: false,
//         message: "Institute not found",
//       });
//     }

//     const programFind = await programs.findOne({
//       intituteId: instituteFind._id,
//     });

//     if (!programFind) {
//       return res.status(404).json({
//         success: false,
//         message: "Program not found",
//       });
//     }
//     data.createby = userid;
//     const save = await fees.create(data);

//     return res.status(201).json({
//       success: true,
//       message: "Fee Plan Created",
//       feeId: save._id,
//       data: save,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
// const feeComponent = async (req, res) => {
//   try {
//     const feeId = req.params.feeId;

//     const save = await fees.findByIdAndUpdate(
//       feeId,
//       {
//         $set: {
//           feeComponent: req.body.feeComponent,
//         },
//       },
//       {
//         new: true,
//         runValidators: true,
//       },
//     );

//     if (!save) {
//       return res.status(404).json({
//         success: false,
//         message: "Fee Plan not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Fee Component Updated",
//       data: save,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// const otherSetting = async (req, res) => {
//   try {
//     const feeId = req.params.feeId;

//     const save = await fees.findByIdAndUpdate(
//       feeId,
//       {
//         $set: {
//           otherSetting: req.body.otherSetting,
//         },
//       },
//       {
//         new: true,
//         runValidators: true,
//       },
//     );

//     if (!save) {
//       return res.status(404).json({
//         success: false,
//         message: "Fee Plan not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Other Setting Updated",
//       data: save,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

const createFeePlan = async (req, res) => {
  try {
    const userId = req.user.Id;

    const { program, planName, application, feeComponent, otherSetting } =
      req.body;

    if (!program) {
      return res.status(400).json({
        success: false,
        message: "Program is required",
      });
    }

    if (!planName || !planName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Plan name is required",
      });
    }

    if (!application) {
      return res.status(400).json({
        success: false,
        message: "Application type is required",
      });
    }

    if (!feeComponent || Object.keys(feeComponent).length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one fee component is required",
      });
    }

    const instituteFind = await institute.findOne({
      createby: userId,
    });

    if (!instituteFind) {
      return res.status(404).json({
        success: false,
        message: "Institute not found",
      });
    }

    const programFind = await programs.findOne({
      _id: program,
      intituteId: instituteFind._id,
    });

    if (!programFind) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    const existPlan = await fees.findOne({
      createby: userId,
      program,
      planName: planName.trim(),
    });

    if (existPlan) {
      return res.status(400).json({
        success: false,
        message: "Fee plan already exists",
      });
    }

    for (const [key, value] of Object.entries(feeComponent)) {
      if (!key.trim()) {
        return res.status(400).json({
          success: false,
          message: "Fee component name cannot be empty",
        });
      }

      if (typeof value !== "number" || value < 0) {
        return res.status(400).json({
          success: false,
          message: `${key} must be a valid amount`,
        });
      }
    }

    if (otherSetting) {
      if (
        otherSetting.discounttype &&
        !["percentage", "fixed"].includes(otherSetting.discounttype)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid discount type",
        });
      }

      if (
        otherSetting.discount != null &&
        (otherSetting.discount < 0 || otherSetting.discount > 100)
      ) {
        return res.status(400).json({
          success: false,
          message: "Discount must be between 0 and 100",
        });
      }

      if (
        otherSetting.tax != null &&
        (otherSetting.tax < 0 || otherSetting.tax > 100)
      ) {
        return res.status(400).json({
          success: false,
          message: "Tax must be between 0 and 100",
        });
      }
    }

    const save = await fees.create({
      createby: userId,
      program,
      planName: planName.trim(),
      application,
      feeComponent,
      otherSetting,
    });

    return res.status(201).json({
      success: true,
      message: "Fee Plan Created Successfully",
      data: save,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getplan = async (req, res) => {
  try {
    const userid = req.user.Id;
    if (!userid) {
      return res
        .status(401)
        .json({ success: false, message: "user not found" });
    }
    let filter = { createby: userid };
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 4;
    let skip = (page - 1) * limit;
    let search = req.query.search || "";
    if (search) {
      filter["feePlan.planName"] = {
        $regex: search,
        $options: "i",
      };
    }
    const data = await fees
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const enrichedData = data.map((item) => {
      const doc = item.toObject();
      const feeComponent = item.feeComponent;

      let totalfee = 0;
      let components = [];

      if (feeComponent instanceof Map) {
        totalfee = Array.from(feeComponent.values()).reduce(
          (sum, val) => sum + val,
          0,
        );
        components = Array.from(feeComponent.entries()).map(
          ([name, amount]) => ({ name, amount }),
        );
      } else if (feeComponent && typeof feeComponent === "object") {
        totalfee = Object.values(feeComponent).reduce(
          (sum, val) => sum + Number(val),
          0,
        );
        components = Object.entries(feeComponent).map(([name, amount]) => ({
          name,
          amount: Number(amount),
        }));
      }

      const discount = item.otherSetting?.discount || 0;
      const payable = Math.max(0, totalfee - discount);

      return {
        ...doc,
        planName: item.feePlan?.planName,
        name: item.feePlan?.planName,
        program: item.feePlan?.program,
        application: item.feePlan?.application,
        totalfee,
        totalAmount: totalfee,
        discount,
        payable,
        payableAmount: payable,
        components,
      };
    });

    const totalItem = await fees.countDocuments(filter);
    const totalPages = Math.ceil(totalItem / limit);
    return res.status(200).json({
      success: true,
      data: enrichedData,
      page: page,
      limit,
      totalPages,
      totalItem,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
const getplanId = async (req, res) => {
  try {
    const userid = req.user.Id;
    if (!userid) {
      return res
        .status(401)
        .json({ success: false, message: "user not found" });
    }
    const feeid = req.params.feeId;

    if (!feeid) {
      return res
        .status(401)
        .json({ success: false, message: "feeID not found" });
    }
    const data = await fees.findById({ _id: feeid });

    const totalFee = Array.from(data.feeComponent.values()).reduce(
      (sum, value) => sum + value,
      0,
    );

    let discountAmount = 0;

    if (data.otherSetting.discountType === "percentage") {
      discountAmount = (totalFee * data.otherSetting.discount) / 100;
    } else if (data.otherSetting.discountType === "fixed") {
      discountAmount = data.otherSetting.discount;
    }

    const afterDiscount = Math.floor(totalFee - discountAmount);

    const taxAmount = Math.floor((afterDiscount * data.otherSetting.tax) / 100);

    const payable = afterDiscount + taxAmount;

    let components = [];
    const feeComponent = data.feeComponent;
    if (feeComponent instanceof Map) {
      components = Array.from(feeComponent.entries()).map(([name, amount]) => ({
        name,
        amount,
      }));
    } else if (feeComponent && typeof feeComponent === "object") {
      components = Object.entries(feeComponent).map(([name, amount]) => ({
        name,
        amount: Number(amount),
      }));
    }

    const enriched = {
      ...data.toObject(),
      planName: data.feePlan?.planName,
      name: data.feePlan?.planName,
      program: data.feePlan?.program,
      application: data.feePlan?.application,
      totalfee: totalFee,
      totalAmount: totalFee,
      discount: data.otherSetting?.discount || 0,
      payable,
      payableAmount: payable,
      components,
    };

    return res.status(200).json({
      success: true,
      total: totalFee,
      discount: afterDiscount,
      taxAmount: taxAmount,
      payable: payable,
      data: enriched,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
const updatebyid = async (req, res) => {
  try {
    const userId = req.user.Id;
    const feeId = req.params.feeId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!feeId) {
      return res.status(400).json({
        success: false,
        message: "Fee Id is required",
      });
    }

    const feePlan = await fees.findById(feeId);

    if (!feePlan) {
      return res.status(404).json({
        success: false,
        message: "Fee plan not found",
      });
    }

    const { feeComponent, otherSetting } = req.body;

    if (feeComponent) {
      for (let [key, value] of Object.entries(feeComponent)) {
        value = Number(value);
        if (typeof value !== "number" || value < 0) {
          return res.status(400).json({
            success: false,
            message: `${key} must be a positive number`,
          });
        }
      }
    }

    if (otherSetting) {
      const { discountType, discount, tax } = otherSetting;

      if (
        discountType &&
        !["none", "fixed", "percentage"].includes(discountType)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid discount type",
        });
      }

      if (discount !== undefined && discount < 0) {
        return res.status(400).json({
          success: false,
          message: "Discount cannot be negative",
        });
      }

      if (discountType === "percentage" && discount > 100) {
        return res.status(400).json({
          success: false,
          message: "Percentage discount cannot exceed 100",
        });
      }

      if (tax !== undefined && (tax < 0 || tax > 100)) {
        return res.status(400).json({
          success: false,
          message: "Tax must be between 0 and 100",
        });
      }
    }

    const updatedFeePlan = await fees.findByIdAndUpdate(feeId, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Fee plan updated successfully",
      data: updatedFeePlan,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  getplan,
  getplanId,
  updatebyid,
  createFeePlan,
};

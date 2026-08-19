const programschema = require("../models/addprogram");
const institute = require("../models/institude_add");
const section = require("../models/sections");
const student = require("../models/admission");

const addProgram = async (req, res) => {
  try {
    const userId = req.user.Id;

    const { program, shortName, description, status, ...extraFields } =
      req.body;

    console.log(req.body);
    if (Object.keys(extraFields).length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid fields: ${Object.keys(extraFields).join(", ")}`,
      });
    }

    const findInstitude = await institute.findOne({
      createby: userId,
    });

    if (!findInstitude) {
      return res.status(400).json({
        success: false,
        message: "Please add institute first",
      });
    }

    if (!program || !program.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter program name",
      });
    }

    if (!shortName || !shortName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter shortName",
      });
    }

    if (description && typeof description !== "string") {
      return res.status(400).json({
        success: false,
        message: "Description must be string",
      });
    }

    if (status && !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive",
      });
    }

    const save = await programschema.create({
      intituteId: findInstitude._id,
      program: program.trim(),
      shortName: shortName.trim(),
      description: description?.trim() || "",
      status: status || "active",
    });

    res.status(201).json({
      success: true,
      message: "Program added successfully",
      data: save,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Program already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getprogram = async (req, res) => {
  try {
    let filter = {};

    const userid = req.user.Id;

    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 4;
    let skip = (page - 1) * limit;
    let search = req.query.search || "";

    if (search) {
      filter.program = {
        $regex: search,
        $options: "i",
      };
    }

    const findInstitude = await institute.findOne({
      createby: userid,
    });

    if (!findInstitude) {
      return res.status(404).json({
        success: false,
        message: "Institute not found",
      });
    }

    filter.intituteId = findInstitude._id;

    const programs = await programschema
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const data = await Promise.all(
      programs.map(async (item) => {
        const totalStudents = await student.countDocuments({
          institute: findInstitude._id,
          "academicInf.program": item._id,
        });

        const totalSection = await section.countDocuments({
          institute: findInstitude._id,
          program: item._id,
        });

        return {
          ...item.toObject(),
          totalStudents,
          totalSection,
        };
      }),
    );

    const totalItems = await programschema.countDocuments(filter);

    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      success: true,
      message: "Programs fetched successfully",
      data,
      page,
      totalItem: totalItems,
      totalPages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getprogrambyId = async (req, res) => {
  try {
    const userId = req.user.Id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const findInstitute = await institute.findOne({
      createby: userId,
    });

    if (!findInstitute) {
      return res.status(404).json({
        success: false,
        message: "Institute not found",
      });
    }

    const id = req.params.Id;

    const program = await programschema.findById(id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    const totalStudents = await student.countDocuments({
      institute: findInstitute._id,
      "academicInf.program": program._id,
    });

    const sections = await section.find({
      institute: findInstitute._id,
      program: program._id,
    });

    const totalSection = sections.length;

    const sectionData = await Promise.all(
      sections.map(async (sec) => {
        const totalStudents = await student.countDocuments({
          institute: findInstitute._id,
          "academicInf.section": sec._id,
        });

        return {
          sectionName: sec.sectionName,
          totalStudents,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      message: "Program details fetched successfully",
      data: {
        description: program.description,
        status: program.status,
        programname: program.program,
        shortName: program.shortName,
        totalStudents,
        totalSection,
        sections: sectionData,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const editprogram = async (req, res) => {
  try {
    const userId = req.user.id;
    const programId = req.params.id;

    const findInstitute = await Institute.findOne({
      createby: userId,
    });

    if (!findInstitute) {
      return res.status(404).json({
        success: false,
        message: "Institute not found",
      });
    }

    const findProgram = await Program.findOne({
      _id: programId,
      intituteId: findInstitute._id,
    });

    if (!findProgram) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    const update = await Program.findByIdAndUpdate(programId, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Program updated successfully",
      data: update,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Program already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { addProgram, getprogram, editprogram, getprogrambyId };

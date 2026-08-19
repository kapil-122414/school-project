const section = require("../models/sections");
const programModule = require("../models/addprogram");


const addSection = async (req, res) => {
  try {
    const userid = req.user.Id;
    const { sectionName, program, capacity, ...extraFields } = req.body;
    const findprogram = await programModule.findOne({
      _id: program,
    });

    if (!userid) {
      return res
        .status(401)
        .json({ success: false, message: "user not found" });
    }

    if (Object.keys(extraFields).length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid fields: ${Object.keys(extraFields).join(", ")}`,
      });
    }
    const alreadyExist = await section.findOne({
      sectionName,
      program,
    });

    if (alreadyExist) {
      return res.status(409).json({
        success: false,
        message: "Section already exists",
      });
    }
    if (!program) {
      return res
        .status(401)
        .json({ success: false, message: "program not found" });
    }
    const sectionmatch = /^[A-Z]$/;
    if (!sectionmatch.test(sectionName)) {
      return res.status(401).json({
        success: false,
        message: "Section name must be a single uppercase letter",
      });
    }
    if (
      capacity === undefined ||
      capacity === null ||
      capacity < 20 ||
      capacity > 40
    ) {
      return res.status(401).json({
        success: false,
        message: "Capacity must be between 20 and 40",
      });
    }
    const data = await section.create({
      sectionName,
      program,
      capacity,
      institute: findprogram.intituteId,
    });

    return res.status(201).json({ success: true, message: "success", data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const showSection = async (req, res) => {
  try {
    const userid = req.user.Id;
    const programId = req.params._id;

    let filter = { program: programId };
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 4;
    let skip = (page - 1) * limit;
    let search = req.query.search || "";
    if (search) {
      filter.sectionName = { $regex: search, $options: "i" };
    }
    const findsection = await section
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalItems = await section.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);
    return res.status(200).json({
      success: true,
      data: findsection,
      page: page,
      totalItem: totalItems,
      totalPages: totalPages,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addSection, showSection };

const institute = require("../models/institude_add");
const cloudinary = require("../config/cloudinary");

const addInstitude = async (req, res) => {
  try {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Data not found" });
    }

    const { instituteNumber, instituteName, instituteId, address } = data;

    console.log(instituteId);
    if (!instituteName) {
      return res
        .status(400)
        .json({ success: false, message: "instituteName required" });
    }
    const phoneRegex = /^[0-9]{10}$/;

    if (!phoneRegex.test(instituteNumber)) {
      return res
        .status(400)
        .json({ success: false, message: "number not valid" });
    }
    if (!instituteId) {
      return res
        .status(400)
        .json({ success: false, message: "instituteid required " });
    }
    const findInstitude = await institute.findOne({
      instituteId: instituteId,
    });
    if (findInstitude) {
      return res
        .status(400)
        .json({ success: false, message: "institute id valid " });
    }

    if (!address) {
      return res
        .status(400)
        .json({ success: false, message: "address required" });
    }
    if (!address.country) {
      return res
        .status(400)
        .json({ success: false, message: "country not valid" });
    }
    if (!address.state) {
      return res
        .status(400)
        .json({ success: false, message: "state not valid" });
    }
    if (!address.city) {
      return res
        .status(400)
        .json({ success: false, message: "city not valid" });
    }
    if (!address.pincode) {
      return res
        .status(400)
        .json({ success: false, message: "pincode not valid" });
    }
    if (!address.fullAddress) {
      return res
        .status(400)
        .json({ success: false, message: "fullAddress not valid" });
    }
    if (req.file) {
      data.instituteLogo = {
        Url: req.file.path,
        public_id: req.file.filename,
      };
    }

    data.createby = req.user.Id;
    const save = await institute.create(data);
    res.status(201).json({ success: true, message: "success data" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const showInstitude = async (req, res) => {
  try {
    let filter = {
      createby: req.user.Id,
    };
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 4;
    let skip = (page - 1) * limit;
    let search = req.query.search || "";

    if (search) {
      filter.instituteName = {
        $regex: search,
        $options: "i",
      };
    }
    const data = await institute
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalItems = await institute.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);
    res.status(200).json({
      success: true,
      message: "sucess",
      data,
      page,
      limit,
      totalPages,
      totalItems,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const updateInstitute = async (req, res) => {
  try {
    const userid = req.user.Id;
    const data = req.body;
    const fileImg = req.file;

    if (!userid) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const findInstitute = await institute.findOne({
      createby: userid,
    });

    if (!findInstitute) {
      return res.status(404).json({
        success: false,
        message: "Institute not found",
      });
    }

    if (fileImg) {
      if (findInstitute.instituteLogo?.public_id) {
        await cloudinary.uploader.destroy(
          findInstitute.instituteLogo.public_id,
        );
      }
      data.instituteLogo = {
        URL: fileImg.path,
        public_id: fileImg.filename,
      };
    }

    const save = await institute.findOneAndUpdate({ createby: userid }, data, {
      new: true,
      runValidators: true,
    });
    return res.status(200).json({
      success: true,
      message: "Institute updated successfully",
      data: save,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = { addInstitude, showInstitude, updateInstitute };

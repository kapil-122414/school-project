const institude = require("../models/institude_add");
const cloudinary = require("../config/cloudinary");

const addInstitude = async (req, res) => {
  try {
    const data = req.body;
    console.log(data);

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        message: "Data not found",
      });
    }

    const findInstitude = await institude.findOne({
      institudeName: data.institudeName,
    });
    if (findInstitude) {
      return res.status(400).json({ message: "institude already exit  " });
    }
      if (req.file) {
      data.institudeLogo = {
        URL: req.file.path,
        
      };
    }

    const save = await institude.create(data);
    res.status(200).json({ message: "success data" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { addInstitude };

const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const {
  CloudinaryStorage,
} = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "institutes",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

module.exports = multer({ storage });
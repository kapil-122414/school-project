const express = require("express");

const router = express.Router();
const authmiddleware = require("../middelware/auth.middleware");

const upload = require("../middelware/upload.middleware");
const {
  addInstitude,
  showInstitude,
  updateInstitute,
} = require("../controllers/institude.controller");
router.post(
  "/institute",
  authmiddleware,
  upload.single("instituteLogo"),
  addInstitude,
);
router.get("/my-institute", authmiddleware, showInstitude);
router.patch(
  "/edit-institutes",
  authmiddleware,
  upload.single("instituteLogo"),
  updateInstitute,
);

module.exports = router;

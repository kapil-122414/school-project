const express = require("express");
const upload = require("../middelware/upload.middleware");
const router = express.Router();
const { addInstitude } = require("../controllers/institude.controller");
router.post("/addinstitude", upload.single("institudeLogo"), addInstitude);

module.exports = router;

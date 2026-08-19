const express = require("express");
const router = express.Router();
const auth = require("../middelware/auth.middleware");
const {
  addSection,
  showSection,
} = require("../controllers/section.controller");

router.post("/section", auth, addSection);
router.get("/sections/:_id", auth, showSection);

module.exports = router;

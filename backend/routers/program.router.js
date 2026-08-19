const express = require("express");
const router = express.Router();
const authmiddleware = require("../middelware/auth.middleware");
// const ratelimit = require("../middelware/ratelimit.middleware");
const {
  addProgram,
  getprogram,
  editprogram,
  getprogrambyId,
} = require("../controllers/program.controller");

router.post("/program", authmiddleware, addProgram);
router.get("/programs", authmiddleware, getprogram);
router.patch("/editprograms/:id", authmiddleware, editprogram);
router.get("/program/:Id", authmiddleware, getprogrambyId);

module.exports = router;

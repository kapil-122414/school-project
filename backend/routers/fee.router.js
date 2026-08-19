const express = require("express");
const router = express.Router();

const auth = require("../middelware/auth.middleware");

const {
  // feePlan,
  // feeComponent,
  // otherSetting,
  createFeePlan,

  getplan,
  getplanId,
  updatebyid,
  
} = require("../controllers/fee.controller");

router.post("/fee", auth, createFeePlan);

// router.patch("/fee/:feeId/component", auth, feeComponent);

// router.patch("/fee/:feeId/setting", auth, otherSetting);
router.get("/fee-plan", auth, getplan);

router.get("/fee/:feeId", auth, getplanId);
router.patch("/fee/update/:feeId", auth, updatebyid);
module.exports = router;

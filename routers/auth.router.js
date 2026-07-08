const express = require("express");
const router = express.Router();
const auth = require("../middelware/auth.middleware");
const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  otpVerify,
  updatePassword,
} = require("../controllers/auth.controller");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/otp-verify", otpVerify);
router.patch("/update-password", updatePassword);

router.get("/profile", auth, (req, res) => {
  res.json({
    message: "Profile Data",
    user: req.user,
  });
});

module.exports = router;

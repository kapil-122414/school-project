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
  saveFcmToken,
  refreshToken,
  verificationToken,
} = require("../controllers/auth.controller");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", auth, logoutUser);

router.post("/forgotPassword", forgotPassword);
router.post("/otpVerify", otpVerify);
router.patch("/updatePassword", updatePassword);
router.post("/saveFcmToken", auth, saveFcmToken);
router.post("/refreshToken", refreshToken);
router.post("/verificationToken", verificationToken);

router.get("/profile", auth, (req, res) => {
  res.json({
    message: "Profile Data",
    user: req.user,
  });
});

module.exports = router;

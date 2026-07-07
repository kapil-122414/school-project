const express = require("express");
const router = express.Router();
const auth = require("../middelware/auth.middleware");
const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
} = require("../controllers/auth.controller");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);

router.get("/profile", auth, (req, res) => {
  res.json({
    message: "Profile Data",
    user: req.user,
  });
});

module.exports = router;

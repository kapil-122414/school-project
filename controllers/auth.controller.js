const jwt = require("jsonwebtoken");
const user = require("../models/user");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendMail = require("../utils/mailsend");

const registerUser = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
      return res.status(400).json({
        message: "Email and Password are required",
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(Email)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }
    if (Password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }
    const Emailfind = await user.findOne({ Email: Email });

    if (Emailfind) {
      return res.status(400).json({ message: "Email are   register" });
    }
    const bcryptpassword = await bcrypt.hash(Password, 10);

    const data = await user.create({ Email, Password: bcryptpassword });

    res.status(200).json({ message: "success", data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    const findEmail = await user.findOne({ Email: Email });
    console.log(findEmail);
    if (!findEmail) {
      return res.status(404).json("Email not found");
    }
    const passwordcheck = await bcrypt.compare(Password, findEmail.Password);

    if (!passwordcheck) {
      return res.status(400).json({ message: "enter correct password" });
    }

    const Token = jwt.sign(
      {
        Email: Email,
        Id: findEmail.id,
        createdAt: findEmail.createdAt,
        updatedAt: findEmail.updatedAt,
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" },
    );

    const refreshToken = jwt.sign(
      {
        Email: Email,
        Id: findEmail.id,
        createdAt: findEmail.createdAt,
        updatedAt: findEmail.updatedAt,
      },
      process.env.REFERENCE_KEY,

      { expiresIn: "7d" },
    );

    findEmail.refreshToken = refreshToken;
    await findEmail.save();

    res.cookie("token", Token, {
      httpOnly: true,
      secure: false, // localhost ke liye
      sameSite: "Lax",
      maxAge: 60 * 60 * 1000,
      path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
    });

    res.status(200).json({ message: "success", Token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    const id = req.body.Id;

    const find = await user.findById(id);

    find.refreshToken = null;
    await find.save();

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json("success");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { Email } = req.body;

    const findEmail = await user.findOne({ Email });

    if (!findEmail) {
      return res.status(400).json({ message: "Email not found" });
    }

    const today = new Date();
    if (
      !findEmail.otpDate ||
      findEmail.otpDate.toDateString() !== today.toDateString()
    ) {
      findEmail.otpCount = 0;
    }

    if (findEmail.otpCount >= 5) {
      return res.status(400).json({
        message: "You have reached today's OTP limit. Try again tomorrow.",
      });
    }

    if (
      findEmail.lastOtpSentAt &&
      Date.now() - findEmail.lastOtpSentAt.getTime() < 60 * 1000
    ) {
      return res.status(429).json({
        message: "Please wait 60 seconds before requesting another OTP.",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const resetToken = crypto.randomBytes(32).toString("hex");

    findEmail.otpCount += 1;
    findEmail.otpDate = today;
    findEmail.lastOtpSentAt = new Date();
    findEmail.otp = otp;
    findEmail.resetToken = resetToken;
    findEmail.otpexpire = Date.now() + 5 * 60 * 1000;
    findEmail.resetTokenExpire = Date.now() + 10 * 60 * 1000;

    await sendMail(Email, otp);
    await findEmail.save();

    res.status(200).json({ message: " Otp send success", resetToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const otpVerify = async (req, res) => {
  try {
    const { resetToken, otp } = req.body;

    const findUser = await user.findOne({ resetToken });

    if (!findUser) {
      return res.status(400).json({ message: "invalid request" });
    }
    if (findUser.resetTokenExpire < Date.now()) {
      return res.status(400).json({ message: " reset token expire" });
    }
    if (findUser.otpexpire < Date.now()) {
      return res.status(400).json({ message: "otp expired" });
    }
    if (findUser.otp !== otp) {
      return res.status(400).json({ message: "invaid token" });
    }
    findUser.otpverify = true;
    await findUser.save();
    return res.status(200).json("verify otp");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { resetToken, Password } = req.body;

    const findUser = await user.findOne({ resetToken });

    if (!findUser) {
      return res.status(400).json({ message: " user not found" });
    }
    if (findUser.resetTokenExpire < Date.now()) {
      return res.status(400).json({ message: " reset token  expire " });
    }
    if (!findUser.otpverify) {
      return res.status(400).json({ message: "otp not verify" });
    }
    if (!Password) {
      return res.status(400).json({ message: "Password is required" });
    }
    if (!resetToken) {
      return res.status(400).json({ message: "Reset token is required" });
    }
    const checkPassword = await bcrypt.compare(Password, findUser.Password);
    if (checkPassword) {
      return res.status(400).json({ message: "enter the differrnt  password" });
    }

    const passwordhash = await bcrypt.hash(Password, 10);
    findUser.Password = passwordhash;
    findUser.resetToken = null;
    findUser.resetTokenExpire = null;
    findUser.otp = null;
    findUser.otpverify = false;
    findUser.otpexpire = null;
    await findUser.save();
    res.status(200).json({ message: "password update successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  otpVerify,
  updatePassword,
};

const jwt = require("jsonwebtoken");
const user = require("../models/user");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendMail = require("../utils/mailsend");
const { decode } = require("punycode");

const registerUser = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required",
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(Email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }
    if (Password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }
    const Emailfind = await user.findOne({ Email: Email });

    if (Emailfind) {
      return res
        .status(400)
        .json({ success: false, message: "User not registered" });
    }
    const bcryptpassword = await bcrypt.hash(Password, 10);

    const data = await user.create({ Email, Password: bcryptpassword });

    res.status(200).json({ success: true, message: "success", data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { Email, Password, remember_Me } = req.body;

    const findEmail = await user.findOne({ Email: Email });
    if (!findEmail) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    const passwordcheck = await bcrypt.compare(Password, findEmail.Password);

    if (!passwordcheck) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const accessToken = jwt.sign(
      {
        Email: Email,
        Id: findEmail.id,
        createdAt: findEmail.createdAt,
        updatedAt: findEmail.updatedAt,
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" },
    );

    const remember = remember_Me ? "30d" : "1d";

    const refreshToken = jwt.sign(
      {
        Email: Email,
        Id: findEmail.id,
        createdAt: findEmail.createdAt,
        updatedAt: findEmail.updatedAt,
      },
      process.env.REFERENCE_KEY,

      { expiresIn: remember },
    );

    findEmail.accessToken = await bcrypt.hash(accessToken, 10);
    findEmail.refreshToken = await bcrypt.hash(refreshToken, 10);

    await findEmail.save();

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 60 * 60 * 1000,
      path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: remember_Me ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { accessToken, refreshToken },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    const id = req.user.Id;

    const find = await user.findById(id);
    find.accessToken = null;
    find.refreshToken = null;
    await find.save();

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ success: true, message: "success" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { Email } = req.body;

    const findEmail = await user.findOne({ Email });

    if (!findEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Email not found" });
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
        success: false,
        message: "You have reached today's OTP limit. Try again tomorrow.",
      });
    }

    if (
      findEmail.lastOtpSentAt &&
      Date.now() - findEmail.lastOtpSentAt.getTime() < 60 * 1000
    ) {
      return res.status(429).json({
        success: false,
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

    res
      .status(200)
      .json({ success: true, message: "Otp send Successfully", resetToken });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const otpVerify = async (req, res) => {
  try {
    const { resetToken, otp } = req.body;

    const findUser = await user.findOne({ resetToken });

    if (!findUser) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request" });
    }
    if (findUser.resetTokenExpire < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Reset token expire" });
    }
    if (findUser.otpverify) {
      return res.status(400).json({
        success: false,
        message: "OTP already verified",
      });
    }
    if (findUser.otpexpire < Date.now()) {
      return res.status(400).json({ success: false, message: "Otp expired" });
    }
    if (findUser.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid  otp" });
    }
    if (findUser.otpverify) {
      return res.status(400).json({
        success: false,
        message: "OTP already verified",
      });
    }
    findUser.otpverify = true;
    findUser.otp = null;
    findUser.otpexpire = null;
    await findUser.save();

    return res.status(200).json({ success: true, message: "Success" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { resetToken, Password } = req.body;
    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
    }

    if (!Password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const findUser = await user.findOne({ resetToken });

    if (!findUser) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    if (findUser.resetTokenExpire < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: " Reset token Expire" });
    }
    if (!findUser.otpverify) {
      return res
        .status(400)
        .json({ success: false, message: "Otp not Verify" });
    }
    if (!Password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    }
    if (!resetToken) {
      return res
        .status(400)
        .json({ success: false, message: "Reset token is required" });
    }
    const checkPassword = await bcrypt.compare(Password, findUser.Password);
    if (checkPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Enter the differrnt Password" });
    }

    const passwordhash = await bcrypt.hash(Password, 10);
    findUser.otpCount = 0;
    findUser.lastOtpSentAt = null;
    findUser.Password = passwordhash;
    findUser.resetToken = null;
    findUser.resetTokenExpire = null;
    findUser.otp = null;
    findUser.otpverify = false;
    findUser.otpexpire = null;
    await findUser.save();
    res
      .status(200)
      .json({ success: true, message: "Password update Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const saveFcmToken = async (req, res) => {
  try {
    const userId = req.user.Id;
    const fcmToken = req.body.fcmToken;
    if (!fcmToken) {
      return res
        .status(400)
        .json({ success: false, message: "Token required" });
    }

    await user.findByIdAndUpdate(userId, { fcmToken });

    res.status(200).json({ success: true, message: "Token save" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "refreshtoken  not found" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFERENCE_KEY);
    const findUser = await user.findById(decoded.Id);
    if (!findUser) {
      return res
        .status(401)
        .json({ success: false, message: "user not found" });
    }
    const isValidRefresh = await bcrypt.compare(
      refreshToken,
      findUser.refreshToken,
    );

    if (!isValidRefresh) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const newaccessToken = jwt.sign(
      {
        Id: findUser._id,
        Email: findUser.Email,
        createdAt: findUser.createdAt,
        updatedAt: findUser.updatedAt,
      },
      process.env.JWT_KEY,
      {
        expiresIn: "1h",
      },
    );

    const newRefreshToken = jwt.sign(
      {
        Id: findUser._id,
        Email: findUser.Email,
        createdAt: findUser.createdAt,
        updatedAt: findUser.updatedAt,
      },
      process.env.REFERENCE_KEY,
      {
        expiresIn: "30d",
      },
    );
    findUser.refreshToken = await bcrypt.hash(newRefreshToken, 10);
    findUser.accessToken = await bcrypt.hash(newaccessToken, 10);

    await findUser.save();
    return res.status(200).json({
      success: true,

      accessToken: newaccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
};

const verificationToken = async (req, res) => {
  try {
    const { accessToken, refreshToken } = req.body;
    let response = {};

    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.JWT_KEY);
        const findUser = await user.findById(decoded.Id);
        if (!findUser) {
          response.accessToken = false;
        } else {
          response.accessToken = await bcrypt.compare(
            accessToken,
            findUser.accessToken,
          );
        }
      } catch (error) {
        response.accessToken = false;
      }
    }
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.REFERENCE_KEY);

        const findUser = await user.findById(decoded.Id);
        if (!findUser) {
          response.refreshToken = false;
        } else {
          response.refreshToken = await bcrypt.compare(
            refreshToken,
            findUser.refreshToken,
          );
        }
      } catch (error) {
        response.refreshToken = false;
      }
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  otpVerify,
  updatePassword,
  saveFcmToken,
  refreshToken,
  verificationToken,
};

const jwt = require("jsonwebtoken");
const user = require("../models/user");
const bcrypt = require("bcrypt");

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
    const {Email} = req.body;
    
    const findEmail = await user.findOne({ Email});

    if (!findEmail) {
      return res.status(400).json({ message: "Email not found" });
    }
    res.status(200).json("success");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, logoutUser, forgotPassword };

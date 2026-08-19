const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const authmiddleware = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token not found",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);

    const findUser = await User.findById(decoded.Id);

    if (!findUser) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const isValid = await bcrypt.compare(token, findUser.accessToken);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Token has been revoked",
      });
    }

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = authmiddleware;

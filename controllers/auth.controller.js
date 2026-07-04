const jwt = require("jsonwebtoken");
const user = require("../models/user");
const bcrypt = require("bcrypt");

const registerUser = async (req, res) => {
  try {
    const { Email, Password } = req.body;

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
        Id: findEmail.Id,
        createdAt: findEmail.createdAt,
        updatedAt: findEmail.updatedAt,
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" },
    );
   

     res.cookie("token", Token, {
      httpOnly: true,
      secure: true,

      maxAge: 60 * 60 * 1000,
      sameSite: "None",
      path: "/",
    });

    res.status(200).json({ message: "success", Token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };

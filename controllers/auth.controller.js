const registerUser = (req, res) => {
  res.send("Register Successfully");
};

const loginUser = (req, res) => {
  res.send("login");
};

module.exports = { registerUser, loginUser };

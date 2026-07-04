const express = require("express");
const auth_router = require("./routers/auth.router");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", auth_router);

app.get("/api", (req, res) => {
  res.json({ success: true, message: "api successfuly connected" });
});

module.exports = app;

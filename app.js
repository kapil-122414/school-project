const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const auth_router = require("./routers/auth.router");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", auth_router);

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "API successfully connected",
  });
});

module.exports = app;

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const limiter = require("./middelware/ratelimit.middleware");
const auth_router = require("./routers/auth.router");
const institude_router = require("./routers/institude.router");
const program_router = require("./routers/program.router");
const section = require("./routers/section.router");
const fee = require("./routers/fee.router");
const admission = require("./routers/admission.router");

const app = express();

const Database = require("./config/bd.connect");
Database();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api", limiter);
app.use("/api", section);

app.use("/api", auth_router);
app.use("/api", institude_router);
app.use("/api", program_router);
app.use("/api", fee);
app.use("/api", admission);
app.use(limiter);
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "API successfully connected",
  });
});

module.exports = app;

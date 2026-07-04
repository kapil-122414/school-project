require("dotenv").config();
const app = require("./app");
const Database = require("./config/bd.connect");

Database();
const port = 5000;
const server = app.listen(port, () => {
  console.log(`sever run this port ${port} `);
});

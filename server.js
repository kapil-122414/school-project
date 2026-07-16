const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
require("dotenv").config();
const app = require("./app");
const Database = require("./config/bd.connect");

Database();
const port = 5000;
const server = app.listen(port, () => {
  console.log(`sever run this port ${port} `);
});

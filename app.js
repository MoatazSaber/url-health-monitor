const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("dotenv/config");
//Routes Imports
const monitorRoute = require("./modules/monitor/monitor.controller");
const userRoute = require("./modules/user/user.controller");
const alertContactRoute = require("./modules/alert-contact/alert-contact.controller");
const authorize = require("./modules/authorization/authorize");

//Middlewares
app.use(bodyParser.json());

//Routing Middlewares
app.use("/api/monitors", authorize, monitorRoute);
app.use("/api/alertContacts", authorize, alertContactRoute);
app.use("/api/user", userRoute);

//Home Route
app.get("/api", (req, res) => {
  res.json({
    message: `for user related operations go to '/user', for alert contacts related operations go to /alertContacts, for monitoring on a URL related operations go to '/monitors', `,
  });
});
app.get("/", (req, res) => {
  res.json({
    message: `for user related operations go to '/user', for alert contacts related operations go to /alertContacts, for monitoring on a URL related operations go to '/monitors', `,
  });
});

module.exports = app;

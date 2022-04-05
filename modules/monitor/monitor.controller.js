const express = require("express");
const router = express.Router();
const authorize = require("../authorization/authorize");
const {
  createMonitorValidation,
  updateMonitorValidation,
} = require("./validation-pipes/monitor-requests-validation");
const {
  getAllUserMonitors,
  getMonitorById,
  getMonitorsByTag,
  createMonitor,
  updateMonitor,
  deleteMonitor,
  deleteAllMonitors,
} = require("./monitor.service");
// Add routes

//get all URL Monitors
router.get("/", async (req, res) => {
  return await getAllUserMonitors(req, res);
});
//get specific URL Monitor
router.get("/monitor/:monitorId", async (req, res) => {
  return await getMonitorById(req, res);
});

//get URL Monitors By Tag.
router.get("/tags", async (req, res) => {
  return await getMonitorsByTag(req, res);
});

//Create new URL Monitor
router.post("/create", async (req, res) => {
  const { error } = createMonitorValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  return await createMonitor(req, res);
});

//UPDATE a URL Monitor
router.put("/update/:monitorId", async (req, res) => {
  const { error } = updateMonitorValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  return await updateMonitor(req, res);
});

//DELETE  a URL Monitor
router.delete("/delete/one/:monitorId", async (req, res) => {
  return await deleteMonitor(req, res);
});

router.delete("/delete/all", async (req, res) => {
  return await deleteAllMonitors(req, res);
});
module.exports = router;

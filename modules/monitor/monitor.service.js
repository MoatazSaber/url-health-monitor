const Monitor = require("./models/Monitor.model");
const {
  getRobotMonitor,
  getRobotMonitors,
  newRobotMonitor,
  updateRobotMonitor,
  deleteRobotMonitor,
} = require("../uptime-robot/uptime-robot-monitors.config");

const monitorResponseParser = require("./helper/monitor-response.mapper");
const UserModel = require("../user/models/User.model");

exports.getAllUserMonitors = async (req, res) => {
  try {
    const monitors = await Monitor.find({ userId: req.user.userId });
    if (monitors.length < 1)
      return res.status(500).json({
        message: "This User Doesn't have any monitors up yet.",
      });
    const monitorsIds = monitors.map((monitor) => monitor.monitorId);
    const uptimeRobot = await getRobotMonitors(monitorsIds);
    const response = [];
    for (const robotMonitor of uptimeRobot.monitors) {
      response.push(await monitorResponseParser(robotMonitor, req.user.userId));
    }
    for (const item of response) {
      const monitor = monitors.find(
        (monitor) => monitor.monitorId == item.monitorId
      );
      item.tags = monitor.tags;
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
exports.getMonitorsByTag = async (req, res) => {
  try {
    const tags = req.body.tags.map((tag) => tag.toLowerCase());
    const monitors = await Monitor.find({
      userId: req.user.userId,
      tags: { $in: tags },
    });
    if (monitors.length < 1)
      return res.status(500).json({
        message: "This User Doesn't have any monitors up with that tag.",
      });
    const monitorsIds = monitors.map((monitor) => monitor.monitorId);
    const uptimeRobot = await getRobotMonitors(monitorsIds);
    const response = [];
    for (const robotMonitor of uptimeRobot.monitors) {
      response.push(await monitorResponseParser(robotMonitor, req.user.userId));
    }
    for (const item of response) {
      const monitor = monitors.find(
        (monitor) => monitor.monitorId == item.monitorId
      );
      item.tags = monitor.tags;
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
exports.getMonitorById = async (req, res) => {
  try {
    const dbMonitor = await Monitor.findOne({
      monitorId: req.params.monitorId,
      userId: req.user.userId,
    });
    if (!dbMonitor)
      return res.status(500).json({
        message: "This Monitor Doesn't Exist.",
      });

    const uptimeRobot = await getRobotMonitor(req);
    if (!uptimeRobot.monitors[0])
      return res.status(500).json({
        message: "This Monitor Doesn't Exist.",
      });
    const monitor = uptimeRobot.monitors[0];
    const response = await monitorResponseParser(monitor, req.user.userId);
    response.tags = dbMonitor.tags;
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error,
    });
  }
};
exports.createMonitor = async (req, res) => {
  try {
    const uptimeRobot = await newRobotMonitor(req);
    if (uptimeRobot.response.error)
      return res.status(500).json({
        message: uptimeRobot.response.error.message,
      });
    const savedMonitor = await uptimeRobot.monitor.save();
    const user = await UserModel.findOne({ userId: req.user.userId });
    user.monitorIds.push(savedMonitor.monitorId);
    user.save();
    res.status(201).json(savedMonitor);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
exports.updateMonitor = async (req, res) => {
  try {
    const dbMonitor = await Monitor.findOne({
      monitorId: req.params.monitorId,
      userId: req.user.userId,
    });
    if (!dbMonitor)
      return res.status(500).json({
        message: "Monitor Not Found.",
      });
    const uptimeRobot = await updateRobotMonitor(req);
    if (uptimeRobot.response.error)
      return res.status(500).json({
        message: uptimeRobot.response.error.message,
      });
    const { friendly_name, url, port, tags, alertContacts } = req.body;
    if (friendly_name) dbMonitor.friendly_name = friendly_name;
    if (url) dbMonitor.url = url;
    if (port) dbMonitor.port = port;
    if (tags) dbMonitor.tags = tags;
    if (alertContacts) {
      const alertContactIds = alertContacts.map(
        (alertContact) => alertContact.alertContactId
      );
      dbMonitor.alertContactIds = alertContactIds;
    }
    dbMonitor.dateUpdated = new Date();
    await dbMonitor.save();
    return res.status(200).json(dbMonitor);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
exports.deleteMonitor = async (req, res) => {
  try {
    const monitorId = req.params.monitorId;
    //remove monitor from mongodb
    const removedMonitor = await Monitor.deleteOne({
      monitorId,
      userId: req.user.userId,
    });
    if (removedMonitor.deletedCount == 0) {
      return res.status(500).json({
        message: "Nothing Was Removed",
      });
    }
    const user = await UserModel.findOne({ userId: req.user.userId });
    //Remove monitor from user monitors
    const updatedUserMonitorIds = user.monitorIds.filter((item) => {
      if (item != monitorId) {
        return true;
      }
    });
    user.monitorIds = updatedUserMonitorIds;
    user.save();
    const uptimeRobot = await deleteRobotMonitor(req.params.monitorId);
    if (uptimeRobot.response.error)
      return res.status(500).json({
        message: uptimeRobot.response.error.message,
      });
    return res.status(200).json(removedMonitor);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
exports.deleteAllMonitors = async (req, res) => {
  try {
    const monitors = await Monitor.find({ userId: req.user.userId });
    if (!monitors)
      return res.status(200).json({ message: "No Monitors Found" });
    const monitorsIds = monitors.map((monitor) => parseInt(monitor.monitorId));
    //remove monitors
    for (const monitor of monitorsIds) {
      const removedMonitor = await Monitor.deleteOne({
        monitorId: monitor.toString(),
        userId: req.user.userId,
      });
      if (removedMonitor.deletedCount == 0) {
        return res.status(500).json({
          message: `Failed to remove monitor with ID ${monitor}`,
        });
      }
      const uptimeRobot = await deleteRobotMonitor(monitor);
      if (uptimeRobot.response.error)
        return res.status(500).json({
          message: uptimeRobot.response.error.message,
        });
    }
    await UserModel.updateOne({ userId: req.user.userId }, { monitorIds: [] });
    return res.status(200).json({ message: "SUCCESSFULLY REMOVED ALL" });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

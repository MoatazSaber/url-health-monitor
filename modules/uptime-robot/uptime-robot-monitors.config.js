const apiKey = process.env.UPTIME_ROBOT_MAIN_API_KEY;
const UptimeRobot = require("@lazydb_community/uptimerobot");
const UptimeRobotClient = new UptimeRobot(apiKey);
const Monitor = require("../monitor/models/Monitor.model");

exports.getRobotMonitor = async (req) => {
  const { monitorId } = req.params;
  try {
    //uptime robot call
    const monitors = await UptimeRobotClient.getMonitors({
      monitors: monitorId,
      all_time_uptime_durations: 1,
      all_time_uptime_ratio: 1,
      response_times: 1,
      alert_contacts: 1,
      logs: 1,
    });
    return monitors;
  } catch (error) {
    return error;
  }
};
exports.getRobotMonitors = async (monitorsIds) => {
  try {
    //uptime robot call
    const monitors = await UptimeRobotClient.getMonitors({
      monitors: monitorsIds.join("-"),
      all_time_uptime_durations: 1,
      all_time_uptime_ratio: 1,
      response_times: 1,
      alert_contacts: 1,
      logs: 1,
    });
    return monitors;
  } catch (error) {
    return error;
  }
};
exports.newRobotMonitor = async (req) => {
  const {
    friendly_name,
    url,
    port,
    authentication,
    custom_http_headers,
    alertContacts,
  } = req.body;
  const tags = req.body.tags.map((tag) => tag.toLowerCase());
  const timeout = req.body.timeout ?? 5;
  const interval = req.body.interval ?? 600;
  const options = {};
  options["timeout"] = timeout ?? 5;
  options["interval"] = interval ?? 600;
  if (port) options["port"] = port;
  if (custom_http_headers) options["custom_http_headers"] = custom_http_headers;
  if (alertContacts) {
    const alertContactsString = alertContacts.map((alertContact) => {
      if (!alertContact.recurrence) alertContact.recurrence = 0;
      if (!alertContact.threshold) alertContact.threshold = 1;
      return `${alertContact.alertContactId}_${alertContact.threshold}_${alertContact.recurrence}`;
    });
    options["alert_contacts"] = alertContactsString.join("-");
  }
  if (authentication) {
    options["http_auth_type"] = 1;
    options["http_username"] = authentication.username;
    options["http_password"] = authentication.password;
  }
  try {
    //uptime robot call
    const created = await UptimeRobotClient.newMonitor(
      friendly_name,
      url,
      "1",
      options
    );
    if (!created) throw new Error(created.error.message);
    const monitorId = created.monitor.id;
    const alertContactIds = alertContacts.map(
      (alertContact) => alertContact.alertContactId
    );
    const monitor = new Monitor({
      monitorId,
      userId: req.user.userId,
      friendly_name,
      url,
      tags,
      alertContactIds,
    });
    return { monitor, response: created };
  } catch (error) {
    return { response: error, monitor: null };
  }
};
exports.updateRobotMonitor = async (req) => {
  const monitorId = req.params.monitorId;
  const {
    friendly_name,
    url,
    port,
    timeout,
    interval,
    status,
    authentication,
    custom_http_headers,
    alertContacts,
  } = req.body;
  const options = {};
  if (friendly_name) options["friendly_name"] = friendly_name;
  if (url) options["url"] = url;
  if (status) options["status"] = status;
  if (port) options["port"] = port;
  if (timeout) options["timeout"] = timeout;
  if (interval) options["interval"] = interval;
  if (custom_http_headers) options["custom_http_headers"] = custom_http_headers;
  if (authentication) {
    options["http_auth_type"] = 1;
    options["http_username"] = authentication.username;
    options["http_password"] = authentication.password;
  }
  if (alertContacts) {
    const alertContactsString = alertContacts.map((alertContact) => {
      if (!alertContact.recurrence) alertContact.recurrence = 0;
      if (!alertContact.threshold) alertContact.threshold = 1;
      return `${alertContact.alertContactId}_${alertContact.threshold}_${alertContact.recurrence}`;
    });
    options["alert_contacts"] = alertContactsString.join("-");
  }
  try {
    //Uptime robot call
    const updated = await UptimeRobotClient.editMonitor(monitorId, options);
    return { monitor: updated, response: updated };
  } catch (error) {
    return { response: error, monitor: null };
  }
};
exports.deleteRobotMonitor = async (monitorId) => {
  try {
    //uptime robot call
    const deleted = await UptimeRobotClient.deleteMonitor(monitorId);
    return { monitor: deleted, response: deleted };
  } catch (error) {
    return { response: error, monitor: null };
  }
};
exports.deleteAllUserRobotMonitor = async (monitorIds) => {
  const monitorId = req.params.monitorId;
  try {
    //uptime robot call
    const deleted = await UptimeRobotClient.deleteMonitor(monitorId);
    return { monitor: deleted, response: deleted };
  } catch (error) {
    return { response: error, monitor: null };
  }
};

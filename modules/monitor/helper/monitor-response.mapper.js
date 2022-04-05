const statusParser = require("./status.parser");
const {
  alertTypeCodeToString,
} = require("../../alert-contact/helpers/alert-type.mapper");
const { format } = require("express/lib/response");

module.exports = async function (monitor, userId) {
  const all_time_uptime_durations =
    monitor.all_time_uptime_durations.split("-");
  for (const alertContact of monitor.alert_contacts) {
    alertContact.type = await alertTypeCodeToString(alertContact.type);
  }
  const response = {
    monitorId: monitor.id,
    userId,
    name: monitor.friendly_name,
    url: monitor.url,
    alertContacts: monitor.alert_contacts,
    protocol: "HTTP/S",
    port: monitor.port,
    status: statusParser(monitor.status),
    availability: monitor.all_time_uptime_ratio,
    uptimeDurations: all_time_uptime_durations[0],
    downtimeDurations: all_time_uptime_durations[1],
    pausedDurations: all_time_uptime_durations[2],
    responseTime: monitor.average_response_time,
    history: monitor.logs,
  };

  return response;
};

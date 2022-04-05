const bcrypt = require("bcryptjs");
const apiKey = process.env.UPTIME_ROBOT_MAIN_API_KEY;
const UptimeRobot = require("@lazydb_community/uptimerobot");
const UptimeRobotClient = new UptimeRobot(apiKey);

const {
  alertTypeStringToCode,
  alertTypeCodeToString,
} = require("../alert-contact/helpers/alert-type.mapper");
const AlertContact = require("../alert-contact/models/alert-contact.model");

exports.getRobotAlertContact = async (req) => {
  const { alertContactId } = req.params;
  try {
    //uptime robot call
    const alertContacts = await UptimeRobotClient.getAlertContacts({
      alert_contacts: alertContactId,
    });
    return alertContacts;
  } catch (error) {
    return error;
  }
};
exports.getRobotAlertContacts = async (alertContactsIds) => {
  try {
    //uptime robot call
    const alertContacts = await UptimeRobotClient.getAlertContacts({
      alert_contacts: alertContactsIds.join("-"),
    });
    return alertContacts;
  } catch (error) {
    return error;
  }
};
exports.newRobotAlertContact = async (req) => {
  const { friendly_name, value } = req.body;
  const type = parseInt(await alertTypeStringToCode(req.body.type));
  const strType = await alertTypeCodeToString(type);
  const threshold = req.body.threshold ?? 1;
  try {
    //uptime robot call
    const created = await UptimeRobotClient.newAlertContact(type, value, {
      friendly_name,
      threshold,
    });
    if (!created) throw new Error(created.error.message);
    const alertContactId = created.alertcontact.id;

    const alertContact = new AlertContact({
      alertContactId,
      userId: req.user.userId,
      friendly_name,
      type: strType,
      value,
      threshold,
    });
    return { alertContact, response: created };
  } catch (error) {
    return { response: error, alertContact: null };
  }
};
exports.updateRobotAlertContact = async (req) => {
  const alertContactId = req.params.alertContactId;
  const { friendly_name, value } = req.body;
  const options = {};
  if (friendly_name) options["friendly_name"] = friendly_name;
  if (value) options["value"] = value;
  try {
    //Uptime robot call
    const updated = await UptimeRobotClient.editAlertContact(
      alertContactId,
      options
    );
    return { alertContact: updated, response: updated };
  } catch (error) {
    return { response: error, alertContact: null };
  }
};
exports.deleteRobotAlertContact = async (alertContactId) => {
  try {
    //uptime robot call
    const deleted = await UptimeRobotClient.deleteAlertContact(alertContactId);
    return { alertContact: deleted, response: deleted };
  } catch (error) {
    return { response: error, alertContact: null };
  }
};

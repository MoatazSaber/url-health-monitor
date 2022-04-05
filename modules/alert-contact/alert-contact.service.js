const bcrypt = require("bcryptjs");
const AlertContact = require("./models/alert-contact.model");
const {
  getRobotAlertContact,
  getRobotAlertContacts,
  newRobotAlertContact,
  updateRobotAlertContact,
  deleteRobotAlertContact,
} = require("../uptime-robot/uptime-robot-alert-contacts.config");

const {
  alertContactResponseParser,
} = require("./helpers/alert-response.mapper");

const UserModel = require("../user/models/User.model");
exports.getAllUserAlertContacts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const alertContacts = await AlertContact.find({ userId: req.user.userId });
    const alertContactsIds = alertContacts.map(
      (alertContact) => alertContact.alertContactId
    );
    if (alertContacts.length < 1)
      return res.status(500).json({
        message: "This user doesn't have any contact alerts set up yet.",
      });
    const uptimeRobot = await getRobotAlertContacts(alertContactsIds);

    const response = [];
    for (const item of uptimeRobot.alert_contacts) {
      response.push(await alertContactResponseParser(item, userId));
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getAlertContactById = async (req, res) => {
  try {
    const dbAlertContact = await AlertContact.findOne({
      alertContactId: req.params.alertContactId,
      userId: req.user.userId,
    });
    if (!dbAlertContact)
      return res.status(500).json({
        message: "This Contact Alert Doesn't Exist.",
      });

    const uptimeRobot = await getRobotAlertContact(req);

    if (!uptimeRobot.alert_contacts[0])
      return res.status(500).json({
        message: "This Contact Alert Doesn't Exist.",
      });
    const alertContact = uptimeRobot.alert_contacts[0];
    const response = await alertContactResponseParser(
      alertContact,
      req.user.userId
    );
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};
exports.createAlertContact = async (req, res) => {
  try {
    const uptimeRobot = await newRobotAlertContact(req);
    if (uptimeRobot.response.error)
      return res
        .status(400)
        .json({ message: uptimeRobot.response.error.message });
    const savedAlertContact = await uptimeRobot.alertContact.save();
    const user = await UserModel.findOne({ userId: req.user.userId });
    user.alertContactIds.push(savedAlertContact.alertContactId);
    user.save();
    res.status(201).json(savedAlertContact);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
exports.updateAlertContact = async (req, res) => {
  try {
    const dbAlertContact = await AlertContact.findOne({
      alertContactId: req.params.alertContactId,
      userId: req.user.userId,
    });
    if (!dbAlertContact)
      return res.status(400).json({ message: "Contact Alert Not Found" });
    if (dbAlertContact.type !== 5 && req.body.value)
      return res.status(400).json({
        message:
          "Alert Contact value can only be changed if if it is a web-hook alert contact.",
      });
    const uptimeRobot = await updateRobotAlertContact(req);
    if (uptimeRobot.response.error)
      return res
        .status(400)
        .json({ message: uptimeRobot.response.error.message });
    const { friendly_name, value } = req.body;

    if (req.body.friendly_name) dbAlertContact.friendly_name = friendly_name;
    if (req.body.value) dbAlertContact.value = req.body.value;

    dbAlertContact.dateUpdated = new Date();
    dbAlertContact.save();
    return res.status(200).json(updatedAlertContact);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
exports.deleteAlertContact = async (req, res) => {
  try {
    const uptimeRobot = await deleteRobotAlertContact(
      req.params.alertContactId
    );
    if (uptimeRobot.response.error)
      return res
        .status(400)
        .json({ message: uptimeRobot.response.error.message });
    const removedAlertContact = await AlertContact.deleteOne({
      alertContactId: req.params.alertContactId,
      userId: req.user.userId,
    });
    if (removedAlertContact.deletedCount == 0) {
      return res.status(500).json({
        message: "Nothing Was Removed",
      });
    }
    const user = await UserModel.findOne({ userId: req.user.userId });
    const updatedUserContactIds = user.alertContactIds.filter((contactId) => {
      if (contactId != req.params.alertContactId) {
        return true;
      }
    });
    user.alertContactIds = updatedUserContactIds;
    user.save();
    return res.status(200).json(removedAlertContact);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
exports.deleteAllAlertContacts = async (req, res) => {
  try {
    const alertContacts = await AlertContact.find({ userId: req.user.userId });
    if (!alertContacts)
      return res.status(200).json({ message: "No AlertContacts Found" });
    const alertContactsIds = alertContacts.map((alertContact) =>
      parseInt(alertContact.alertContactId)
    );
    for (const alertContact of alertContactsIds) {
      const uptimeRobot = await deleteRobotAlertContact(alertContact);
      if (uptimeRobot.response.error)
        return res
          .status(400)
          .json({ message: uptimeRobot.response.error.message });
      const removedAlertContact = await AlertContact.deleteOne({
        alertContactId: alertContact.toString(),
        userId: req.user.userId,
      });
      if (removedAlertContact.deletedCount == 0) {
        return res.status(500).json({
          message: `Failed to remove alertContact with ID ${alertContact}`,
        });
      }
    }
    await UserModel.updateOne(
      { userId: req.user.userId },
      { alertContactIds: [] }
    );
    return res.status(200).json({ message: "SUCCESSFULLY REMOVED ALL" });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

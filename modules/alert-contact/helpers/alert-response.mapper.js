const { alertTypeCodeToString } = require("./alert-type.mapper");
const { alertStatusCodeToString } = require("./alert-status.mapper");
exports.alertContactResponseParser = async (alertContact, userId) => {
  const response = { ...alertContact };

  response.alertContactId = alertContact.id;
  delete response.id;
  response.type = await alertTypeCodeToString(alertContact.type);
  response.status = await alertStatusCodeToString(alertContact.status);
  response.userId = userId;
  return await response;
};

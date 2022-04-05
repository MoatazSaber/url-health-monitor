const contactAlertStatusCodes = {
  0: "not activated",
  1: "paused",
  2: "active",
};
exports.alertStatusCodeToString = async (code) => {
  return contactAlertStatusCodes[code];
};

const contactAlertTypeCodes = {
  2: "email",
  5: "webhook",
  9: "pushover",
};
exports.alertTypeCodeToString = (code) => {
  return contactAlertTypeCodes[code];
};

exports.alertTypeStringToCode = (string) => {
  const formattedString = string.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

  return Object.keys(contactAlertTypeCodes).find(
    (key) => contactAlertTypeCodes[key] === formattedString
  );
};

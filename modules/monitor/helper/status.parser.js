module.exports = function (statusCode) {
  if (statusCode == 0) {
    return "Paused";
  }
  if (statusCode == 1) {
    return "Not checked yet";
  }
  if (statusCode == 2) {
    return "Up";
  }
  if (statusCode == 8) {
    return "Seems down";
  }
  if (statusCode == 9) {
    return "Down";
  }
};

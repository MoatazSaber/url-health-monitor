const mongoose = require("mongoose");

const monitorSchema = mongoose.Schema({
  monitorId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  friendly_name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  tags: {
    type: Array,
  },
  alertContactIds: {
    type: Array,
    default: [],
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  dateUpdated: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model("monitor", monitorSchema);

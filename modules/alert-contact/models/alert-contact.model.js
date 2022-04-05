const mongoose = require("mongoose");

const alertContactSchema = mongoose.Schema({
  alertContactId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    required: true,
  },

  friendly_name: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  threshold: {
    type: Number,
    default: 1,
    required: true,
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

module.exports = mongoose.model("contact_Alert", alertContactSchema);

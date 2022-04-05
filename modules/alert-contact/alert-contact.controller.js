const express = require("express");
const router = express.Router();
const {
  createAlertContactValidation,
  updateAlertContactValidation,
} = require("./validation-pipes/alert-contact-validation");
const {
  getAllUserAlertContacts,
  getAlertContactById,
  createAlertContact,
  updateAlertContact,
  deleteAlertContact,
  deleteAllAlertContacts,
} = require("./alert-contact.service");
// Add routes

// //get all Alert Contacts
router.get("/", async (req, res) => {
  return await getAllUserAlertContacts(req, res);
});

// //get specific Alert Contact
router.get("/alertContact/:alertContactId", async (req, res) => {
  return await getAlertContactById(req, res);
});

// //Create new Alert Contact
router.post("/create", async (req, res) => {
  const { error } = createAlertContactValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  return await createAlertContact(req, res);
});

// //UPDATE a Alert Contact
router.put("/update/:alertContactId", async (req, res) => {
  const { error } = updateAlertContactValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  return await updateAlertContact(req, res);
});

// //DELETE  a Alert Contact
router.delete("/delete/one/:alertContactId", async (req, res) => {
  return await deleteAlertContact(req, res);
});

router.delete("/delete/all", async (req, res) => {
  return await deleteAllAlertContacts(req, res);
});
module.exports = router;

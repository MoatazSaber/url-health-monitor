//TESTING SETUP
const request = require("supertest");
const app = require("../../app");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const uuid = require("uuid");
const jwt = require("jsonwebtoken");
const User = require("../user/models/User.model");
const AlertContact = require("./models/alert-contact.model");
const {
  deleteRobotAlertContact,
} = require("../uptime-robot/uptime-robot-alert-contacts.config");
//CONNECT TO MONGODB TEST SERVER
mongoose.connect(process.env.TEST_DB_CONNECTION_STRING, () =>
  console.log("Connected to DB!")
);

//ACTUAL TESTING
const userOne = {
  userId: uuid.v4(),
  username: "alertContactsTestUser",
  email: "alertContactsTestUser@test.com",
  password: "SuperSafePassword(Y)",
  verified: true,
};
let userOneToken;
beforeAll(async () => {
  await User.deleteMany({});
  await AlertContact.deleteMany({});
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userOne.password, salt);
  const user = { ...userOne };
  user.password = hashedPassword;
  await new User(user).save();
  userOneToken = jwt.sign(
    {
      userId: userOne.userId,
      username: userOne.username,
      email: userOne.email,
      verified: userOne.verified,
    },
    process.env.JWT_TOKEN_SECRET
  );
});

afterAll(async () => {
  const user = await User.findOne({ userId: userOne.userId });
  const userAlertContacts = user.alertContactIds;
  for (const item of userAlertContacts) {
    await deleteRobotAlertContact(parseInt(item));
  }
  user.alertContactIds = [];
  user.save();
});
//create user alert Contact.
describe("POST /api/alertContacts/create", () => {
  describe("Create Alert Contact With Valid Input.", () => {
    test("Should Return 201 and alert Contact.", async () => {
      const response = await request(app)
        .post("/api/alertContacts/create")
        .send({
          friendly_name: "email test",
          type: "email",
          value: "test@gmail.com",
        })
        .set("auth-token", userOneToken)
        .expect("Content-Type", /json/)
        .expect(201);
      expect(response.body).toHaveProperty("alertContactId");
      const alertContact = AlertContact.findOne({
        alertContactId: response.body.alertContactId,
      });
      expect(alertContact).not.toBeNull();
    });
  });
  describe("Create Alert Contact With already used Email.", () => {
    test("Should Return 400 .", async () => {
      const response = await request(app)
        .post("/api/alertContacts/create")
        .send({
          friendly_name: "newName",
          type: "email",
          value: "test@gmail.com",
        })
        .set("auth-token", userOneToken)
        .expect("Content-Type", /json/)
        .expect(400);
    });
  });
});

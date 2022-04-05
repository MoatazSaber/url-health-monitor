//TESTING SETUP
const request = require("supertest");
const app = require("../../app");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const uuid = require("uuid");
const jwt = require("jsonwebtoken");
const User = require("./models/User.model");
//CONNECT TO MONGODB TEST SERVER
mongoose.connect(process.env.TEST_DB_CONNECTION_STRING, () =>
  console.log("Connected to DB!")
);

//ACTUAL TESTING
const userOne = {
  userId: uuid.v4(),
  username: "createdBeforeAll",
  email: "createBeforeAll@test.com",
  password: "SuperSafePassword(Y)",
  verified: true,
};

const userOneToken = jwt.sign(
  {
    userId: userOne.userId,
    username: userOne.username,
    email: userOne.email,
    verified: userOne.verified,
  },
  process.env.JWT_TOKEN_SECRET
);

beforeAll(async () => {
  await User.deleteMany({});
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userOne.password, salt);
  const user = { ...userOne };
  user.password = hashedPassword;
  await new User(user).save();
});

//REGISTER
describe("POST /api/user/register", () => {
  describe("Register With Valid Credentials.", () => {
    test("Should register a new user with 201 Status Code.", async () => {
      await request(app)
        .post("/api/user/register")
        .send({
          username: "testUserName",
          email: "test@test.com",
          password: "testpassword",
        })
        .expect("Content-Type", /json/)
        .expect(201);
    });
  });
  describe("Register With in use username.", () => {
    test("Should throw a 500 status error for duplicate key username.", async () => {
      await request(app)
        .post("/api/user/register")
        .send({
          username: userOne.username,
          email: "NotTest@test.com",
          password: "testpassword",
        })
        .expect("Content-Type", /json/)
        .expect(500);
    });
  });
  describe("Register With in use email.", () => {
    test("Should throw a 500 status error for duplicate key email.", async () => {
      await request(app)
        .post("/api/user/register")
        .send({
          username: "NotTestUserName",
          email: userOne.email,
          password: "testpassword",
        })
        .expect("Content-Type", /json/)
        .expect(500);
    });
  });
  describe("Register With incomplete input.", () => {
    test("Should throw a 400 status code.", async () => {
      await request(app)
        .post("/api/user/register")
        .send({
          password: "testpassword",
        })
        .expect("Content-Type", /json/)
        .expect(400);
    });
  });
});

//LOGIN
describe("POST /api/user/login", () => {
  describe("Try to login  with valid credentials.", () => {
    test("Should respond with 200 status code and a token.", async () => {
      await request(app)
        .post("/api/user/login")
        .send({
          username: userOne.username,
          password: userOne.password,
        })
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });
  describe("Try to login  with Invalid credentials.", () => {
    test("Should respond with 400 status code.", async () => {
      await request(app)
        .post("/api/user/login")
        .send({
          username: userOne.username,
          password: "thisIsNotMyPassword",
        })
        .expect("Content-Type", /json/)
        .expect(400);
    });
  });
  describe("Try to login  without sending email or username.", () => {
    test("Should respond with 400 status code.", async () => {
      await request(app)
        .post("/api/user/login")
        .send({
          password: userOne.password,
        })
        .expect("Content-Type", /json/)
        .expect(400);
    });
  });
});
//GET USER FROM TOKEN
describe("GET /api/user/user-by-token", () => {
  describe("Try to get user data with a valid token.", () => {
    test("Should respond with 200 status code .", async () => {
      await request(app)
        .get("/api/user/user-by-token")
        .send()
        .set("auth-token", userOneToken)
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });
  describe("Try to get user data while providing an invalid token.", () => {
    test("Should respond with 400 status code .", async () => {
      await request(app)
        .get("/api/user/user-by-token")
        .send()
        .set("auth-token", "WRONGTOKEN")
        .expect("Content-Type", /json/)
        .expect(400);
    });
  });
  describe("Try to get user data without providing a token.", () => {
    test("Should respond with 401 status code .", async () => {
      await request(app)
        .get("/api/user/user-by-token")
        .send()
        .expect("Content-Type", /json/)
        .expect(401);
    });
  });
});

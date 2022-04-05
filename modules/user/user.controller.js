const express = require("express");
const router = express.Router();
const userVerificationRoute = require("../user-verification/user-verification.controller");
const authorize = require("../authorization/authorize");
const {
  registerValidation,
  emailLoginValidation,
  usernameLoginValidation,
  updateUserValidation,
} = require("./validation-pipes/user-requests-validation");

const {
  getUserById,
  register,
  loginWithEmail,
  loginWithUsername,
  updateUser,
} = require("./user.service");

router.use("/verify", userVerificationRoute);

//Get User By Id
router.get("/user-by-token", authorize, async (req, res) => {
  return await getUserById(req, res);
});
//Register
router.post("/register", async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  return await register(req, res);
});

//Login
router.post("/login", async (req, res) => {
  if (req.body.email) {
    const { error } = emailLoginValidation(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    return await loginWithEmail(req, res);
  } else if (req.body.username) {
    const { error } = usernameLoginValidation(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    return await loginWithUsername(req, res);
  } else {
    return res
      .status(400)
      .json({ message: "Please provide a username or email." });
  }
});
//Update
router.put("/update", authorize, async (req, res) => {
  const { error } = updateUserValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  return await updateUser(req, res);
});
module.exports = router;

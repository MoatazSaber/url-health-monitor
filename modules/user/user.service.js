//mongodb user model
const User = require("./models/User.model");
//hashing for passwords
const bcrypt = require("bcryptjs");
//jwt setup
const jwt = require("jsonwebtoken");
const { sendVerificationEmail } = require("../mailer/mailer.config");

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId });
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err,
    });
  }
};
exports.register = async (req, res) => {
  //Password Hashing
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
    verified: false,
  });
  try {
    const savedUser = await user.save();
    //handle account verification email here
    await sendVerificationEmail(savedUser, res);

    res.status(201).json({
      message: `User Created Successfully, Please Check your email to activate your account.`,
      userId: savedUser.userId,
      email: savedUser.email,
    });
  } catch (err) {
    console.log(err);
    if (err.code == 11000) {
      const key = Object.keys(err.keyPattern);
      const value = Object.values(err.keyValue);
      res
        .status(500)
        .json({ message: `An Account with ${key}: ${value} Already Exists.` });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
};

exports.loginWithEmail = async (req, res) => {
  //find user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json({ message: "Email Not Found." });

  //Validate Password
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).json({ message: "Invalid Password." });
  //Create and assign token
  const token = jwt.sign(
    {
      userId: user.userId,
      username: user.username,
      email: user.email,
      verified: user.verified,
    },
    process.env.JWT_TOKEN_SECRET
  );
  //Assign token to header and return token
  return res.status(200).header("auth-token", token).json({ token });
};

exports.loginWithUsername = async (req, res) => {
  //find user by username
  const user = await User.findOne({ username: req.body.username });
  if (!user) return res.status(400).json({ message: "Username Not Found." });

  //Validate Password
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).json({ message: "Invalid Password." });
  //Create and assign token
  const token = jwt.sign(
    {
      userId: user.userId,
      username: user.username,
      email: user.email,
      verified: user.verified,
    },
    process.env.JWT_TOKEN_SECRET
  );
  return res.status(200).header("auth-token", token).json({ token });
};
exports.updateUser = async (req, res) => {
  try {
    if (req.body.oldPassword && req.body.newPassword) {
      const user = await User.findOne({ userId: req.user.userId });
      const verifyPassword = await bcrypt.compare(
        req.body.oldPassword,
        user.password
      );
      if (!verifyPassword)
        return res
          .status(400)
          .json({ message: "The old password is not the current password." });
      let hashedPassword;
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

      const updatedUser = await User.updateOne(
        { userId: req.user.userId },
        {
          $set: {
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            dateUpdated: new Date(),
          },
        }
      );
      return res.status(200).json(updatedUser);
    } else {
      const updatedUser = await User.updateOne(
        { userId: req.user.userId },
        {
          $set: {
            username: req.body.username,
            email: req.body.email,
            dateUpdated: new Date(),
          },
        }
      );
      return res.status(200).json(updatedUser);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: err,
    });
  }
};

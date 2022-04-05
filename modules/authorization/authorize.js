const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("auth-token");
  if (!token) return res.status(401).json({ message: "Access Denied" });
  try {
    const verifiedUser = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
    if (verifiedUser.verified == false)
      res.status(400).json({ message: "Please Verify your Email." });
    req.user = verifiedUser;
    next();
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Invalid Token" });
  }
};

const jwt = require("jsonwebtoken");
const ExpressError = require("../utils/ExpressError");
const User = require("../models/user");
const JWT_SECRET = process.env.JWT_SECRET;

exports.signIn = async function (req, res, next) {
  const { username, password } = req.body;
  // Find the user and compare the password with the store hash
  const { user, error } = await User.findOneAndAuth(username, password);

  if (error)
    return next(new ExpressError("Password or username incorrect", 401));

  // Send a json with the jwt
  const token = jwt.sign({ id: user._id, username }, JWT_SECRET, {
    expiresIn: "14d",
  });
  return res.status(200).json({ token });
};

exports.signUp = async function (req, res, next) {
  const { username, email, password } = req.body;
  const newUser = new User({ username, email });

  //Hash and salt the password
  await newUser.setPassword(password);
  try {
    const { id } = await newUser.save();

    // Send a json with the jwt
    const token = jwt.sign({ id, username }, JWT_SECRET, {
      expiresIn: "14d",
    });
    res.status(200).json({ token });
  } catch (e) {
    if (e.code === 11000) {
      e.message = "Username or email already taken"; //Replace the default mongoose duplicate field error message
      return next(e);
    }
    next(e);
  }
};

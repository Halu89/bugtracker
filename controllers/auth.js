const jwt = require("jsonwebtoken");
const ExpressError = require("../utils/ExpressError");
const User = require("../models/user");
const JWT_SECRET = process.env.JWT_SECRET;

exports.signIn = async function (req, res, next) {
  const { username, password } = req.body;
  if (!username || !password)
    return next(new ExpressError("Missing data", 400));
  // Find the user and compare the password with the store hash
  const { user, error } = await User.findOneAndAuth(username, password);
  const { email, issues, projects } = user;
  if (error)
    return next(new ExpressError("Password or username incorrect", 401));

  // Send a json with the jwt
  const token = jwt.sign({ id: user._id, username }, JWT_SECRET, {
    expiresIn: "14d",
  });
  return res
    .status(200)
    .json({ token, user: { id: user._id, username, email, issues, projects } });
};

exports.signUp = async function (req, res, next) {
  const { username, email, password } = req.body;
  if (!username || !password || !email)
    return next(new ExpressError("Missing data", 400));

  const newUser = new User({ username, email });

  //Hash and salt the password
  await newUser.setPassword(password);
  try {
    const { id } = await newUser.save();

    // Send a json with the jwt
    const token = jwt.sign({ id, username }, JWT_SECRET, {
      expiresIn: "14d",
    });
    res
      .status(200)
      .json({
        token,
        user: { id: newUser._id, username, email, issues: [], projects: [] },
      });
  } catch (e) {
    if (e.code === 11000) {
      //Replace the default mongoose duplicate field error message
      return next(new ExpressError("Username or email already taken", 400));
    }
    next(e);
  }
};

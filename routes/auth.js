const express = require("express");
// const passport = require("passport");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const passport = require("passport");
const jwt = require("jsonwebtoken");
const JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = JWT_SECRET;

const catchAsync = require("../utils/catchAsync");
const { User } = require("../models");
const ExpressError = require("../utils/ExpressError");

passport.use(
  new JwtStrategy(opts, function (jwt_payload, done) {
    //Extract the id from the Authorization: Bearer <token>
    User.findById(jwt_payload.id)
      .then((user) => done(null, user ? user : false)) // Add current user to the request
      .catch((e) => done(e));
  })
);

// Register
router.post(
  "/signup",
  catchAsync(async (req, res, _next) => {
    const { username, email, password } = req.body;
    const newUser = new User({ username, email });

    //Hash and salt the password
    await newUser.setPassword(password);
    const savedUser = await newUser.save();
    // Authenticate the user
    // Send a json with the jwt
    const token = jwt.sign({ id: savedUser.id, username }, JWT_SECRET, {
      expiresIn: "14d",
    });
    res.json({ token });
  })
);

router.post(
  "/signin",
  catchAsync(async function (req, res, next) {
    const { username, password } = req.body;
    const { error, user } = await User.findOne({ username })
      .then((user) => user.authenticate(password))
      .catch((e) => next(e));
    // await User.findOneAndAuth(username,password)

    if (error)
      return next(new ExpressError("Password or username incorrect", 401));

    // Send a json with the jwt
    const token = jwt.sign({ id: user._id, username }, JWT_SECRET, {
      expiresIn: "14d",
    });
    return res.json({ token });
  })
);

if (process.env.NODE_ENV === "dev") {
  router.delete("/deleteUser", (req, res, next) => {
    const { username } = req.body;
    User.findOneAndDelete({ username })
      .then(() => {
        return res.send(`User ${username} was deleted`);
      })
      .catch((e) => next(e));
  });
}
module.exports = router;

const passport = require("passport");
const User = require("../models/user");

// AUTH CONFIG
// const JWT_SECRET = process.env.JWT_SECRET,
// passport = require("passport"),
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt"),
  opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };
  
passport.use(
  new JwtStrategy(opts, function (jwt_payload, done) {
    //Extract the id from the Authorization: Bearer <token>
    User.findById(jwt_payload.id)
      .then((user) => done(null, user ? user : false)) // Add current user to the request
      .catch((e) => done(e));
  })
);

exports.ensureAuth = function () {
  return passport.authenticate("jwt", { session: false });
};

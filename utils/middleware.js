require("dotenv").config;
const passport = require("passport");
const User = require("../models/user");
const mongoose = require("mongoose");
// AUTH CONFIG

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

exports.ensureMember = async (req, res, next) => {
  //Look at the user and the project
  const userId = req.user._id;

  const projectId = req.params.projectId;
  try {
    // Import here to avoid circular dependency issue
    const Project = mongoose.model("Project");

    const proj = await Project.findById(projectId);
    if (!proj) return next(new ExpressError("Not found", 404));

    // Verify that the user is a team member
    if (
      proj.team.includes(userId) ||
      proj.admins.includes(userId) ||
      proj.author._id.equals(userId)
    ) {
      return next();
    }
    return res.status(401).send("Unauthorized");
  } catch (e) {
    next(e);
  }
};

exports.ensureAdmin = async (req, res, next) => {
  //Look at the user and the project
  const userId = req.user._id;
  const projectId = req.params.projectId;
  const Project = mongoose.model("Project");

  // Verify that the user is the author or an admin of the project
  const proj = await Project.findById(projectId);
  if (proj.admins.includes(userId) || proj.author._id.equals(userId)) {
    return next();
  }
  return res.status(401).send("Unauthorized");
};

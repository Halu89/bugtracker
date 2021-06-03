require("dotenv").config;
const passport = require("passport");
const User = require("../models/user");
const mongoose = require("mongoose");

const ExpressError = require("./ExpressError");

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
/**Verifies that the request is authenticated */
exports.ensureAuth = function () {
  return passport.authenticate("jwt", { session: false });
};

/** Returns true if user logged in is the user passed to the function, or a project admin
 * @param user -  Document from mongoose
 * @param project - Document from mongoose
 * @param req - Express request
 */
exports.checkPermission = function checkPermission(user, project, req) {
  return (
    project.author._id.equals(req.user._id) ||
    project.admins.includes(req.user._id) ||
    user._id.equals(req.user._id)
  );
};

/** Verifies that the request comes from the author of the project,
 * an admin, or a regular team member */
exports.ensureMember = async (req, res, next) => {
  //Look at the user and the project
  const userId = req.user._id;
  const projectId = req.params.projectId;
  try {
    // Import here to avoid circular dependency issue
    const Project = mongoose.model("Project");

    const proj = await Project.findById(projectId);
    if (!proj) return next(new ExpressError("Not found", 404));

    // Add the project to the request
    req.project = proj;
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

/** Verifies that the request comes from the author of the project or an admin */

exports.ensureAdmin = async (req, res, next) => {
  //Look at the user and the project
  const userId = req.user._id;
  const projectId = req.params.projectId;
  const Project = mongoose.model("Project");

  //TODO : check if a req.project exists from ensureMember() to avoid a db call. Or set it here

  // Verify that the user is the author or an admin of the project
  const proj = await Project.findById(projectId);
  if (!proj) return next(new ExpressError("Not found", 404));

  if (proj.admins.includes(userId) || proj.author._id.equals(userId)) {
    return next();
  }
  return res.status(401).send("Unauthorized");
};

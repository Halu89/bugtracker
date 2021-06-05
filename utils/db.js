const { model } = require("mongoose");
const ExpressError = require("../utils/ExpressError");

async function getUser(username, next) {
  if (!username) {
    return next(new ExpressError("Missing data", 400));
  }
  const User = model("User");
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return next(new ExpressError("User not found", 404));
    }
    return user;
  } catch (e) {
    return next(e);
  }
}

async function getProject(projectId, next) {
  const Project = model("Project");
  try {
    const proj = await Project.findById(projectId);
    if (!proj) {
      return next(new ExpressError("Project not found", 404));
    }
    return proj;
  } catch (e) {
    return next(e);
  }
}

module.exports = { getUser, getProject };

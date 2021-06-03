const { model } = require("mongoose");

async function getUser(username, next) {
  if (!username) {
    return next(new ExpressError("Missing data", 400));
  }
  const User = model("User");
  const user = await User.findOne({ username });
  if (!user) {
    return next(new ExpressError("User not found", 404));
  }
  return user;
}

async function getProject(projectId, next) {
  const Project = model("Project");
  const proj = await Project.findById(projectId);
  if (!proj) {
    return next(new ExpressError("Project not found", 404));
  }
  return proj;
}

module.exports = { getUser, getProject };

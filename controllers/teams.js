const { model } = require("mongoose");
const ExpressError = require("../utils/ExpressError");

async function getUser(req, next) {
  const { username } = req.body;
  console.log(req.body);
  console.log(username);
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

async function getProject(req, next) {
  const Project = model("Project");
  const proj = await Project.findById(req.params.projectId);
  if (!proj) {
    return next(new ExpressError("Project not found", 404));
  }
  return proj;
}

/**Finds a user and a project from the request and
 * adds or removes that user from the projects admins or the project team
 *@param req : Request
 *@param res : Response
 *@param next : Express callback
 *@param operation : Should we add or remove that user
 *@param field : Project field we should do the operation on
 */
async function execute(req, res, next, operation, field) {
  const user = await getUser(req, next);
  const proj = await getProject(req, next);
  if (operation === "push" && proj[field].includes(user._id)) {
    return next(new ExpressError(`User already in ${field}`, 400));
  }
  proj[field][operation](user._id);
  const edited = await proj.save();

  return res.status(200).json(edited);
}
/**Operation to execute */
const op = { ADD: "push", REMOVE: "pull" };
/**Which field should the operation be executed on */
const field = { TEAM: "team", ADMINS: "admins" };

module.exports = { op, field, execute };

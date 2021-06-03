const ExpressError = require("../utils/ExpressError");
const { db } = require("../utils");

/**Finds a user and a project from the request and
 * adds or removes that user from the projects admins or the project team
 *@param req : Request
 *@param res : Response
 *@param next : Express callback
 *@param operation : Should we add or remove that user
 *@param field : Project field we should do the operation on
 */
async function execute(req, res, next, operation, field) {
  const user = await db.getUser(req.body.username, next);
  const proj = await db.getProject(req.params.projectId, next);
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

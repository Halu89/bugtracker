const Issue = require("../models/issue");
const Project = require("../models/project");
const ExpressError = require("../utils/ExpressError");
const { db, auth } = require("../utils");

const index = async (req, res, _next) => {
  const { projectId } = req.params;
  const issue = await Issue.find({ project: projectId }).populate("author", [
    "username",
    "email",
  ]);
  return res.status(200).json(issue);
};

const create = async (req, res, next) => {
  const { title, statusText, description } = req.body;
  if (!title || !description)
    return next(new ExpressError("Missing data", 400));
  //TODO verify that we don't put undefined in the DB
  const newIssue = new Issue({
    title,
    statusText,
    description,
    project: req.project._id, // Extract the project from our middleware
    author: req.user.id, // Extract the user from object added by passport
  });
  await newIssue.save();

  return res.status(201).json(newIssue);
};

const show = async (req, res, next) => {
  const { id } = req.params;
  const issue = await Issue.findById(id)
    .populate("author", ["username", "email"])
    .populate("project", "name")
    .populate("assignedTo", ["username", "email"]);
  if (!issue) return next(new ExpressError("Issue not found", 404));

  return res.status(200).json(issue);
};

const update = async (req, res, next) => {
  const { id } = req.params;
  const update = req.body;
  if (!update) return next(new ExpressError("Missing data", 400));

  const edited = await Issue.findByIdAndUpdate(id, update);
  if (!edited) return next(new ExpressError("Issue not found", 404));

  return res.status(200).json(edited);
};

const destroy = async (req, res, next) => {
  const { id } = req.params;
  try {
    await Issue.findByIdAndDelete(id);
    return res.status(200).json({ success: true });
  } catch (error) {
    if (error.message === "Document not found") {
      return next(new ExpressError("Issue not found", 404));
    }
    next(error);
  }
};

const assignUser = async (req, res, next) => {
  const user = await db.getUser(req.body.username, next);
  const proj = req.project;
  const issueId = req.params.id;

  const issue = await Issue.findById(issueId);
  if (!issue) {
    return next(new ExpressError("Issue not found", 404));
  }

  if (!auth.checkPermission(user, proj, req)) {
    // If a regular user tries to assign someone other than himself to the issue
    return res.status(401).send("Unauthorized");
  }
  if (issue.assignedTo.includes(user._id)) {
    return next(new ExpressError("User already assigned to that issue", 400));
  }
  issue.assignedTo.push(user._id);
  const editedIssue = await issue.save();

  return res.status(200).json(editedIssue);
};

const unassignUser = async (req, res, next) => {
  const user = await db.getUser(req.body.username, next);
  const proj = req.project;
  const issueId = req.params.id;

  const issue = await Issue.findById(issueId);
  if (!issue) {
    return next(new ExpressError("Issue not found", 404));
  }

  if (!auth.checkPermission(user, proj, req)) {
    // If a regular user tries to assign someone other than himself to the issue
    return res.status(401).send("Unauthorized");
  }

  issue.assignedTo.pull(user._id);
  const editedIssue = await issue.save();

  return res.status(200).json(editedIssue);
};

module.exports = {
  index,
  create,
  show,
  update,
  destroy,
  assignUser,
  unassignUser,
};

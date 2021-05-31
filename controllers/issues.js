const Issue = require("../models/issue");
const ExpressError = require("../utils/ExpressError");

const index = async (req, res, _next) => {
  const { project } = req.params;
  const issue = await Issue.find({ project }).populate("author", [
    "username",
    "email",
  ]);
  return res.status(200).json(issue);
};

const create = async (req, res, _next) => {
  const { project } = req.params;
  const { title, statusText, description } = req.body;
  const newIssue = new Issue({
    title,
    statusText,
    description,
    project,
    author: req.user.id, // Extract the user from object added by passport
  });
  await newIssue.save();

  return res.status(201).json(newIssue);
};

const show = async (req, res, next) => {
  const { id } = req.params;
  const issue = await Issue.findById(id).populate("author", [
    "username",
    "email",
  ]);
  if (!issue) return next(new ExpressError("Issue not found", 404));

  return res.status(200).json(issue);
};

const update = async (req, res, next) => {
  const { id } = req.params;
  const update = req.body.issue;

  const edited = await Issue.findByIdAndUpdate(id, update, { new: true });
  if (!edited) return next(new ExpressError("Issue not found", 404));

  return res.status(200).json(edited);
};

const destroy = async (req, res, next) => {
  const { project, id } = req.params;
  const deleted = await Issue.findByIdAndDelete(id);
  if (!deleted) return next(new ExpressError("Issue not found", 404));
  return res.status(200).json({ success: true });
};

module.exports = {
  index,
  create,
  show,
  update,
  destroy,
};

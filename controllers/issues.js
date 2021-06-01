const Issue = require("../models/issue");
const Project = require("../models/project");
const ExpressError = require("../utils/ExpressError");

const index = async (req, res, _next) => {
  const { projectId } = req.params;
  const issue = await Issue.find({ project: projectId })
    .populate("author", ["username", "email"])
    .populate("project", "name");
  return res.status(200).json(issue);
};

const create = async (req, res, next) => {
  const { projectId } = req.params;
  const { title, statusText, description } = req.body;
  if (!title || !description)
    return next(new ExpressError("Missing data", 400));
  const project = await Project.findById(projectId);
  if (!project) return next(new ExpressError("Project not found", 404));

  const newIssue = new Issue({
    title,
    statusText,
    description,
    project: projectId,
    author: req.user.id, // Extract the user from object added by passport
  });
  await newIssue.save();

  return res.status(201).json(newIssue);
};

const show = async (req, res, next) => {
  const { id } = req.params;
  const issue = await Issue.findById(id)
    .populate("author", ["username", "email"])
    .populate("project", "name");
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
    if (error.message === "Document not found");
    return next(new ExpressError("Issue not found", 404));
  }
};

module.exports = {
  index,
  create,
  show,
  update,
  destroy,
};

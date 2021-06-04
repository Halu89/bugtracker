const Project = require("../models/project");
const ExpressError = require("../utils/ExpressError");

const details = async (req, res, next) => {
  const projectId = req.project._id;
  const proj = await Project.findById(projectId)
    .populate("author", ["username", "email"])
    .populate("issues", "title")
    .populate("admins", ["username", "email"])
    .populate("team", ["username", "email"]);

  return res.status(200).json(proj);
};

const index = async (req, res, next) => {
  const userId = req.user._id;
  const projects = await Project.find()
    // User is the project author or in the project's team, or in the project's admins
    // {$or : [{author: userId}, {teams:userId}, {admins:userId}]}
    .or([{ author: userId }, { team: userId }, { admins: userId }])
    .populate("issues", "title");

  return res.status(200).json(projects);
};

const create = async (req, res, next) => {
  const { name, description } = req.body;
  if (!name || !description) return next(new ExpressError("Missing data", 400));
  const author = req.user._id;
  const newProject = await Project.create({
    name,
    description,
    author,
  });

  return res.status(201).json(newProject);
};

const update = async (req, res, next) => {
  const { projectId } = req.params;
  const { name, description } = req.body;
  if (!name || !description) return next(new ExpressError("Missing data", 400));
  const updatedProject = await Project.findByIdAndUpdate(projectId, {
    name,
    description,
  });

  if (!updatedProject) return next(new ExpressError("Project not found", 404));

  res.status(200).json(updatedProject);
};

const destroy = async (req, res, next) => {
  const { projectId } = req.params;
  const deleted = await Project.findByIdAndDelete(projectId);
  if (!deleted) return next(new ExpressError("Project not found", 404));

  res.status(200).json({ success: true });
};

module.exports = {
  index,
  create,
  update,
  destroy,
  details,
};

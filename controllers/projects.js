const Project = require("../models/project");
const ExpressError = require("../utils/ExpressError");

const index = async (req, res, next) => {
  const userProjects = req.user.projects;
  const projects = await Project.find()
    .where("_id")
    .in(userProjects)
    .populate("author", ["username", "email"])
    .populate("issues", "title");

  return res.status(200).json(projects);
};

const create = async (req, res, next) => {
  const { name, description } = req.body;
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
};

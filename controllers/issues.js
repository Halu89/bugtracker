const { Issue } = require("../models");

const index = async (req, res, next) => {
  const { project } = req.params;
  Issue.find({ project }).then((issue) => {
    res.json(issue);
  });
};

const create = async (req, res, next) => {
  const { project } = req.params;
  const newIssue = new Issue({
    ...req.body.issue,
    project, // TODO: get an id from the database and store the project as an id instead of a string, and update the project to add the issue
    author: req.user.id, // Extract the user from object added by passport
  });
  await newIssue.save();

  return res.json(newIssue);
};

const show = async (req, res, _next) => {
  const { project, id } = req.params;
  const issue = await Issue.findById(id);

  res.json(issue);
};

const update = async (req, res, _next) => {
  const { project, id } = req.params;
  const update = req.body.issue;

  const edited = await Issue.findByIdAndUpdate(id, update, { new: true });
  return res.json(edited);
};

const destroy = async (req, res, _next) => {
  const { project, id } = req.params;
  await Issue.findByIdAndDelete(id);

  return res.redirect(`/`);
};

module.exports = {
  index,
  create,
  show,
  update,
  destroy,
};

const mongoose = require("mongoose");

function getId() {
  return new mongoose.Types.ObjectId();
}

const sampleProject = {
  _id: getId(),
  name: "foo",
  description: "fake_description",
  author: getId(),
  issues: [getId(), getId(), getId()],
};

const sampleIssue = {
  _id: getId(),
  title: "foo",
  description: "fake_description",
  project: getId(),
  author: getId(),
  assignedTo: [getId()],
  statusText: "fake_status",
};

const sampleUser = {
  _id: getId(),
  email: "foo@bar.com",
  username: "foo",
  issues: [getId(), getId()],
  projects: [getId()],
};

module.exports = { sampleProject, sampleIssue, sampleUser };

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./user");
const Issue = require("./issue");

const ProjectSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    issues: [{ type: Schema.Types.ObjectId, ref: "Issue" }],
  },
  { timestamps: true }
);

function postSave(project) {
  const authorId = project.author._id;
  const projectId = project._id;
  User.findById(authorId).then((user) => {
    user.projects.push(projectId);
    user.save();
  });
}

ProjectSchema.post("save", postSave);

function postDelete(project) {
  const authorId = project.author._id;
  const projectId = project._id;
  User.findById(authorId).then((user) => {
    user.projects.pull(projectId);
    user.save();
  });

  // Find the issues associated and remove them
  Issue.deleteMany({ author: authorId });
}
ProjectSchema.post("findByIdAndDelete", postDelete);

let Project;
// Get the model or create it if not registered
try {
  Project = mongoose.model("Project");
} catch (e) {
  Project = mongoose.model("Project", ProjectSchema);
}

module.exports = Project;

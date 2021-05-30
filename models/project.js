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

async function postDelete(project) {
  const authorId = project.author._id;
  const projectId = project._id;
  User.findById(authorId).then((user) => {
    user.projects.pull(projectId);
    user.save();
  });

  // Find the issues associated and remove them from their authors in parallel
  await Promise.all(
    project.issues.map(async (issueId) => {
      // Delete the issue, and trigger the issue middleware
      await Issue.findByIdAndDelete(issueId);
    })
  );
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

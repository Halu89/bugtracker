const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./user");

const IssueSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minLength: 1,
      maxLength: 255,
    },
    description: { type: String, required: false, trim: true, maxLength: 5000 },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: [{ type: Schema.Types.ObjectId, ref: "User" }],
    statusText: { type: String, trim: true, maxLength: 255 },
    isOpen: { type: Boolean, default: true, required: true },
  },
  { timestamps: true }
);

// Update the author model of an issue on creation
function postSave(issue) {
  const authorId = issue.author._id;
  const issueId = issue._id;
  User.findById(authorId).then((user) => {
    //Don't add the issue if we're only saving after an assignedTo update
    if (user.issues.includes(issueId)) return;

    // Use MongooseArray method with proper change tracking
    // https://mongoosejs.com/docs/api/array.html

    user.issues.push(issueId);
    user.save();
  });
  const Project = mongoose.model("Project");
  Project.findById(issue.project._id).then((project) => {
    project.issues.push(issueId);
    project.save();
  });
}
IssueSchema.post("save", postSave);

//or on deletion
function postDelete(issue) {
  if (!issue) throw new Error("Document not found");
  const authorId = issue.author._id;
  const issueId = issue._id;
  User.findById(authorId).then((user) => {
    user.issues.pull(issueId);
    user.save();
  });

  // Find the project associated and delete in array
  const Project = mongoose.model("Project");
  Project.findById(issue.project._id).then((project) => {
    if (!project) return;
    project.issues.pull(issueId);
    project.save();
  });
}
IssueSchema.post("findOneAndDelete", postDelete);

let Issue;
// Get the model or create it if not registered
try {
  Issue = mongoose.model("Issue");
} catch (e) {
  Issue = mongoose.model("Issue", IssueSchema);
}

module.exports = Issue;

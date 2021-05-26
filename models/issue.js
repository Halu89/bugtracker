const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./user");

const IssueSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: false },
    project: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: [{ type: Schema.Types.ObjectId, ref: "User" }],
    statusText: String,
    isOpen: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Update the author model of an issue on creation
IssueSchema.post("save", function (issue) {
  const authorId = issue.author._id;
  const issueId = issue._id;
  User.findById(authorId).then((user) => {
    // Use MongooseArray method https://mongoosejs.com/docs/api/array.html
    user.issues.push(issueId);
    user.save();
  });
});

//or on deletion
IssueSchema.post("findOneAndDelete", function (issue) {
  if (!issue) throw new Error("Document not found");
  const authorId = issue.author._id;
  const issueId = issue._id;
  User.findById(authorId).then((user) => {
    user.issues.pull(issueId);
    user.save();
  });
});

const Issue = mongoose.model("Issue", IssueSchema);

module.exports = Issue;

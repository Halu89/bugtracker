const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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

//TODO : Add a preinsert hook to add the issue to the author user

const Issue = mongoose.model("Issue", IssueSchema);

module.exports = Issue;

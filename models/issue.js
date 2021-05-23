const mongoose = require("mongoose");

const DB_URI = process.env.DB_URI || "mongodb://localhost:27017/bugtracker";

mongoose
  .connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(`Database connected (${DB_URI})`))
  .catch((e) => console.error(`Error with the database connection`, e.message));

const IssueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    project: { type: String, required: true },
    description: { type: String, required: false },
  },
  { timestamps: true }
);

const Issue = mongoose.model("issue", IssueSchema);

module.exports = Issue;

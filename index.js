require("dotenv").config();
const { timeStamp } = require("console");
const express = require("express");
const app = express();
const mongoose = require("mongoose");

const port = process.env.PORT || 5050;
const path = require("path");

app.use(express.static(path.join(__dirname, "views")));
app.use(express.urlencoded({ extended: true }));

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

app.get("/", (req, res) => res.sendFile("index"));

//Index
app.get("/myproject", (req, res) => {
  Issue.find({ project: "myproject" }).then((docs) => {
    res.json(docs);
  });
});
//Create
app.post("/myproject", (req, res) => {
  const newIssue = new Issue({ ...req.body.issue, project: "myproject" });
  newIssue
    .save()
    .then("Saved the issue")
    .catch((e) => console.error(e));
  console.log(req.body.issue);
  res.send("Received a new bug");
});

app.listen(port, () =>
  console.log(
    `App listening on port ${port}` +
      (process.env.NODE_ENV === "dev" ? ` Open localhost:${port}` : "")
  )
);

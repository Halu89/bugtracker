require("dotenv-safe").config();

const express = require("express");
const morgan = require("morgan");
const path = require("path");
const app = express();

app.use(express.static(path.join(__dirname, "views")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));

const port = process.env.PORT || 5050;

const ExpressError = require("./utils/ExpressError");
const { ensureAuth } = require("./utils/middleware");
const issueRouter = require("./routes/issues");
const authRouter = require("./routes/auth");
const projectsRouter = require("./routes/projects");

// Routes (order is important)
app.get("/", (req, res) => res.sendFile("index"));
app.use("/auth", authRouter);

app.use("/projects", ensureAuth()); // Ensure authentication and adds a req.user to all "/projects/*" requests
app.use("/projects", projectsRouter);

app.use("/projects/:project", issueRouter); // TODO : Ensure correct user

app.get("/protected", ensureAuth(), (req, res) => {
  console.log(req.user);
  res.json(req.user);
});

// ERROR HANDLING
// 404 Route
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found " + req.path, 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message, stack, originalError } = err;
  if (process.env.NODE_ENV !== "dev") err.stack = "Private";
  if (!err.message) err.message = "Oh No, Something went wrong !";
  res.status(statusCode).json({ statusCode, message, stack, originalError });
});

app.listen(port, () =>
  console.log(
    `App listening on port ${port}` +
      (process.env.NODE_ENV === "dev" ? ` Open http://localhost:${port}` : "")
  )
);

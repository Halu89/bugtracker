require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const app = express();

const port = process.env.PORT || 5050;
const path = require("path");
const router = require("./routes/issue");
const ExpressError = require("./utils/ExpressError");

app.use(express.static(path.join(__dirname, "views")));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));

app.get("/", (req, res) => res.sendFile("index"));

app.use(
  "/:project",
  (req, res, next) => {
    req.project = req.params.project;
    next();
  },
  router
);

// ERROR HANDLING
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found " + req.path, 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message, stack } = err;
  if (!err.message) err.message = "Oh No, Something went wrong !";
  res.status(statusCode).json({ statusCode, message, stack });
});

app.listen(port, () =>
  console.log(
    `App listening on port ${port}` +
      (process.env.NODE_ENV === "dev" ? ` Open http://localhost:${port}` : "")
  )
);

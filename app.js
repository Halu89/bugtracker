require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const path = require("path");
const passport = require("passport");
const app = express();
const jwt = require("jsonwebtoken");

const extractJwt =
  require("passport-jwt").ExtractJwt.fromAuthHeaderAsBearerToken();

const port = process.env.PORT || 5050;

const issueRouter = require("./routes/issues");
const authRouter = require("./routes/auth");
const ExpressError = require("./utils/ExpressError");

app.use(express.static(path.join(__dirname, "views")));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));

// app.use((req, res, next) => {
//   req.jwtPayload = extractJwt(req);
//   next();
// });

app.get("/", (req, res) => res.sendFile("index"));

app.use(
  "/project/:project",
  (req, res, next) => {
    req.project = req.params.project;
    next();
  },
  issueRouter
);
app.use("/auth", authRouter);

app.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log(req.user);
    res.send("You got to the secret page");
  }
);

// ERROR HANDLING
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found " + req.path, 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message, stack } = err;
  console.log(err);
  if (!err.message) err.message = "Oh No, Something went wrong !";
  res.status(statusCode).json({ statusCode, message, stack });
});

app.listen(port, () =>
  console.log(
    `App listening on port ${port}` +
      (process.env.NODE_ENV === "dev" ? ` Open http://localhost:${port}` : "")
  )
);

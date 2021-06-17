const express = require("express");
const router = express.Router();

const ExpressError = require("../utils/ExpressError");
const { auth } = require("../utils");
const issueRouter = require("./issues");
const authRouter = require("./auth");
const projectsRouter = require("./projects");
const teamsRouter = require("./teams");

// Routes (order is important)
router.get("/", (req, res) => res.sendFile("index"));
router.use("/auth", authRouter);

router.use("/projects", auth.ensureAuth()); // Ensure authentication and adds a req.user to all "/projects/*" requests
router.use("/projects", projectsRouter);

//Teams management : add or remove users or admins from the project
router.use("/projects/:projectId", teamsRouter);

//Issues management
router.use("/projects/:projectId", auth.ensureMember, issueRouter);

router.get("/protected", auth.ensureAuth(), (req, res) => {
  console.log(req.user);
  res.json(req.user);
});

// Error handling
// 404 Route
router.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found " + req.path, 404));
});

router.use((err, req, res, next) => {
  const { statusCode = 500, message, stack, originalError } = err;
  if (process.env.NODE_ENV === "production") err.stack = "Private";
  if (!err.message) err.message = "Oh No, Something went wrong !";
  res.status(statusCode).json({ statusCode, message, stack, originalError });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const catchAsync = require("../utils/catchAsync");
const auth = require("../controllers/auth");
// Register
router.post("/signup", catchAsync(auth.signUp));

// Login
router.post("/signin", catchAsync(auth.signIn));

// Delete user
if (process.env.NODE_ENV === "dev") {
  router.delete("/deleteUser", async (req, res, next) => {
    const { username } = req.body;
    try {
      const User = mongoose.model("User");
      const Project = mongoose.model("Project");
      const Issue = mongoose.model("Issue");

      const user = await User.findOne({ username });

      user.issues.forEach(async (id) => {
        await Issue.findByIdAndDelete(id);
      });
      user.projects.forEach(async (id) => {
        await Project.findByIdAndDelete(id);
      });
      await user.remove();
      res.status(200).send("User was deleted");
    } catch (e) {
      console.log(e);
      next(e);
    }
  });
}
module.exports = router;

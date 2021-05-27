const express = require("express");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const User = require("../models");
const auth = require("../controllers/auth");

// Register
router.post("/signup", catchAsync(auth.signUp));

// Login
router.post("/signin", catchAsync(auth.signIn));

// Delete user
if (process.env.NODE_ENV === "dev") {
  router.delete("/deleteUser", (req, res, next) => {
    const { username } = req.body;
    User.findOneAndDelete({ username })
      .then(() => {
        return res.send(`User ${username} was deleted`);
      })
      .catch((e) => next(e));
  });
}
module.exports = router;

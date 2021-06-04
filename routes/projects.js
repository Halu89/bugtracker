const express = require("express");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const projects = require("../controllers/projects");
const { auth } = require("../utils");

//View all the users projects
router.get("/", catchAsync(projects.index));

router.post("/", catchAsync(projects.create));



//Need admin to update or delete the project
router.put("/:projectId", auth.ensureAdmin, catchAsync(projects.update));
router.delete("/:projectId", auth.ensureAdmin, catchAsync(projects.destroy));

module.exports = router;

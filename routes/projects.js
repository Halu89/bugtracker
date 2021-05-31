const express = require("express");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const projects = require("../controllers/projects");

router.get("/", catchAsync(projects.index));

router.post("/", catchAsync(projects.create));

router.put("/:projectId", catchAsync(projects.update));

router.delete("/:projectId", catchAsync(projects.destroy));

module.exports = router;

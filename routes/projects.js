const express = require("express");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const projects = require("../controllers/projects");
const { ensureAdmin } = require("../utils/middleware");
const teamsRouter = require("./teams");

//View all the users project
router.get("/", catchAsync(projects.index));

router.post("/", catchAsync(projects.create));



//Need admin to update or delete the project
router.put("/:projectId", ensureAdmin, catchAsync(projects.update));
router.delete("/:projectId", ensureAdmin, catchAsync(projects.destroy));

module.exports = router;

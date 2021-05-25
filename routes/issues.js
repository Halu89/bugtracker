const express = require("express");
const router = express.Router({ mergeParams: true });

const catchAsync = require("../utils/catchAsync");
const issues = require("../controllers/issues");

router.get("/", catchAsync(issues.index));

router.post("/", catchAsync(issues.create));

router
  .route("/:id")
  .get(catchAsync(issues.show))
  .put(catchAsync(issues.update))
  .delete(catchAsync(issues.destroy));

module.exports = router;

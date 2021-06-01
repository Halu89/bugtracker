const express = require("express");
const router = express.Router({ mergeParams: true });

const catchAsync = require("../utils/catchAsync");
const issues = require("../controllers/issues");
const { ensureMember, ensureAdmin } = require("../utils/middleware");

router.get("/", ensureMember, catchAsync(issues.index));

router.post("/", ensureMember, catchAsync(issues.create));

router
  .route("/:id")
  .get(ensureMember, catchAsync(issues.show))
  .put(ensureMember, catchAsync(issues.update)) // Allow members to update status or close an issue
  .delete(ensureAdmin, catchAsync(issues.destroy));

module.exports = router;

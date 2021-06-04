const express = require("express");
const router = express.Router({ mergeParams: true });

const catchAsync = require("../utils/catchAsync");
const issues = require("../controllers/issues");
const { auth } = require("../utils");

router.get("/", catchAsync(issues.index));

router.post("/", catchAsync(issues.create));

router
  .route("/:id")
  .get(catchAsync(issues.show))
  .put(catchAsync(issues.update)) // Allow members to update status or close an issue
  .delete(auth.ensureAdmin, catchAsync(issues.destroy));

router.put("/:id/assignUser", catchAsync(issues.assignUser));
router.put("/:id/unassignUser", catchAsync(issues.unassignUser));

module.exports = router;

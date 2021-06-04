const express = require("express");
const router = express.Router({ mergeParams: true });
const { op, field, execute } = require("../controllers/teams.js");
const catchAsync = require("../utils/catchAsync");

router.put(
  "/addUser",
  catchAsync((req, res, next) => execute(req, res, next, op.ADD, field.TEAM))
);
router.put(
  "/removeUser",
  catchAsync((req, res, next) => execute(req, res, next, op.REMOVE, field.TEAM))
);
router.put(
  "/addAdmin",
  catchAsync((req, res, next) => execute(req, res, next, op.ADD, field.ADMINS))
);
router.put(
  "/removeAdmin",
  catchAsync((req, res, next) =>
    execute(req, res, next, op.REMOVE, field.ADMINS)
  )
);

module.exports = router;

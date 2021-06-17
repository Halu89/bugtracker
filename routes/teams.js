const express = require("express");
const router = express.Router({ mergeParams: true });
const { op, field, execute } = require("../controllers/teams.js");
const catchAsync = require("../utils/catchAsync");
const { auth } = require("../utils");

router.put(
  "/addUser",
  auth.ensureAdmin,
  catchAsync((req, res, next) => execute(req, res, next, op.ADD, field.TEAM))
);
router.put(
  "/removeUser",
  auth.ensureAdmin,
  catchAsync((req, res, next) => execute(req, res, next, op.REMOVE, field.TEAM))
);
router.put(
  "/addAdmin",
  auth.ensureAdmin,
  catchAsync((req, res, next) => execute(req, res, next, op.ADD, field.ADMINS))
);
router.put(
  "/removeAdmin",
  auth.ensureAdmin,
  catchAsync((req, res, next) =>
    execute(req, res, next, op.REMOVE, field.ADMINS)
  )
);

module.exports = router;

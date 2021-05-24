const express = require("express");
const router = express.Router({ mergeParams: true });

const { Issue, User } = require("../models");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

//Index
router.get(
  "/",
  catchAsync(async (req, res, next) => {
    const { project } = req.params;
    Issue.find({ project }).then((docs) => {
      res.json(docs);
    });
  })
);

//Create
router.post(
  "/",
  catchAsync(async (req, res, next) => {
    const { project } = req;
    const newIssue = new Issue({ ...req.body.issue, project });
    await newIssue.save();

    return res.json(doc);
  })
);

router
  .route("/:id")
  // Show
  .get(
    catchAsync(async (req, res, _next) => {
      const { project, id } = req.params;
      const issue = await Issue.findById(id);

      res.json(issue);
    })
  )
  // Update
  .put(
    catchAsync(async (req, res, _next) => {
      const { project, id } = req.params;
      const update = req.body.issue;

      const edited = await Issue.findByIdAndUpdate(id, update, { new: true });
      return res.json(edited);
    })
  )
  // Delete
  .delete(
    catchAsync(async (req, res, _next) => {
      const { project, id } = req.params;
      await Issue.findByIdAndDelete(id);

      return res.redirect(`/`);
    })
  );

module.exports = router;

const express = require("express");
const router = express.Router();
const Issue = require("../models/issue");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

// middleware that is specific to this router
// router.use(function timeLog (req, res, next) {
//   console.log('Time: ', Date.now())
//   next()
// })

//Index
router.get("/", (req, res) => {
  Issue.find({ project: req.project }).then((docs) => {
    res.json(docs);
  });
});

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

router.get("/new", (req, res) => {
  // Show new issue form
  res.send(`Getting the new issue form`);
});
router.get("/:id/edit", (req, res) => {
  // Show edit issue form
  res.send(`Getting the ${req.params.id} issue edit form`);
});

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

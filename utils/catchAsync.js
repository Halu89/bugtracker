const ExpressError = require("./ExpressError");

/**Wrapper function to catch async errors and pass them with next() */
const catchAsync = (func) => {
  return (req, res, next) =>
    func(req, res, next).catch((e) => {
      interceptMongoose(e, next);
      next(e);
    });
};

function interceptMongoose(e, next) {
  if (e.kind === "ObjectId") {
    // Intercept default cast to ObjectId Mongoose errors
    let doc = e.path || "Document";
    doc = doc.charAt(0).toUpperCase() + doc.slice(1);
    if (process.env.NODE_ENV === "production") {
      return next(new ExpressError(`${doc} not found`, 404));
    }
    return next(new ExpressError(`${doc} not found`, 404, e));
  }
}

module.exports = catchAsync;

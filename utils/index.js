module.exports = {
  db: require("./db"),
  auth: require("./middleware"),
  catchAsync: require("./catchAsync"),
  ExpressError: require("./ExpressError"),
};

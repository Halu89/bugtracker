class ExpressError extends Error {
  constructor(message = "Something went wrong", statusCode = 500) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

module.exports = ExpressError;

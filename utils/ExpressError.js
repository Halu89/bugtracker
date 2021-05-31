class ExpressError extends Error {
  constructor(
    message = "Something went wrong",
    statusCode = 500,
    originalError
  ) {
    super();
    this.statusCode = statusCode;
    this.message = message;
    this.originalError = originalError;
  }
}

module.exports = ExpressError;

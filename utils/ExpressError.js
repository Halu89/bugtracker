/** Extends the Error class with an statusCode */
class ExpressError extends Error {
  /** Extends the Error class with an statusCode
   * @param {string} [message="Something went wrong"] - Error message
   * @param {number} [statusCode=500] - Http response status code
   * @param {error} [originalError] - The original error
   */
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

const chai = require("chai");
const expect = chai.expect;

const ExpressError = require("./ExpressError");

describe("ExpressError", () => {
  it("Should be an instance of error", () => {
    expect(new ExpressError()).to.be.instanceOf(Error);
  });

  it("Should have default values", () => {
    expect(new ExpressError()).to.have.property("statusCode").equal(500);
    expect(new ExpressError())
      .to.have.property("message")
      .equal("Something went wrong");
  });
  it("Should pass the status code and the message", () => {
    const err = new ExpressError("fake_error_message", 123);
    expect(err).to.have.property("message", "fake_error_message");
    expect(err).to.have.property("statusCode", 123);
  });
});

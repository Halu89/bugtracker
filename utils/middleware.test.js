const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");

chai.use(sinonChai);
chai.use(chaiAsPromised);

const rewire = require("rewire");

var passport = rewire("passport");
// var middleware = require("./middleware");

describe("Middleware", () => {
  after(() => {
    sinon.restore();
    passport = rewire("passport");
  });

  context("ensureAuth", () => {
    const authStub = sinon
      .stub(passport, "authenticate")
      .resolves("you can pass");

    // const authStrategy = sinon.stub().returns("my strategy");
    // passport.__set__("use", authStrategy);
    it("should be tested");
    
    // it("should call passport authenticate with the correct params", async() => {
    //   await middleware.ensureAuth();

    //   expect(authStub).to.have.been.calledOnce
    // });
  });
});

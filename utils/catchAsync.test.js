const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);
chai.use(chaiAsPromised);

const catchAsync = require("./catchAsync");
let sandbox = sinon.createSandbox();

describe("catchAsync", () => {
  let stub;
  const req = "fake_request";
  const res = "fake_response";
  const next = "fake_callback";
  beforeEach(() => {
    sandbox.restore();
    stub = sandbox.stub().resolves("some value");
  });

  it("should accept a function", async () => {
    const newFunc = catchAsync(stub);

    expect(stub).to.not.have.been.called;
    expect(newFunc).to.be.a("function");
  });
  it("SHould pass arguments to the function and call it", async () => {
    const newFunc = catchAsync(stub);
    expect(stub).to.not.have.been.called;
    await expect(newFunc(req, res, next)).to.eventually.be.equal("some value");
    expect(stub).to.have.been.calledOnceWithExactly(req, res, next);
  });
  it("should catch async errors", async () => {
    stub = sandbox.stub().rejects(new Error("fake_error"));
    const newFunc = catchAsync(stub);

    await expect(newFunc(req,res,next)).to.be.rejectedWith("fake_error");
    expect(stub).to.have.been.calledOnce;
  });
});

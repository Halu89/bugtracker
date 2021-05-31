const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);
chai.use(chaiAsPromised);

const rewire = require("rewire");
const catchAsync = rewire("./catchAsync");
let sandbox = sinon.createSandbox();

describe("catchAsync", () => {
  let stub, nextStub;
  const req = "fake_request";
  const res = "fake_response";
  const err = new Error("fake_error");
  beforeEach(() => {
    stub = sandbox.stub().resolves("some value");
    nextStub = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });
  it("Should accept a function", async () => {
    const newFunc = catchAsync(stub);

    expect(stub).to.not.have.been.called;
    expect(newFunc).to.be.a("function");
  });
  it("Should pass arguments to the function and call it", async () => {
    const newFunc = catchAsync(stub);
    expect(stub).to.not.have.been.called;
    await expect(newFunc(req, res, nextStub)).to.eventually.be.equal(
      "some value"
    );
    expect(stub).to.have.been.calledOnceWithExactly(req, res, nextStub);
  });
  it("Should catch async errors", async () => {
    stub = sandbox.stub().rejects(err);
    const newFunc = catchAsync(stub);
    await newFunc(req, res, nextStub);

    expect(nextStub).to.have.been.calledWith(err);
    expect(stub).to.have.been.calledOnce;
  });
  context("Mongoose intercept", () => {
    const interceptMongoose = catchAsync.__get__("interceptMongoose");
    let e;
    beforeEach(() => {
      next = sandbox.stub();
      e = { path: "foo", kind: "ObjectId"};
    });
    it("Should not call next if e.kind is not ObjectId", () => {
      e.kind = null;
      interceptMongoose(e, next);
      expect(next).to.not.have.been.called;
    });
    it("Should interceptMongoose errors", () => {
      interceptMongoose(e, next);
      expect(next.lastCall.firstArg).to.be.an("error");
      expect(next.lastCall.firstArg.message).to.equal("Foo not found");
      
      e.path = null
      interceptMongoose(e,next)
      expect(next.lastCall.firstArg.message).to.equal("Document not found");
    });
  });
});

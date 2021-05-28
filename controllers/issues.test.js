const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);
chai.use(chaiAsPromised);
const rewire = require("rewire");

const mongoose = require("mongoose");
const ExpressError = require("../utils/ExpressError");
const { json } = require("express");
let issues = rewire("./issues");

let sandbox = sinon.createSandbox();

describe("Issues controllers", () => {
  let req, res, jsonStub, findStub, populateStub;
  let findByIdStub;
  beforeEach(() => {
    sandbox.restore();
    req = {
      params: {
        project: { name: "foo", id: 123 },
        id: 1234,
      },
      body: {
        issue: { name: "bar", status: "open", description: "fake_description" },
      },
      user: { id: 123, name: "baz" },
    };
    jsonStub = sandbox.stub().returns("fake_json");
    res = { json: jsonStub }; //persists through restores ?
  });

  context("Index", () => {
    beforeEach(() => {
      sandbox.restore();
      populateStub = sandbox
        .stub(mongoose.Query.prototype, "populate")
        .resolves("fake_issue");
      findStub = sandbox
        .stub(mongoose.Model, "find")
        .returns({ populate: populateStub });
    });

    it("Should call the database for all the project matching issues", async () => {
      await issues.index(req, res);
      expect(findStub).to.have.been.calledOnceWithExactly({
        project: req.params.project,
      });
    });
    it("Should populate the author username and email", async () => {
      await issues.index(req, res);
      expect(populateStub).to.have.been.calledOnceWithExactly("author", [
        "username",
        "email",
      ]);
    });
    it("Should send a json back", async () => {
      const result = await issues.index(req, res);
      expect(jsonStub).to.have.been.calledOnceWithExactly("fake_issue");
      expect(result).to.be.equal("fake_json");
    });
  });

  context("Create", () => {
    let FakeIssueModel, saveStub, result;
    beforeEach(async () => {
      saveStub = sandbox.stub().resolves("fake saved user");
      FakeIssueModel = sandbox.stub().returns({ save: saveStub });

      issues.__set__("Issue", FakeIssueModel);

      result = await issues.create(req, res);
    });
    afterEach(() => {
      sandbox.restore();
      issues = rewire("./issues");
    });
    it("Should create a new issue", () => {
      expect(FakeIssueModel).to.have.been.calledWithNew;
      expect(FakeIssueModel).to.have.been.calledOnceWithExactly({
        ...req.body.issue,
        author: req.user.id,
        project: req.params.project,
      });
    });
    it("Should save the issue to the database", () => {
      expect(saveStub).to.have.been.calledOnce;
    });
    it("Should return a json", () => {
      expect(jsonStub).to.have.been.calledOnceWith(new FakeIssueModel());
      expect(result).to.be.equal("fake_json");
    });
  });

  context("Show", () => {
    let result;
    beforeEach(async () => {
      sandbox.restore();
      populateStub = sandbox
        .stub(mongoose.Query.prototype, "populate")
        .resolves("fake_issue");
      findByIdStub = sandbox
        .stub(mongoose.Model, "findById")
        .returns({ populate: populateStub });

      result = await issues.show(req, res);
    });
    it("Should get the id from the params", async () => {
      expect(findByIdStub).to.have.been.calledOnceWithExactly(req.params.id);
    });
    it("Should populate the author username and email fields", () => {
      expect(populateStub).to.have.been.calledOnceWithExactly("author", [
        "username",
        "email",
      ]);
    });
    it("Should return a json", () => {
      expect(jsonStub).to.have.been.calledOnceWithExactly("fake_issue");
      expect(result).to.be.equal("fake_json");
    });
    it("Should pass an error if issue not found", async () => {
      populateStub.resolves(null);
      const next = sandbox.stub();

      await issues.show(req, res, next);
      expect(next).to.have.been.calledOnce;
    });
  });

  context("Update", () => {
    let result;
    beforeEach(async () => {
      sandbox.restore();
      updateStub = sandbox
        .stub(mongoose.Model, "findByIdAndUpdate")
        .resolves("edited_issue");
      result = await issues.update(req, res);
    });
    it("Should call the db with the right arguments", async () => {
      expect(updateStub).to.have.been.calledOnceWithExactly(
        req.params.id,
        req.body.issue,
        { new: true }
      );
    });
    it("Should send back a json", () => {
      expect(jsonStub).to.have.been.calledOnceWithExactly("edited_issue");
      expect(result).to.be.equal("fake_json");
    });
    it("Should pass an error if no issue found", async () => {
      updateStub.resolves(null);
      const next = sandbox.stub();
      await issues.update(req, res, next);
      expect(next).to.have.been.calledOnce;
    });
  });

  context("Destroy", () => {
    let result;
    beforeEach(async () => {
      sandbox.restore();

      deleteStub = sandbox
        .stub(mongoose.Model, "findByIdAndDelete")
        .resolves("fake_deleted");

      result = await issues.destroy(req, res);
    });
    it("Should get the id from the params", async () => {
      expect(deleteStub).to.have.been.calledOnceWithExactly(req.params.id);
    });
    it("Should return a json", () => {
      expect(jsonStub).to.have.been.calledOnceWithExactly({ success: true });
      expect(result).to.be.equal("fake_json");
    });
    it("Should pass an error if issue not found", async () => {
      deleteStub.resolves(null);
      const next = sandbox.stub();

      await issues.destroy(req, res, next);
      expect(next).to.have.been.calledOnce;
    });
  });
});

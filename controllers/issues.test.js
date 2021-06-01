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
let issues = rewire("./issues");

let sandbox = sinon.createSandbox();

describe("Issues controllers", () => {
  let req, res, next, jsonStub, findStub, populateStub;
  let findByIdStub;
  beforeEach(() => {
    req = {
      params: {
        projectId: new mongoose.Types.ObjectId(),
      },
      body: {
        title: "bar",
        statusText: "Work in progress",
        description: "fake_description",
      },
      user: { id: 123, name: "baz" },
    };
    jsonStub = sandbox.stub().returns("fake_json");
    res = { json: jsonStub, status: () => res }; //persists through restores ?
  });
  afterEach(() => {
    sandbox.restore();
  });
  context("Index", () => {
    let mockQuery;
    beforeEach(() => {
      next = sandbox.stub();

      mockQuery = {};
      populateStub = sandbox.stub().onFirstCall().returns(mockQuery);
      populateStub.onSecondCall().resolves("fake_issue");
      mockQuery.populate = populateStub;

      findStub = sandbox
        .stub(mongoose.Model, "find")
        .returns({ populate: populateStub });
    });
    afterEach(() => {
      sandbox.restore();
    });
    it("Should call the database for all the project matching issues", async () => {
      await issues.index(req, res);
      expect(findStub).to.have.been.calledOnceWithExactly({
        project: req.params.projectId,
      });
    });
    it("Should populate the author username and email", async () => {
      await issues.index(req, res);
      expect(populateStub.getCall(0)).to.have.been.calledWithExactly("author", [
        "username",
        "email",
      ]);
    });
    it("Should populate the project name", async () => {
      await issues.index(req, res);
      expect(populateStub.getCall(1)).to.have.been.calledWithExactly(
        "project",
        "name"
      );
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
      findStub = sandbox
        .stub(mongoose.Model, "findById")
        .resolves("fake project");
      issues.__set__("Issue", FakeIssueModel);

      result = await issues.create(req, res);
    });
    afterEach(() => {
      sandbox.restore();
      issues = rewire("./issues");
    });
    it("Should check that the project from the params exists", async () => {
      expect(findStub).to.have.been.calledWith(req.params.projectId);
      sandbox.resetHistory();
      findStub.resolves(null);
      next = sandbox.stub();
      await issues.create(req, res, next);
      expect(next).to.have.been.calledOnce;
      expect(next.getCall(0).firstArg).to.be.an("error");
    });
    it("Should create a new issue", () => {
      expect(FakeIssueModel).to.have.been.calledWithNew;
      expect(FakeIssueModel).to.have.been.calledOnceWithExactly({
        title: req.body.title,
        statusText: req.body.statusText,
        description: req.body.description,
        author: req.user.id,
        project: req.params.projectId,
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
    let result, populateStub, findByIdStub;
    let mockQuery;
    beforeEach(async () => {
      next = sandbox.stub();
      mockQuery = {};
      populateStub = sandbox.stub().onFirstCall().returns(mockQuery);
      populateStub.onSecondCall().resolves("fake_issue");
      mockQuery.populate = populateStub;
      findByIdStub = sandbox
        .stub(mongoose.Model, "findById")
        .returns({ populate: populateStub });

      result = await issues.show(req, res, next);
    });
    afterEach(() => {
      sandbox.restore();
    });
    it("Should get the id from the params", async () => {
      expect(findByIdStub).to.have.been.calledOnceWithExactly(req.params.id);
    });
    it("Should populate the author username and email fields", () => {
      expect(populateStub.getCall(0)).to.have.been.calledWithExactly("author", [
        "username",
        "email",
      ]);
    });
    it("Should populate the project name", () => {
      expect(populateStub.getCall(1)).to.have.been.calledWithExactly(
        "project",
        "name"
      );
    });
    it("Should return a json", () => {
      expect(jsonStub).to.have.been.calledOnceWithExactly("fake_issue");
      expect(result).to.be.equal("fake_json");
    });
    it("Should pass an error if issue not found", async () => {
      sandbox.resetHistory();
      populateStub.onSecondCall().resolves(null); // No issue found

      await issues.show(req, res, next);
      expect(next).to.have.been.calledOnce;
    });
  });

  context("Update", () => {
    let result;
    beforeEach(async () => {
      req = {
        params: { id: new mongoose.Types.ObjectId() },
        body: { title: "fake title", description: "fake desc" },
      };
      updateStub = sandbox
        .stub(mongoose.Model, "findByIdAndUpdate")
        .resolves("edited_issue");
      result = await issues.update(req, res);
    });
    afterEach(() => {
      sandbox.restore();
    });
    it("Should call the db with the right arguments", async () => {
      expect(updateStub).to.have.been.calledOnceWithExactly(
        req.params.id,
        req.body
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
      deleteStub = sandbox
        .stub(mongoose.Model, "findByIdAndDelete")
        .resolves("fake_deleted");

      result = await issues.destroy(req, res);
    });
    afterEach(() => {
      sandbox.restore();
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

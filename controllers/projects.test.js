const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);
chai.use(chaiAsPromised);
const rewire = require("rewire");

const mongoose = require("mongoose");
const { sampleUser, sampleProject } = require("../utils/tests/sampleData");

let projects = rewire("./projects");

describe("Projects Controllers", () => {
  let req, res, next, jsonStub;
  beforeEach(() => {
    jsonStub = sinon.stub();
    res = { status: sinon.stub().returns({ json: jsonStub }) };
    req = { user: sampleUser, project: sampleProject };
    next = sinon.stub();
  });
  afterEach(() => {
    sinon.restore();
  });
  context("Details", () => {
    let mockQuery, findStub, popStub;
    beforeEach(async () => {
      mockQuery = {};
      findStub = sinon.stub(mongoose.Model, "findById").returns(mockQuery);
      popStub = sinon.stub().returns(mockQuery);
      popStub.onCall(3).resolves(sampleProject);
      mockQuery.populate = popStub;

      await projects.details(req, res, next);
    });
    it("Should get the project details", () => {
      expect(findStub).to.have.been.calledWith(req.project._id);
      expect(popStub.callCount).to.eq(4);
    });
    it("Should populate the author", () => {
      expect(popStub.getCall(0)).to.have.been.calledWith("author", [
        "username",
        "email",
      ]);
    });
    it("Should populate the issues", () => {
      expect(popStub.getCall(1)).to.have.been.calledWith("issues");
    });
    it("Should populate the admins", () => {
      expect(popStub.getCall(2)).to.have.been.calledWith("admins", [
        "username",
        "email",
      ]);
    });
    it("Should populate the team", () => {
      expect(popStub.getCall(3)).to.have.been.calledWith("team", [
        "username",
        "email",
      ]);
    });
  });
  context("Index", () => {
    let findStub, popStub, orStub;
    beforeEach(async () => {
      popStub = sinon.stub().resolves("project");
      orStub = sinon.stub().returns({ populate: popStub });
      findStub = sinon.stub(mongoose.Model, "find").returns({
        or: orStub,
      });

      await projects.index(req, res, next);
    });
    it("Should query the DB for the user projects", () => {
      const userId = req.user._id;
      expect(findStub).to.have.been.calledOnce;
      expect(orStub).to.have.been.calledWith([
        { author: userId },
        { team: userId },
        { admins: userId },
      ]);
    });
    it("Should populate the issues field with title", () => {
      expect(popStub).to.have.been.calledWith("issues", "title");
    });
    it("Should return a json with status 200", () => {
      expect(jsonStub).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledOnceWith(200);
    });
  });

  context("Create", () => {
    let createStub;
    beforeEach(async () => {
      req = {
        body: { name: "foo", description: "bar" },
        user: { _id: 123 },
      };
      createStub = sinon
        .stub(mongoose.Model, "create")
        .resolves("fake new project");
      await projects.create(req, res, next);
    });
    it("Should create a new project with the correct args", () => {
      expect(createStub).to.have.been.calledWith({
        name: req.body.name,
        description: req.body.description,
        author: req.user._id,
      });
    });
    it("Should return a json with status 201", () => {
      expect(jsonStub).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledOnceWith(201);
    });
  });
  context("Update", () => {
    let updateStub;
    beforeEach(async () => {
      req = {
        params: { projectId: new mongoose.Types.ObjectId() },
        body: { name: "foo", description: "bar" },
      };

      updateStub = sinon
        .stub(mongoose.Model, "findByIdAndUpdate")
        .resolves("update");
      await projects.update(req, res, next);
    });
    it("Calls the db to update with the correct args", () => {
      expect(updateStub).to.have.been.calledWith(req.params.projectId, {
        ...req.body,
      });
    });
    it("Returns a json with status 200", () => {
      expect(jsonStub).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledOnceWith(200);
    });
    it("Passes an error if no project was found", async () => {
      sinon.resetHistory();
      updateStub.resolves(null);
      await projects.update(req, res, next);

      expect(next).to.have.been.calledOnce;
      expect(next.getCall(0).firstArg).to.be.an("error");
      expect(jsonStub).to.not.have.been.called;
    });
  });

  context("Destroy", () => {
    beforeEach(async () => {
      req = { params: { projectId: new mongoose.Types.ObjectId() } };
      delStub = sinon
        .stub(mongoose.Model, "findByIdAndDelete")
        .returns("success");
      await projects.destroy(req, res, next);
    });

    it("Should get called with the correct args", () => {
      expect(delStub).to.have.been.calledOnceWith(req.params.projectId);
    });

    it("Should return a json with status 200", () => {
      expect(res.status).to.have.been.calledWith(200);
      expect(jsonStub).to.have.been.calledOnce;
    });
  });
  context("Details", () => {
    let mockQuery, findStub;

    beforeEach(async () => {
      mockQuery = {};
      populateStub = sinon.stub().returns(mockQuery);
      populateStub.onCall(3).resolves(sampleProject);
      mockQuery.populate = populateStub;

      findStub = sinon.stub(mongoose.Model, "findById").returns(mockQuery);

      await projects.details(req, res, next);
    });
    afterEach(() => {
      sinon.restore();
    });
    it("Should get a project from the db", () => {
      expect(findStub).to.have.been.calledOnceWithExactly(req.project._id);
    });
    it("Should populate the author field with username and email", () => {
      expect(populateStub.getCall(0)).to.have.been.calledWith("author", [
        "username",
        "email",
      ]);
    });
    it("Should populate the issues field with title", () => {
      expect(populateStub.getCall(1)).to.have.been.calledWith(
        "issues",
        "title"
      );
    });
    it("Should populate the admins field with username and email", () => {
      expect(populateStub.getCall(2)).to.have.been.calledWith("admins", [
        "username",
        "email",
      ]);
    });
    it("Should populate the team field with username and email", () => {
      expect(populateStub.getCall(3)).to.have.been.calledWith("team", [
        "username",
        "email",
      ]);
    });
    it("Should return a json with status 200", () => {
      expect(res.status).to.have.been.calledWith(200);
      expect(jsonStub).to.have.been.calledWith(sampleProject);
    });
  });
});

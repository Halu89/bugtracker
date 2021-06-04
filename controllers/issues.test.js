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
const { db, auth } = require("../utils");
let issues = rewire("./issues");
const {
  sampleUser,
  sampleProject,
  sampleIssue,
} = require("../utils/tests/sampleData");
let sandbox = sinon.createSandbox();

describe("Issues controllers", () => {
  let req, res, next, jsonStub, findStub, populateStub;
  beforeEach(() => {
    req = {
      params: {
        projectId: new mongoose.Types.ObjectId(),
        id: new mongoose.Types.ObjectId(),
      },
      body: {
        title: "bar",
        statusText: "Work in progress",
        description: "fake_description",
      },
      user: sampleUser,
      project: sampleProject,
    };
    jsonStub = sandbox.stub().returns("fake_json");
    res = {
      json: jsonStub,
      send: sinon.stub(),
    };
    res.status = sinon.stub().returns(res);
    next = sinon.stub();
  });
  afterEach(() => {
    sandbox.restore();
  });
  context("Index", () => {
    beforeEach(() => {
      next = sandbox.stub();
      populateStub = sandbox.stub().resolves("fake_issue");
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
    it("Should create a new issue", () => {
      expect(FakeIssueModel).to.have.been.calledWithNew;
      expect(FakeIssueModel).to.have.been.calledOnceWithExactly({
        title: req.body.title,
        statusText: req.body.statusText,
        description: req.body.description,
        author: req.user._id,
        project: req.project._id,
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
      populateStub.onSecondCall().returns(mockQuery);
      populateStub.onThirdCall().resolves("fake_issue");
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
    it("Should populate the assignedTo array", () => {
      expect(populateStub.getCall(2)).to.have.been.calledWithExactly(
        "assignedTo",
        ["username", "email"]
      );
    });
    it("Should return a json", () => {
      expect(jsonStub).to.have.been.calledOnceWithExactly("fake_issue");
      expect(result).to.be.equal("fake_json");
    });
    it("Should pass an error if issue not found", async () => {
      sandbox.resetHistory();
      populateStub.onThirdCall().resolves(null); // No issue found

      await issues.show(req, res, next);
      expect(next).to.have.been.calledOnce;
    });
  });

  context("Update", () => {
    let result;
    beforeEach(async () => {
      req.body = { title: "fake title", description: "fake desc" };
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
      deleteStub.throws(new Error("Document not found"));
      const next = sandbox.stub();

      await issues.destroy(req, res, next);
      expect(next).to.have.been.calledOnce;
    });
  });
  context("AssignUser", () => {
    let userStub, fakeIssue, permStub, saveStub, includeStub;
    beforeEach(async () => {
      req.body = { username: "fake username" };
      sinon.spy(Array.prototype, "push");
      saveStub = sinon.stub().resolves("fake edited issue");
      userStub = sinon.stub(db, "getUser").resolves(req.project.team[0]);
      permStub = sinon.stub(auth, "checkPermission").returns(true);
      fakeIssue = { ...sampleIssue };
      fakeIssue.assignedTo = [];
      fakeIssue.save = saveStub;
      findStub = sinon.stub(mongoose.Model, "findById").resolves(fakeIssue);

      await issues.assignUser(req, res, next);
    });
    afterEach(() => {
      sinon.restore();
    });
    context("Should test that the user is in the project", () => {
      beforeEach(() => {
        fakeIssue.assignedTo = []; // Reset after first fn call
      });

      it("Should get a user from the username given", () => {
        expect(userStub).to.have.been.calledWith(req.body.username, next);
      });
      it("Keeps going if username is in the team", async () => {
        userStub.resolves(req.project.team[0]);
        await issues.assignUser(req, res, next);
        expect(next).to.not.have.been.called;
      });
      it("Keeps going if username is in the admins", async () => {
        userStub.resolves(req.project.admins[0]);
        await issues.assignUser(req, res, next);
        expect(next).to.not.have.been.called;
      });
      it("Keeps going if username is the author", async () => {
        userStub.resolves(req.project.author);
        await issues.assignUser(req, res, next);
        expect(next).to.not.have.been.called;
      });
      it("Calls next when not in the project", async () => {
        userStub.resolves({ _id: 2, username: "fake username" });
        await issues.assignUser(req, res, next);
        expect(next.getCall(0).firstArg.message).to.eql(
          "User not in the project"
        );
        expect(next.getCall(0).firstArg.statusCode).to.eql(400);
      });
    });
    context("Should check for permissions", () => {
      it("Calls for checkPermission", () => {
        expect(permStub).to.have.been.called;
      });
      it("Pass an error if no permission", async () => {
        sinon.resetHistory();
        permStub.returns(false);
        await issues.assignUser(req, res, next);
        expect(res.status).to.have.been.calledWith(401);
        expect(res.send).to.have.been.calledWith("Unauthorized");
      });
    });
    context("Should get an issue", () => {
      it("Should verify that the issue exists", async () => {
        sandbox.resetHistory();
        findStub.resolves(null);
        await issues.assignUser(req, res, next);

        expect(next).to.have.been.called;
        expect(next.getCall(0).firstArg.message).to.eql("Issue not found");
        expect(next.getCall(0).firstArg.statusCode).to.eql(404);
      });
      it("Should call the db for an issue", () => {
        expect(findStub).to.have.been.calledWith(req.params.id);
      });
    });
    context("Should push the user to the array and save", () => {
      it("Should verify that the user is not already in the array", async () => {
        sinon.resetHistory();
        findStub.resolves({ ...fakeIssue, assignedTo: [req.project.team[0]] });
        await issues.assignUser(req, res, next);
        expect(next).to.have.been.called;
        // ExpressError
        expect(next.getCall(0).firstArg.statusCode).to.eql(400);
        expect(next.getCall(0).firstArg.message).to.eql(
          "User already assigned to that issue"
        );
      });
      it("Should push the user to the array", () => {
        expect(Array.prototype.push).to.have.been.calledOnceWithExactly(
          req.project.team[0]._id
        );
      });
      it("Should save the user", () => {
        expect(saveStub).to.have.been.called;
      });
    });
    it("Should return a json with status 200", () => {
      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith("fake edited issue");
    });
  });

  context("Unassign User", () => {
    let userStub, pullStub, permStub, findStub, fakeIssue;
    beforeEach(async () => {
      pullStub = sinon.stub();
      userStub = sinon.stub(db, "getUser").resolves(sampleUser);
      permStub = sinon.stub(auth, "checkPermission").returns(true);
      fakeIssue = {
        ...sampleIssue,
        save: sinon.stub().returns("fake edited issue"),
        assignedTo: { pull: pullStub },
      };
      findStub = sinon.stub(mongoose.Model, "findById").resolves(fakeIssue);

      await issues.unassignUser(req, res, next);
    });
    afterEach(() => {
      sinon.restore();
    });
    it("Should find a user from the db", () => {
      expect(userStub).to.have.been.calledOnceWithExactly(
        req.body.username,
        next
      );
    });
    it("Should check for permission", async () => {
      expect(permStub).to.have.been.calledOnce;
      expect(next).to.not.have.been.called;

      sinon.resetHistory();
      permStub.returns(false);
      await issues.unassignUser(req, res, next);

      expect(res.status).to.have.been.calledOnceWithExactly(401);
      expect(res.send).to.have.been.calledOnceWithExactly("Unauthorized");
    });
    context("Should get an issue", () => {
      it("Should call the db for an issue", () => {
        expect(findStub).to.have.been.calledWith(req.params.id);
      });
      it("Should verify that the issue exists", async () => {
        sandbox.resetHistory();
        findStub.resolves(null);
        await issues.unassignUser(req, res, next);

        expect(next).to.have.been.called;
        expect(next.getCall(0).firstArg.message).to.eql("Issue not found");
        expect(next.getCall(0).firstArg.statusCode).to.eql(404);
      });
    });
    context("Should pull the user from the array and save", () => {
      it("Should pull the user from the array", () => {
        expect(pullStub).to.have.been.calledOnceWithExactly(sampleUser._id);
      });
      it("Should save the user", () => {
        expect(fakeIssue.save).to.have.been.called;
      });
    });
    it("Should return a json with status 200", () => {
      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith("fake edited issue");
    });
  });
});

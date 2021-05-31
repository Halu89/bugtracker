const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);
chai.use(chaiAsPromised);
const rewire = require("rewire");

const mongoose = require("mongoose");

let projects = rewire("./projects");

describe("Projects Controllers", () => {
  let req, res, next, jsonStub;
  beforeEach(() => {
    jsonStub = sinon.stub();
    res = { status: sinon.stub().returns({ json: jsonStub }) };
    next = sinon.stub();
  });
  afterEach(() => {
    sinon.restore();
  });

  context("Index", () => {
    req = { user: { projects: [1, 2, 3] } };
    let findStub, popStub, secondPopStub, inStub;
    beforeEach(async () => {
      secondPopStub = sinon.stub().resolves("project");
      popStub = sinon.stub().returns({ populate: secondPopStub });

      inStub = sinon.stub().returns({ populate: popStub });

      findStub = sinon.stub(mongoose.Model, "find").returns({
        where: sinon.stub().returns({
          in: inStub,
        }),
      });

      await projects.index(req, res, next);
    });
    it("Should query the DB for the user projects", () => {
      expect(findStub).to.have.been.calledOnce;
      expect(inStub).to.have.been.calledWith(req.user.projects);
    });
    it("Should populate the author field with username and email", () => {
      expect(popStub).to.have.been.calledWith("author", ["username", "email"]);
    });
    it("Should populate the issues field with title", () => {
      expect(secondPopStub).to.have.been.calledWith("issues", "title");
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
});

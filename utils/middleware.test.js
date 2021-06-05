const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");

chai.use(sinonChai);
chai.use(chaiAsPromised);

// const rewire = require("rewire");

var middleware = require("./middleware");
const passport = require("passport");
const { sampleProject, sampleUser } = require("./tests/sampleData");
const mongoose = require("mongoose");

describe("Middleware", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("ensureAuth should be passport.authenticate", () => {
    expect(middleware.ensureAuth().toString()).to.eql(
      passport.authenticate("jwt", { session: false }).toString()
    );
  });
  context("checkPermission", () => {
    let project, user, req;
    beforeEach(() => {
      project = { ...sampleProject };
      user = { ...sampleUser };
      req = { user: new mongoose.Types.ObjectId() };
    });
    it("Should return true if the req comes from the project author", () => {
      project.author.id = req.user.id;
      expect(middleware.checkPermission(user, project, req)).to.be.true;
    });
    it("Should return true if the req comes from an admin", () => {
      project.admins.push(req.user._id);
      expect(middleware.checkPermission(user, project, req)).to.be.true;
    });
    it("Should return true if the req comes from the user for himself", () => {
      user._id = req.user._id;
      expect(middleware.checkPermission(user, project, req)).to.be.true;
    });
    it("Should return false otherwise", () => {
      expect(middleware.checkPermission(user, project, req)).to.be.false;
    });
  });

  context("ensureMember", () => {
    let project, req, res, next, findStub;
    beforeEach(async () => {
      project = { ...sampleProject };
      req = { user: new mongoose.Types.ObjectId(), params: { projectId: 123 } };
      res = { send: sinon.stub() };
      res.status = sinon.stub().returns(res);
      next = sinon.stub();
      findStub = sinon.stub(mongoose.Model, "findById").resolves(project);

      await middleware.ensureMember(req, res, next);
    });
    afterEach(() => {
      sinon.restore();
    });
    it("Should check the db for a project", async () => {
      expect(findStub).to.have.been.calledWith(123);

      sinon.resetHistory();
      findStub.resolves(null);
      await middleware.ensureMember(req, res, next);
      expect(next).to.have.been.called;
      expect(next.getCall(0).firstArg.message).to.eql("Project not found");
      expect(next.getCall(0).firstArg.statusCode).to.eql(404);
    });
    it("Should add the project found to the request", () => {
      expect(req.project).to.deep.eql(project);
    });
    context("Permission", () => {
      beforeEach(() => {
        sinon.resetHistory();
      });
      it("Should go through if user is author", async () => {
        project.author.id = req.user.id;
        await middleware.ensureMember(req, res, next);

        expect(next).to.have.been.calledWithExactly();
      });
      it("Should go through if user is admin", async () => {
        project.admins.push(req.user._id);
        await middleware.ensureMember(req, res, next);

        expect(next).to.have.been.calledWithExactly();
      });
      it("Should go through if user is in team", async () => {
        project.team.push(req.user._id);
        await middleware.ensureMember(req, res, next);

        expect(next).to.have.been.calledWithExactly();
      });
      it("Should fail otherwise", async () => {
        await middleware.ensureMember(req, res, next);
        expect(next).to.not.have.been.called;
        expect(res.status).to.have.been.calledWith(401);
        expect(res.send).to.have.been.calledWith("Unauthorized");
      });
    });
    it("Should catch errors", async () => {
      sinon.resetHistory();
      findStub.restore();
      findStub = sinon
        .stub(mongoose.Model, "findById")
        .rejects(new Error("fake error"));

      await middleware.ensureMember(req, res, next);
      expect(next).to.have.been.called;
      expect(next.getCall(0).firstArg.message).to.eql("fake error");
    });
  });

  context("ensureAdmin", () => {
    let project, req, res, next, findStub;
    beforeEach(async () => {
      project = { ...sampleProject };
      req = { user: new mongoose.Types.ObjectId(), params: { projectId: 123 } };
      res = { send: sinon.stub() };
      res.status = sinon.stub().returns(res);
      next = sinon.stub();
      findStub = sinon.stub(mongoose.Model, "findById").resolves(project);
    });
    afterEach(() => {
      sinon.restore();
    });

    it("Should not call the db if the project is on the request", async () => {
      await middleware.ensureAdmin({ ...req, project }, res, next);
      expect(findStub).to.not.have.been.called;

      expect(res.status).to.have.been.calledWith(401);
      expect(res.send).to.have.been.calledWith("Unauthorized");
    });
    it("Should add the project found to the request", async () => {
      expect(req.project).to.be.undefined;
      await middleware.ensureAdmin(req, res, next);
      expect(req.project).to.deep.eql(project);
    });
    it("Should check the db for a project if not on the request", async () => {
      findStub.resolves(null);
      await middleware.ensureAdmin(req, res, next);
      expect(next).to.have.been.called;
      expect(next.getCall(0).firstArg.message).to.eql("Project not found");
      expect(next.getCall(0).firstArg.statusCode).to.eql(404);
    });
    it("Should catch and pass db errors", async () => {
      findStub.rejects(new Error("fake error"));

      await middleware.ensureAdmin(req, res, next);
      expect(next).to.have.been.called;
      expect(next.getCall(0).firstArg.message).to.eql("fake error");
    });
    context("Permission", () => {
      // beforeEach(() => {
      //   sinon.resetHistory();
      // });
      it("Should go through if user is author", async () => {
        project.author.id = req.user.id;
        await middleware.ensureAdmin(req, res, next);

        expect(next).to.have.been.calledWithExactly();
      });
      it("Should go through if user is admin", async () => {
        project.admins.push(req.user._id);
        await middleware.ensureAdmin(req, res, next);

        expect(next).to.have.been.calledWithExactly();
      });
      it("Should NOT go through if user is in team", async () => {
        project.team.push(req.user._id);
        await middleware.ensureAdmin(req, res, next);

        expect(next).to.not.have.been.called;
        expect(res.status).to.have.been.calledWith(401);
        expect(res.send).to.have.been.calledWith("Unauthorized");
      });
      it("Should fail otherwise", async () => {
        await middleware.ensureAdmin(req, res, next);
        expect(next).to.not.have.been.called;
        expect(res.status).to.have.been.calledWith(401);
        expect(res.send).to.have.been.calledWith("Unauthorized");
      });
    });
  });
});

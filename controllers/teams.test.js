const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);
chai.use(chaiAsPromised);

const { db } = require("../utils");
const { sampleUser, sampleProject } = require("../utils/tests/sampleData");
const teams = require("./teams");
const { op, field } = teams;

describe("Teams Controllers", () => {
  it("Operation should have the right constants", () => {
    expect(op).to.have.property("ADD").to.eql("push");
    expect(op).to.have.property("REMOVE").to.eql("pull");
  });
  it("Field should have the right constants", () => {
    expect(field).to.have.property("TEAM").to.eql("team");
    expect(field).to.have.property("ADMINS").to.eql("admins");
  });

  context("Execute", () => {
    let req, res, next, push, pull, includes, project, fakeArray, userStub;
    beforeEach(() => {
      push = sinon.stub();
      pull = sinon.stub();
      includes = sinon.stub().returns(false);
      fakeArray = { push, pull, includes };
      project = {
        ...sampleProject,
        team: fakeArray,
        admins: fakeArray,
        save: sinon.stub().resolves("edited project"),
      };
      req = { body: { username: "foo" }, project };
      next = sinon.stub();
      res = { json: sinon.stub() };
      res.status = sinon.stub().returns(res);
      userStub = sinon.stub(db, "getUser").returns(sampleUser);
    });
    afterEach(() => {
      sinon.restore();
    });

    it("Should send back a json with status 200", async () => {
      for (const i in field) {
        for (const j in op) {
          sinon.resetHistory();
          await teams.execute(req, res, next, op[j], field[i]);
          expect(res.status).to.have.been.calledOnceWith(200);
          expect(res.json).to.have.been.calledOnceWith("edited project");
        }
      }
    });
    it("Should call the db for the user", async () => {
      for (const i in field) {
        for (const j in op) {
          sinon.resetHistory();
          await teams.execute(req, res, next, op[j], field[i]);
          expect(userStub).to.have.been.calledOnceWith("foo");
          expect(project.save).to.have.been.calledOnce;
        }
      }
    });
    it("Should verify duplicates for push", async () => {
      for (const i in field) {
        sinon.resetHistory();
        await teams.execute(req, res, next, op.ADD, field[i]);
        expect(includes).to.have.been.calledWith(sampleUser._id);
      }
      // Duplicate case
      includes.returns(true);
      for (const i in field) {
        sinon.resetHistory();
        await teams.execute(req, res, next, op.ADD, field[i]);
        expect(includes).to.have.been.calledWith(sampleUser._id);
        expect(next).to.have.been.called;
        expect(next.getCall(0).firstArg.message).to.eql(
          `User already in ${field[i]}`
        );
        expect(next.getCall(0).firstArg.statusCode).to.eql(400);
        expect(res.json).to.not.have.been.called;
      }
    });
  });
});

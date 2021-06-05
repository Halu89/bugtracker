const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const sinonChai = require("sinon-chai");

chai.use(sinonChai);

const mongoose = require("mongoose");
const db = require("./db");

describe("DB utils", () => {
  context("getUser", () => {
    let next, findStub;
    beforeEach(() => {
      next = sinon.stub();
      findStub = sinon.stub(mongoose.Model, "findOne").resolves("fake user");
    });
    afterEach(() => {
      sinon.restore();
    });
    it("Should check for a username", async () => {
      await db.getUser("", next);
      expect(findStub.called).to.be.false;
      expect(next.getCall(0).firstArg.message).to.be.eql("Missing data");
      expect(next.getCall(0).firstArg.statusCode).to.be.eql(400);
    });
    it("Should call the db for a user", async () => {
      await expect(db.getUser("foo", next)).to.eventually.be.eq("fake user");
      expect(findStub.called).to.be.true;
      expect(findStub).to.have.been.calledWith({ username: "foo" });
      expect(next).to.not.have.been.called;
    });
    it("Should return a 404 if user not found", async () => {
      findStub.resolves(null);
      await db.getUser("foo", next);
      expect(next.getCall(0).firstArg.message).to.eq("User not found");
      expect(next.getCall(0).firstArg.statusCode).to.eq(404);
    });
    it("Should catch and pass db errors", async () => {
      findStub.rejects(new Error("fake error"));
      await db.getUser("foo", next);
      expect(next.getCall(0).firstArg.message).to.eq("fake error");
    });
  });
  context("getProject", () => {
    let next, findStub;
    beforeEach(() => {
      next = sinon.stub();
      findStub = sinon
        .stub(mongoose.Model, "findById")
        .resolves("fake project");
    });
    afterEach(() => {
      sinon.restore();
    });
    it("Should call the db for a project", async () => {
      await expect(db.getProject(123, next)).to.eventually.be.eq(
        "fake project"
      );
      expect(findStub.called).to.be.true;
      expect(findStub).to.have.been.calledWith(123);
      expect(next).to.not.have.been.called;
    });
    it("Should return a 404 if project not found", async () => {
      findStub.resolves(null);
      await db.getProject(123, next);
      expect(next.getCall(0).firstArg.message).to.eq("Project not found");
      expect(next.getCall(0).firstArg.statusCode).to.eq(404);
    });
    it("Should catch and pass db errors", async () => {
      findStub.rejects(new Error("fake error"));
      await db.getProject(123, next);
      expect(next).to.have.been.called;
      expect(next.getCall(0).firstArg.message).to.eq("fake error");
    });
  });
});

const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const chaiAsPromised = require("chai-as-promised");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);
chai.use(chaiAsPromised);
const rewire = require("rewire");

const mongoose = require("mongoose");
var User = require("../models/user");
let sandbox = sinon.createSandbox();
const jwt = require("jsonwebtoken");
const ExpressError = require("../utils/ExpressError");
const { useFakeServer } = require("sinon");

let authControllers = rewire("./auth");

describe("Auth controllers", () => {
  let req, res, next, jsonStub, sampleUser;
  beforeEach(() => {
    req = {
      body: {
        username: "foo",
        email: "foo@bar.com",
        password: "bar",
      },
    };
    jsonStub = sandbox.stub().returns("fake_json");
    res = { json: jsonStub, status: () => res };
    sampleUser = { _id: 123, username: "foo", id: 123 };
    next = sandbox.stub();
  });
  context("signIn", () => {
    beforeEach(() => {
      authStub = sandbox
        .stub(User, "findOneAndAuth")
        .resolves({ user: sampleUser, error: null });
      signStub = sandbox.stub(jwt, "sign").returns("fake_token");
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("Calls the model method to verify password from the req.body", async () => {
      await authControllers.signIn(req, res, next);
      expect(authStub).to.have.been.calledOnceWithExactly(
        req.body.username,
        req.body.password
      );
    });
    it("Calls jwt to sign the token if no error", async () => {
      await authControllers.signIn(req, res, next);
      expect(signStub).to.have.been.calledOnceWith(
        {
          id: sampleUser._id,
          username: sampleUser.username,
        },
        undefined, //JWT secret
        { expiresIn: "14d" }
      );
    });
    it("Passes an error if the auth method returns one", async () => {
      authStub.resolves({ user: false, error: "fake_error" });

      await authControllers.signIn(req, res, next);
      expect(signStub).to.not.have.been.called;
      expect(next).to.have.been.calledOnce;
    });
    it("Returns a json with the token if no error", async () => {
      await authControllers.signIn(req, res, next);
      expect(jsonStub).to.have.been.calledOnceWithExactly({
        token: "fake_token",
      });
    });
  });

  context("signUp", () => {
    beforeEach(async () => {
      pwStub = sandbox.stub().resolves("set fake pw");
      signStub = sandbox.stub(jwt, "sign").returns("fake_token");
      saveStub = sandbox.stub().returns({ id: 123 });
      fakeUserClass = sandbox
        .stub()
        .returns({ ...sampleUser, setPassword: pwStub, save: saveStub });

      authControllers.__set__("User", fakeUserClass);

      await authControllers.signUp(req, res, next);
    });
    afterEach(() => {
      sandbox.restore();
      authControllers = rewire("./auth");
    });
    it("Should create a new User from the req.body", () => {
      expect(fakeUserClass).to.have.been.calledWithNew;
      expect(fakeUserClass).to.have.been.calledOnceWithExactly({
        username: req.body.username,
        email: req.body.email,
      });
    });
    it("Should hash and salt the password", () => {
      expect(pwStub).to.have.been.calledOnceWithExactly(req.body.password);
    });
    it("Should try to save the User", () => {
      expect(saveStub).to.have.been.calledOnce;
    });
    it("Should sign and send back a token if successful", () => {
      expect(signStub).to.have.been.calledOnceWith(
        {
          id: sampleUser._id,
          username: sampleUser.username,
        },
        undefined, //JWT secret
        { expiresIn: "14d" }
      );
      expect(jsonStub).to.have.been.calledOnceWithExactly({
        token: "fake_token",
      });
    });
    it("Should pass an error if save fails", async () => {
      saveStub.throws({ code: 500, message: "fake_message" });
      await authControllers.signUp(req, res, next);

      expect(next).to.have.been.calledOnceWithExactly({
        code: 500,
        message: "fake_message",
      });
    });
    it("Should replace the default mongoose duplicate error", async () => {
      saveStub.throws({ code: 11000, message: "fake_message" });
      await authControllers.signUp(req, res, next);

      expect(next).to.have.been.calledOnceWithExactly({
        code: 11000,
        message: "Username or email already taken",
      });
    });
  });
});

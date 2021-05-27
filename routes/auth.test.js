const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const rewire = require("rewire");
const chaiHttp = require("chai-http");
chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.use(chaiHttp);

const express = require("express");
const app = express();
var authRoutes = rewire("./auth");
var authControllers = rewire("../controllers/auth");
var catchAsync = rewire("../utils/catchAsync");

// var User = require("../models/user");

app.use("/", authRoutes);
var sandbox = sinon.createSandbox();

describe("Auth routes", () => {
  let catchStub;
  let signUpStub;
  beforeEach(() => {
    sandbox.restore();
    signUpStub = sandbox.stub(authControllers, "signUp").returns("signup");
    // catchAsync.__set__("wrapper", catchStub);
  });
  // afterEach(() => {});

  context("POST /signup", () => {
    it("should be ok", (done) => {
      chai
        .request(app)
        .post("/signup")
        .send({ data: "foo" })
        .then((res) => {
          expect(res.status).to.equal(200);
          expect(signUpStub).to.have.been.calledOnce;
          done();
        })
        .catch((e) => {
          done(e);
        });
    });
  });
});

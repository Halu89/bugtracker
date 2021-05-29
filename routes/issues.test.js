const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const chaiSinon = require("sinon-chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiSinon);
chai.use(chaiAsPromised);
const request = require("supertest");
const rewire = require("rewire");

const express = require("express");

let issuesRoutes = rewire("./issues");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use("/", issuesRoutes);
let sandbox = sinon.createSandbox();

describe("Issues routes", () => {
  let stub;
  beforeEach(() => {
    // stub = sandbox.stub().returns((req, res, next) => {
    //   console.log("here");
    //   return res.status(200).send("It worked !");
    // });
    // issuesRoutes.__set__("catchAsync", stub);
  });
  afterEach(() => {
    issuesRoutes = rewire("./issues");
  });
  context("GET /", () => {
    // it.only("should get a passing test");
    it("should get /", (done) => {
      stub = sandbox.stub().returns((req, res, next) => {
        console.log("here");
        done();
        // res.status(200).send("It worked !");
      });
      issuesRoutes.__set__("catchAsync", stub);
      request(app).get("/").expect(200);
      // .end(function (err, res) {
      //   done(err);
      //   expect(stub).to.have.been.calledOnce;
      // }, done);
    });
  });
});

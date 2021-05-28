const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const chaiSinon = require("sinon-chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiSinon);
chai.use(chaiAsPromised);
const request = require("supertest");

const express = require("express");
const issueController = require("../controllers/issues");
const indexStub = sinon.stub(issueController, "index").resolves("something");

const issuesRoutes = require("./issues");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use("/", issuesRoutes);

describe("Issues routes", () => {
  context("GET /", () => {
    it.only("should get a passing test");
    it("should get /", (done) => {
      request(app)
        .get("/")
        .expect(200)
        .end(function (err, res) {
          expect();
          expect(indexStub).to.have.been.calledOnce;
        }, done);
    });
  });
});

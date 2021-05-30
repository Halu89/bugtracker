const chai = require("chai");
const expect = chai.expect;
const rewire = require("rewire");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const mongoose = require("mongoose");
var User = rewire("./user");
const { sampleUser } = require("../utils/tests/sampleData");

describe("User model", () => {
  it("Should return an error if email missing", () => {
    let user = new User();

    user.validate((err) => {
      expect(err.errors.email).to.exist;
    });
  });
  it("Should use the passportLocalMongoose plugin", () => {
    const userSchema = User.__get__("UserSchema");

    expect(userSchema.paths).to.have.property("username");
    expect(userSchema.paths).to.have.property("hash");
    expect(userSchema.paths).to.have.property("salt");
    expect(userSchema.methods).to.have.property("setPassword");
    expect(userSchema.methods).to.have.property("authenticate");
  });
  it("Should save username, email, projects, and issues fields", () => {
    let user = new User(sampleUser);
    expect(user.username).to.equal(sampleUser.username);
    expect(user.email).to.equal(sampleUser.email);
    expect(user.projects).to.be.an("array").deep.equal(sampleUser.projects);
    expect(user.issues).to.deep.equal(sampleUser.issues);
  });

  context("findOneAndAuth", () => {
    let authStub, stub;
    it("Should auth a user", async () => {
      stub = sinon.stub().resolves(true);
      authStub = sinon.stub(User, "authenticate").returns(stub);

      let res = await User.findOneAndAuth("foo", "bar");
      expect(authStub).to.have.been.calledOnce;
      expect(stub).to.have.been.calledOnceWithExactly("foo", "bar");
      expect(res).to.be.true;
      stub.rejects(new Error("Invalid username or password"));
      await expect(
        User.findOneAndAuth("foo", "bar")
      ).to.eventually.be.rejectedWith("Invalid username or password");
    });
  });
});

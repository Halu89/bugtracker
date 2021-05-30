const chai = require("chai");
const expect = chai.expect;
const rewire = require("rewire");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const mongoose = require("mongoose");
var Issue = rewire("./issue");

const {
  sampleProject,
  sampleIssue,
  sampleUser,
} = require("../utils/tests/sampleData");

describe("Issue Model", () => {
  context("Basic fields", () => {
    it("Should return error if required areas are missing", (done) => {
      let issue = new Issue();

      issue.validate((err) => {
        expect(err.errors.title).to.exist;
        expect(err.errors.project).to.exist;
        expect(err.errors.author).to.exist;
        expect(err.errors.description).to.not.exist;
        expect(err.errors.assignedTo).to.not.exist;
        expect(err.errors.statusText).to.not.exist;
        expect(err.errors.isOpen).to.not.exist;

        done();
      });
    });

    it("should have all fields", () => {
      let issue = new Issue(sampleIssue);

      expect(issue).to.have.property("title").to.equal(sampleIssue.title);
      expect(issue)
        .to.have.property("description")
        .to.equal(sampleIssue.description);
      expect(issue).to.have.property("project").to.equal(sampleIssue.project);
      expect(issue).to.have.property("author").to.equal(sampleIssue.author);
      expect(issue)
        .to.have.property("statusText")
        .to.equal(sampleIssue.statusText);
      expect(issue)
        .to.have.property("assignedTo")
        .to.deep.equal(sampleIssue.assignedTo);
      expect(issue).to.have.property("isOpen").be.true;

      expect(issue).to.have.property("createdAt");
      expect(issue).to.have.property("updatedAt");
    });
  });
  context("Middlewares", () => {
    let userSaveStub, projectSaveStub, findStub, pullStub;
    const postSave = Issue.__get__("postSave");
    const postDelete = Issue.__get__("postDelete");

    beforeEach(() => {
      sinon.restore();
      userSaveStub = sinon.stub();
      projectSaveStub = sinon.stub();

      findStub = sinon.stub(mongoose.Model, "findById");
      sampleProject.save = projectSaveStub;
      sampleUser.save = userSaveStub;
      // First call on the user
      findStub.onCall(0).resolves(sampleUser);
      // Second call on the project
      findStub.onCall(1).resolves(sampleProject);
    });
    context("postSave", () => {
      it("Should add the issue to the related author field on save", async () => {
        //Save a copy of the user issues
        const preSaveIssues = [...sampleUser.issues];
        await postSave(sampleIssue);
        expect(findStub).to.have.been.calledTwice;
        expect(findStub.getCall(0)).to.have.been.calledWithExactly(
          sampleIssue.author._id
        );

        //Verify that the issue has been added to the user
        expect(userSaveStub).to.have.been.calledOn(
          sinon.match.has(
            "issues",
            sinon.match.array.deepEquals([...preSaveIssues, sampleIssue._id])
          )
        );
      });
      it("Should add the issue to the Project", async () => {
        // Save a copy of the project issues
        const preSave = [...sampleProject.issues];
        await postSave(sampleIssue);
        expect(findStub.getCall(1)).to.have.been.calledWithExactly(
          sampleIssue.project._id
        );
        //Verify that the issue has been added to the project
        expect(projectSaveStub).to.have.been.calledOn(
          sinon.match.has(
            "issues",
            sinon.match.array.deepEquals([...preSave, sampleIssue._id])
          )
        );
      });
    });
    context("postDelete", () => {
      beforeEach(() => {
        sinon.reset();
        pullStub = sinon.stub();
        class fakeArrayClass extends Array {
          constructor() {
            super();
            this.pull = pullStub;
          }
        }
        // Redefine the stubs to add a pull method to the array
        findStub.onFirstCall().resolves({
          issues: new fakeArrayClass(1, 2, sampleIssue._id),
          save: userSaveStub,
        });
        findStub.onSecondCall().resolves({
          issues: new fakeArrayClass(1, 2, sampleIssue._id),
          save: projectSaveStub,
        });
      });
      it("Should remove the issue to the related author field on delete", async () => {
        await postDelete(sampleIssue);

        expect(findStub.getCall(0)).to.have.been.calledWith(
          sampleIssue.author._id
        );
        expect(pullStub.getCall(0)).to.have.been.calledWith(sampleIssue._id);
        // Can't verify the user object without re implementing the MongooseArray.prototype.pull method
        // https://mongoosejs.com/docs/api.html#mongoosearray_MongooseArray-pull
      });
      it("Should remove the issue to the related project", async () => {
        await postDelete(sampleIssue);

        expect(findStub).to.have.been.calledTwice;
        expect(pullStub).to.have.been.calledTwice;

        expect(findStub.getCall(1)).to.have.been.calledWith(
          sampleIssue.project._id
        );
        expect(pullStub.getCall(1)).to.have.been.calledWith(sampleIssue._id);
      });
    });
  });
});

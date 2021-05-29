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
const User = require("./user");
const { fake } = require("sinon");

describe("Issue Model", () => {
  let id4 = new mongoose.Types.ObjectId();
  let id1 = new mongoose.Types.ObjectId();
  let id2 = new mongoose.Types.ObjectId();
  let id3 = new mongoose.Types.ObjectId();
  const sampleIssue = {
    _id: id4,
    title: "foo",
    description: "fake_description",
    project: "TODO",
    author: id1,
    assignedTo: [id3, id2],
    statusText: "fake_status",
  };
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
    let saveStub, findStub, pullStub;
    const postSave = Issue.__get__("postSave");
    const postDelete = Issue.__get__("postDelete");

    beforeEach(() => {
      sinon.restore();
      saveStub = sinon.stub();
      pullStub = sinon.stub();
      findStub = sinon
        .stub(mongoose.Model, "findById")
        .resolves({ issues: [1, 2, 3], save: saveStub });
    });

    it("Should add the issue to the related author field on save", async () => {
      await postSave(sampleIssue);
      expect(findStub).to.have.been.calledOnceWithExactly(
        sampleIssue.author._id
      );
      expect(saveStub).to.have.been.calledOn(
        sinon.match.has(
          "issues",
          sinon.match.array.deepEquals([1, 2, 3, sampleIssue._id])
        )
      );
    });
    it("Should remove the issue to the related author field on delete", async () => {
      sinon.reset();
      class fakeArrayClass extends Array {
        constructor() {
          super();
          this.pull = pullStub;
        }
      }
      findStub.resolves({
        issues: new fakeArrayClass(1, 2, sampleIssue._id),
        save: saveStub,
      });

      await postDelete(sampleIssue);

      expect(findStub).to.have.been.calledOnceWithExactly(
        sampleIssue.author._id
      );
      expect(pullStub).to.have.been.calledWith(sampleIssue._id);
    });
  });
});

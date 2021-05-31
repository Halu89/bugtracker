const chai = require("chai");
const expect = chai.expect;
const rewire = require("rewire");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const mongoose = require("mongoose");
const Project = rewire("./project");
const { sampleProject, sampleUser } = require("../utils/tests/sampleData");
const sandbox = sinon.createSandbox();

describe("Project Model", () => {
  context("Basic fields", () => {
    it("Should return error if required areas are missing", (done) => {
      let project = new Project();

      project.validate((err) => {
        expect(err.errors.name).to.exist;
        expect(err.errors.description).to.exist;
        expect(err.errors.author).to.exist;
        expect(err.errors.issues).to.not.exist;

        done();
      });
    });
    it("Should have all fields", () => {
      let project = new Project(sampleProject);

      expect(project).to.have.property("name").to.equal(sampleProject.name);
      expect(project)
        .to.have.property("description")
        .to.equal(sampleProject.description);
      expect(project).to.have.property("author").to.equal(sampleProject.author);
      expect(project)
        .to.have.property("issues")
        .to.deep.equal(sampleProject.issues);
      expect(project).to.have.property("createdAt");
      expect(project).to.have.property("updatedAt");
    });
  });
  context("Middleware", () => {
    let saveStub, pullStub, sampleProjectAuthor, deleteStub, findStub;
    const postSave = Project.__get__("postSave");
    const postDelete = Project.__get__("postDelete");

    beforeEach(() => {
      saveStub = sandbox.stub();
      pullStub = sandbox.stub();
      sampleProjectAuthor = { ...sampleUser, save: saveStub };
      deleteStub = sandbox.stub(mongoose.Model, "findByIdAndDelete");
      findStub = sandbox
        .stub(mongoose.Model, "findById")
        .resolves(sampleProjectAuthor);
    });
    afterEach(() => {
      sandbox.restore();
    });
    context("On save", () => {
      it("Should add the project to the related author field on save", async () => {
        const preSave = [...sampleProjectAuthor.projects];
        await postSave(sampleProject);
        expect(findStub).to.have.been.calledOnceWithExactly(
          sampleProject.author._id
        );

        expect(saveStub).to.have.been.calledOn(
          sinon.match.has(
            "projects",
            sinon.match.array.deepEquals([...preSave, sampleProject._id])
          )
        );
      });
    });

    context("On delete", () => {
      beforeEach(() => {
        //Add a pull method to the arrays
        class fakeArrayClass extends Array {
          constructor() {
            super();
            this.pull = pullStub;
          }
        }
        sampleProjectAuthor.projects = new fakeArrayClass(
          1,
          2,
          sampleProject._id
        );
      });
      it("Should remove the project in the author projects array on delete", async () => {
        await postDelete(sampleProject);

        expect(findStub).to.have.been.calledOnceWithExactly(
          sampleProject.author._id
        );
        expect(pullStub).to.have.been.calledOnceWithExactly(sampleProject._id);
      });

      it("Should delete all the issues related to the project", async () => {
        await postDelete(sampleProject);

        expect(deleteStub.callCount).to.eq(sampleProject.issues.length);
        expect(deleteStub).to.have.been.calledWith(
          sinon.match.in(sampleProject.issues)
        );
      });
    });
  });
});

const mongoose = require("mongoose");

const User = require("../models/user");
const Issue = require("../models/issue");
const Project = require("../models/project");

const DB_URI = "mongodb://localhost:27017/test-bugtracker";

mongoose
  .connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log(`Database connected`))
  .catch((e) => console.error(`Error with the database connection`, e.message));

async function seedDb() {
  await User.deleteMany();
  await Issue.deleteMany();
  await Project.deleteMany();

  let user1 = new User({ username: "aa", email: "aa@gmail.com" });
  await user1.setPassword("aa");
  user1 = await user1.save();
  let user2 = new User({ username: "bb", email: "bb@gmail.com" });
  await user2.setPassword("bb");
  user2 = await user2.save();
  let project1 = await Project.create({
    name: "Cookie Factory",
    description: "Where all the elves work to bring joy around the world.",
    author: user1._id,
  });
  let project2 = await Project.create({
    name: "Gift Shop",
    description: "Find happiness and consume!",
    author: user1._id,
  });
  const arr = new Array(5);
  for (let i = 0; i < 5; i++) {
    Issue.create({
      author: user1._id,
      title: `Issue ${i}`,
      description: "Created by aa",
      project: project1._id,
    });
  }
}

seedDb();

setTimeout(() => {
  mongoose.connection.close();
}, 5 * 1000)
  .then(() => {
    console.log("Closing connection to db");
  })
  .catch((e) => {
    console.log(e);
  });

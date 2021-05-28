const mongoose = require("mongoose");
const Issue = require("./issue");
const User = require("./user");

const DB_URI =
  process.env.NODE_ENV === "production"
    ? process.env.DB_URI
    : "mongodb://localhost:27017/test-bugtracker";

mongoose
  .connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log(`Database connected`))
  .catch((e) => console.error(`Error with the database connection`, e.message));

//LOG mongoose operations if NODE_ENV = dev
mongoose.set("debug", function (collectionName, methodName, ...methodArgs) {
  if (process.env.NODE_ENV !== "dev") return;
  if (methodName === "createIndex") return; //Filter that operation
  const args = methodArgs.map((arg) => JSON.stringify(arg)).join(", ");
  console.log(`Mongoose: ${collectionName}.${methodName}(${args})`);
});

// mongoose.set("debug", true)
module.exports = { Issue, User };

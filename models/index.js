const mongoose = require("mongoose");
const Issue = require("./issue");
const User = require("./user");

const DB_URI = process.env.DB_URI || "mongodb://localhost:27017/bugtracker";

mongoose
  .connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    // debug:true
  })
  .then(() => console.log(`Database connected (${DB_URI})`))
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

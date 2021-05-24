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

// mongoose.set("debug", function(collectionName, methodName, ...methodArgs) {
//   if (methodName==="createIndex") return
//   console.log(`Mongoose: ${collectionName}.${methodName}(${methodArgs.join(', ')})`)
// });

mongoose.set("debug", true)
module.exports = { Issue, User };

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  projects: [{ type: Schema.Types.ObjectId, ref: "Project" }], // TODO
  issues: [{ type: Schema.Types.ObjectId, ref: "Issue" }],
});

// Adds a username, hashed password and salt values and a few methods to help auth users
UserSchema.plugin(passportLocalMongoose);

UserSchema.statics.findOneAndAuth = async function (username, password) {
  return this.authenticate()(username, password);
};

const User = mongoose.model("User", UserSchema);

module.exports = User;

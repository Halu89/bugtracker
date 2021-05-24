const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
  issues: [{ type: Schema.Types.ObjectId, ref: "Issue" }],
});

// Add a username, hashed password and salt value
UserSchema.plugin(passportLocalMongoose);

//TODO add method findOneAndAuthenticate

UserSchema.statics.findOneAndAuth = async function (username, password) {
  
  const user = await this.authenticate(username,password)
  console.log('user :>> ', user.toString());
    
  
};
const User = mongoose.model("User", UserSchema);

module.exports = User;

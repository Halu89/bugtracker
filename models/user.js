const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    issues: [{ type: Schema.Types.ObjectId, ref: "Issue" }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

import * as mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a Project name"],
  },
  owner: {
    type: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
});

export default mongoose.models.UserSchema ||
  mongoose.model("Project", ProjectSchema);

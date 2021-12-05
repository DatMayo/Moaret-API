import * as mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a Project name"],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Please provide an owner"],
  },
});

export default mongoose.models.ProjectSchema ||
  mongoose.model("Project", ProjectSchema);

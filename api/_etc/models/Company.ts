import * as mongoose from "mongoose";

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a company name"],
  },
  owner: {
    type: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  project: {
    type: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  },
  member: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
});

export default mongoose.models.CompanySchema ||
  mongoose.model("Company", CompanySchema);

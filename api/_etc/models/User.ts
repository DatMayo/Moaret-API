import * as mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide a username"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
    },
    locked: {
      type: Number,
      default: 0,
    },
    displayName: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: 0,
    },
    createdFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.UserSchema || mongoose.model("User", UserSchema);

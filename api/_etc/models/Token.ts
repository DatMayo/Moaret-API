import * as mongoose from "mongoose";

const TokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true],
    },
    userId: {
      type: String,
      required: [true],
    },
  },
  { timestamps: true }
);

export default mongoose.models.TokenSchema ||
  mongoose.model("Token", TokenSchema);

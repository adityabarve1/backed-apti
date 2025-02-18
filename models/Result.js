import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  testName: String,
  score: Number,
  timeTaken: Number,
});

export default mongoose.model("Result", resultSchema);

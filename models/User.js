const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rollNo: { type: String, required: true },
  studentClass: { type: String, required: true }, // ✅ Renamed to avoid reserved keyword issue
  backlogs: { type: Number, default: 0 },
  cgpa: { type: Number, required: true, min: 0, max: 10 },
  resume: { type: String, required: true },
  attendedTests: { type: [String], default: [] },
  results: [
    {
      testId: String,
      score: Number,
      timestamp: { type: Date, default: Date.now },  // Submission time
      testStartTime: {  type: Date, default: Date.now },  // Test start time
    }
  ]
});

module.exports = mongoose.model("User", UserSchema);

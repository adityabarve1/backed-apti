const mongoose = require("mongoose");

const TestSchema = new mongoose.Schema({
    testName: { type: String, required: true },
    duration: { type: Number, required: true }, // Duration in minutes
    questions: [
        {
            question: { type: String, required: true },
            options: [{ type: String, required: true }],
            correctAnswer: { type: String, required: true }
        }
    ],
    attendedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] // Tracks students who took the test
});

module.exports = mongoose.model("Test", TestSchema);

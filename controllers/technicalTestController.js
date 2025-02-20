const Test = require("../models/Test");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");




// Get available tests (excluding attended ones)
exports.technicalgetAvailableTests = async (req, res) => {
    try {
        // Check if req.user exists and has an id
        if (!req.user || !req.user.id) {
            return res.status(400).json({ error: "User not authenticated" });
        }

        // Fetch the user by ID
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        console.log("Fetching tests for user:", user._id);

        // Path to the tests folder
        const testsFolderPath = path.join(__dirname, "../technical_tests");

        // Check if tests folder exists
        if (!fs.existsSync(testsFolderPath)) {
            return res.status(404).json({ error: "Tests folder not found" });
        }

        // Read all JSON files
        const testFiles = fs.readdirSync(testsFolderPath);
        const testData = testFiles
            .filter(file => file.endsWith(".json")) // Ensure only JSON files are read
            .map(file => {
                const filePath = path.join(testsFolderPath, file);

                try {
                    const fileContent = fs.readFileSync(filePath, "utf-8").trim(); // Trim to remove accidental empty spaces

                    if (!fileContent) {
                        console.warn(`Skipping empty test file: ${file}`);
                        return null;
                    }

                    const testContent = JSON.parse(fileContent);
                    return { ...testContent, _id: file.replace(".json", "") }; // Add test ID
                } catch (error) {
                    console.error(`Error reading JSON file ${file}:`, error.message);
                    return null;
                }
            })
            .filter(test => test !== null); // Remove null values (invalid JSON files)

        console.log("Valid Tests from JSON files:", testData);

        // Exclude attended tests
        const attendedTests = user.attendedTests || [];
        const availableTests = testData.filter(test => !attendedTests.includes(test._id));

        res.json(availableTests);
    } catch (error) {
        console.error("Error fetching tests:", error);
        res.status(500).json({ error: "Failed to fetch tests" });
    }
};


// Get test questions with shuffled order
exports.technicalgetTestQuestions = async (req, res) => {
    try {
        const { testId } = req.params;
        const user = await User.findById(req.user.id);

        // Prevent reattempting the test
        if (user.attendedTests.includes(testId)) {
            return res.status(400).json({ message: "You have already attended this test." });
        }

        const testFilePath = path.join(__dirname, `../technical_tests/${testId}.json`);
        if (!fs.existsSync(testFilePath)) {
            return res.status(404).json({ message: "Test not found" });
        }

        const testData = JSON.parse(fs.readFileSync(testFilePath, "utf-8"));

        // Shuffle questions and options
        let shuffledQuestions = testData.questions.sort(() => Math.random() - 0.5);
        shuffledQuestions = shuffledQuestions.map(q => ({
            ...q,
            options: q.options.sort(() => Math.random() - 0.5),
        }));

        res.json({ ...testData, questions: shuffledQuestions });
    } catch (error) {
        console.error("Error retrieving test:", error);
        res.status(500).json({ message: "Server error" });
    }
};


  

// Mark test as attended
exports.technicalmarkTestAsAttended = async (req, res) => {
    try {
        console.log("Marking test as attended for user:", req.user.id);

        await User.findByIdAndUpdate(
            req.user.id,
            { $addToSet: { attendedTests: req.params.testId } }, // ✅ Prevents duplicates
            { new: true }
        );
        res.json({ message: "Test marked as attended" });
    } catch (error) {
        console.error("Error marking test as attended:", error);
        res.status(500).json({ error: "Failed to mark test" });
    }
};



exports.technicalsubmitTest = async (req, res) => {
    try {
        const { testId } = req.params;
        const { answers } = req.body; // Get submitted answers
        const user = await User.findById(req.user.id);

        // Read test from JSON file
        const testFilePath = path.join(__dirname, `../technical_tests/${testId}.json`);
        if (!fs.existsSync(testFilePath)) {
            return res.status(404).json({ message: "Test not found" });
        }
        const testData = JSON.parse(fs.readFileSync(testFilePath, "utf-8"));

        // Debug: Check what answers were received
        console.log("Received Answers:", answers);

        // Calculate Score
        let score = 0;
        testData.questions.forEach((question) => {
            const submittedAnswer = answers[String(question.id)];
            // console.log(`Q${question.id}: Submitted -> ${submittedAnswer}, Correct -> ${question.answer}`);
            
            if (submittedAnswer === question.answer) {
                score += question.marks;
            }
        });

        // Save result in database
        user.results.push({
            testId,
            score,
            timestamp: new Date()
        });

        user.attendedTests.push(testId); // Mark test as attended
        await user.save();

        res.json({ message: "Test submitted successfully", score });
    } catch (error) {
        console.error("Error submitting test:", error);
        res.status(500).json({ error: "Failed to submit test" });
    }
};

// backend/controllers/testController.js


// Controller to save the test start time
exports.technicalstartTest = async (req, res) => {
  try {
    const { userId, testId } = req.body; // Get userId and testId from the request body

    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the user has already attended this test
    const testIndex = user.results.findIndex((result) => result.testId === testId);

    if (testIndex !== -1) {
      return res.status(400).json({ error: 'Test already started' });
    }

    // Add the start time for the test
    user.results.push({
      testId: testId,
      testStartTime: new Date(), // Set current date and time as test start time
    });

    // Save the user object with the updated results
    await user.save();

    res.status(200).json({ success: true, message: 'Test start time saved successfully!' });
  } catch (error) {
    console.error("Error saving test start time:", error);
    res.status(500).json({ error: 'Failed to save test start time' });
  }
};

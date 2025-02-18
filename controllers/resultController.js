const User = require("../models/User");
const XLSX = require("xlsx");

// Fetch test results by test ID (No token validation required)
exports.getTestResults = async (req, res) => {
    try {
      const testId = req.params.testId;
      const results = await User.find({ "results.testId": testId });

      const validResults = results.map((user) => {
        // Filter out the results for the specific test
        const testResults = user.results.filter((result) => result.testId === testId);

        // Assuming result.timestamp is the submission time
        // and testStartTime is the start time of the test
        const validTestResults = testResults.map((result) => {
            const submissionTime = result.timestamp && result.timestamp instanceof Date && !isNaN(result.timestamp)
              ? result.timestamp.getTime() // submission time in milliseconds
              : null;

            const testStartTime = result.testStartTime && result.testStartTime instanceof Date && !isNaN(result.testStartTime)
              ? result.testStartTime.getTime() // start time in milliseconds
              : null;

            // Ensure both times are valid
            if (submissionTime && testStartTime) {
              const completionTime = (submissionTime - testStartTime) / 60000; // convert to minutes

              return {
                rollNo: user.rollNo,
                name: user.name,
                studentClass: user.studentClass,
                score: result.score,
                completionTime: completionTime >= 0 ? completionTime : null, // Ensure no negative times
              };
            } else {
              return {
                rollNo: user.rollNo,
                name: user.name,
                studentClass: user.studentClass,
                score: result.score,
                completionTime: null, // Return null if invalid times
              };
            }
        });

        return validTestResults;
      }).flat(); // Flatten the array to get a single array of results

      // Sort results by score and completion time (if desired)
      validResults.sort((a, b) => b.score - a.score || a.timestamp - b.timestamp);

      res.json({ detailedResults: validResults });
    } catch (error) {
      console.error("Error fetching test results:", error);
      res.status(500).send("Error fetching test results.");
    }
};

// Download results as Excel file (No token validation required)
exports.downloadTestResults = async (req, res) => {
  try {
    const { testId } = req.params;

    // Fetch users who attended the test
    const users = await User.find({ "results.testId": testId }, "rollNo name studentClass results");

    // Prepare data for Excel
    const excelData = users.map(user => {
      const testResult = user.results.find(result => result.testId === testId);
      const completionTime = testResult.timestamp && testResult.testStartTime
        ? (testResult.timestamp.getTime() - testResult.testStartTime.getTime()) / 60000 // completion time in minutes
        : null;
      
      return {
        RollNo: user.rollNo,
        Name: user.name,
        Class: user.studentClass,
        TotalMarks: testResult.score,
        CompletionTime: completionTime !== null ? completionTime.toFixed(2) : "N/A", // Added completion time in minutes
      };
    });

    // Sort data by roll number and class
    excelData.sort((a, b) => a.Class.localeCompare(b.Class) || a.RollNo.localeCompare(b.RollNo));

    // Create Excel sheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Test Results");

    // Export Excel file
    const excelBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Disposition", `attachment; filename=${testId}_Results.xlsx`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(excelBuffer);
  } catch (error) {
    console.error("Error downloading test results:", error);
    res.status(500).json({ error: "Failed to download results" });
  }
};

const express = require("express");
const router = express.Router();
const {
    downloadTestResults,
    getTestResults
} = require("../controllers/resultController");

// Bypass token validation for the result routes, no authentication required
router.use("/test/:testId/results", (req, res, next) => {
  next(); // Bypass token check for test results
});

router.use("/test/:testId/download", (req, res, next) => {
  next(); // Bypass token check for test download
});

// Route to fetch test results by test ID
router.get("/test/:testId/results", getTestResults);

// Route to download test results as Excel file
router.get("/test/:testId/download", downloadTestResults);

module.exports = router;

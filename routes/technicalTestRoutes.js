const express = require("express");
const {
  technicalgetAvailableTests,
  technicalgetTestQuestions,
  technicalmarkTestAsAttended,
  technicalsubmitTest,
  technicalstartTest
} = require("../controllers/technicalTestController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, technicalgetAvailableTests); // Fetch available tests
router.get("/:testId", authMiddleware, technicalgetTestQuestions); // Fetch test details with questions
router.post("/:testId/attended", authMiddleware, technicalmarkTestAsAttended); // Mark test as attended
router.post("/:testId/submit", authMiddleware, technicalsubmitTest);
router.post("/startTest_technical",technicalstartTest); 

module.exports = router;

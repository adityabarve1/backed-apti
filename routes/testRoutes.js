const express = require("express");
const {
  getAvailableTests,
  getTestQuestions,
  markTestAsAttended,
  submitTest,
  startTest
} = require("../controllers/testController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getAvailableTests); // Fetch available tests
router.get("/:testId", authMiddleware, getTestQuestions); // Fetch test details with questions
router.post("/:testId/attended", authMiddleware, markTestAsAttended); // Mark test as attended
router.post("/:testId/submit", authMiddleware, submitTest);
router.post("/startTest", startTest);



module.exports = router;

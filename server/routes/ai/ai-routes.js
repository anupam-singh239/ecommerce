const express = require("express");

const {
  chatWithAI,
  listAIModels,
} = require("../../controllers/ai/ai-controller");

const router = express.Router();

// AI Chat
router.post("/chat", chatWithAI);

// Gemini Models Diagnostic
router.get("/models", listAIModels);

module.exports = router;
const express = require("express");

const {
  chatWithAI,
  listAIModels,
} = require("../../controllers/ai/ai-controller");

const router = express.Router();

// AI Chat
router.post("/chat", chatWithAI);

// Check available Gemini models
router.get("/models", listAIModels);

module.exports = router;
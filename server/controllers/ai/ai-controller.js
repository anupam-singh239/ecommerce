const { GoogleGenAI } = require("@google/genai");
const Product = require("../../models/Product");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// =====================================================
// AI CHAT
// =====================================================

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // =================================================
    // GET PRODUCTS FROM MONGODB
    // =================================================

    const products = await Product.find({})
      .select(
        "title description category brand price salePrice totalStock averageReview"
      )
      .limit(100)
      .lean();

    // =================================================
    // CREATE PRODUCT CONTEXT
    // =================================================

    const productContext = products
      .map((product) => {
        return `
Product ID: ${product._id}
Title: ${product.title || ""}
Category: ${product.category || ""}
Brand: ${product.brand || ""}
Price: ₹${product.price || 0}
Sale Price: ₹${product.salePrice || 0}
Stock: ${product.totalStock || 0}
Rating: ${product.averageReview || 0}
Description: ${product.description || ""}
`;
      })
      .join("\n");

    // =================================================
    // AI PROMPT
    // =================================================

    const prompt = `
You are an AI shopping assistant for an e-commerce website.

Your job is to help customers find products from the products available in the database.

IMPORTANT RULES:

1. Only recommend products that exist in the provided product list.
2. Never invent products.
3. Never invent prices.
4. Never invent brands.
5. Never invent ratings.
6. Never invent stock.
7. Never invent product details.
8. If the requested product is not available, clearly say that it is not available.
9. Keep the answer simple and useful.
10. Mention product name, price and relevant details when recommending products.
11. If multiple products match, show the most relevant products.
12. Answer the customer naturally.
13. If the customer asks for products under a specific budget, only recommend products within that budget.
14. If the customer asks for a category, only recommend products from that category.
15. If the customer asks for a rating, use the available averageReview value.
16. Do not claim a product is in stock if totalStock is 0.
17. If salePrice exists and is lower than price, mention the sale price.
18. If no matching product exists, clearly tell the customer.
19. Use Indian Rupees (₹) for prices.
20. Keep the response short and easy to understand.

AVAILABLE PRODUCTS:

${productContext}

CUSTOMER QUESTION:

${message}

Answer the customer based ONLY on the available products.
`;

    // =================================================
    // GEMINI AI REQUEST WITH RETRY
    // =================================================

    let response;
    let lastError;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Gemini AI attempt ${attempt}/3`);

        response = await ai.models.generateContent({
          model: "gemini-3.5-flash-lite",
          contents: prompt,
        });

        console.log(
          `Gemini AI attempt ${attempt} successful`
        );

        break;
      } catch (error) {
        lastError = error;

        console.error(
          `Gemini AI attempt ${attempt} failed:`,
          error.message
        );

        if (attempt < 3) {
          const delay = attempt * 2000;

          console.log(
            `Retrying Gemini AI after ${delay / 1000} seconds...`
          );

          await new Promise((resolve) => {
            setTimeout(resolve, delay);
          });
        }
      }
    }

    // =================================================
    // ALL RETRIES FAILED
    // =================================================

    if (!response) {
      throw lastError;
    }

    // =================================================
    // SUCCESS RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message:
        response.text ||
        "Sorry, I could not generate a response.",
      productsCount: products.length,
    });
  } catch (error) {
    console.error("AI Error:", error);

    return res.status(500).json({
      success: false,
      message: "AI response failed",
      error: error.message,
    });
  }
};

// =====================================================
// LIST AVAILABLE GEMINI MODELS
// =====================================================

const listAIModels = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY is missing",
      });
    }

    // Google Gemini REST Models API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(
        apiKey
      )}&pageSize=100`
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Gemini Models API Error:",
        data
      );

      return res.status(response.status).json({
        success: false,
        message: "Gemini Models API failed",
        error: data,
      });
    }

    // =================================================
    // ALL MODELS
    // =================================================

    const models = (data.models || []).map((model) => ({
      name: model.name,
      baseModelId: model.baseModelId,
      version: model.version,
      displayName: model.displayName,
      supportedGenerationMethods:
        model.supportedGenerationMethods || [],
      inputTokenLimit: model.inputTokenLimit,
      outputTokenLimit: model.outputTokenLimit,
    }));

    // =================================================
    // ONLY MODELS THAT SUPPORT generateContent
    // =================================================

    const generateContentModels = models.filter((model) =>
      model.supportedGenerationMethods.includes(
        "generateContent"
      )
    );

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      totalModels: models.length,
      generateContentModels,
    });
  } catch (error) {
    console.error(
      "List Gemini Models Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch Gemini models",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  chatWithAI,
  listAIModels,
};
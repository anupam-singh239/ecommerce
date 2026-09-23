const { GoogleGenAI } = require("@google/genai");
const Product = require("../../models/Product");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// =====================================================
// HELPERS
// =====================================================

const getSecureImageUrl = (url) => {
  if (!url) return "";

  return String(url).replace(
    "http://res.cloudinary.com/",
    "https://res.cloudinary.com/"
  );
};

const getEffectivePrice = (product) => {
  const price = Number(product?.price || 0);
  const salePrice = Number(product?.salePrice || 0);

  if (salePrice > 0 && salePrice < price) {
    return salePrice;
  }

  return price;
};

// =====================================================
// EXTRACT BUDGET FROM USER MESSAGE
// =====================================================

const extractBudget = (message) => {
  if (!message) return null;

  const text = message.toLowerCase();

  const hasBudgetKeyword =
    text.includes("under") ||
    text.includes("below") ||
    text.includes("less than") ||
    text.includes("within") ||
    text.includes("upto") ||
    text.includes("up to") ||
    text.includes("maximum") ||
    text.includes("max");

  if (!hasBudgetKeyword) {
    return null;
  }

  // Example:
  // ₹10000
  // ₹10,000
  // 10000
  // 10k
  // rs 10000
  const match = text.match(
    /(?:₹|rs\.?|inr)?\s*(\d[\d,]*(?:\.\d+)?)\s*(k)?/i
  );

  if (!match) {
    return null;
  }

  let amount = Number(match[1].replace(/,/g, ""));

  if (match[2]?.toLowerCase() === "k") {
    amount = amount * 1000;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return amount;
};

// =====================================================
// EXTRACT CATEGORY FROM USER MESSAGE
// =====================================================

const extractCategory = (message) => {
  if (!message) return null;

  const text = message.toLowerCase();

  const categories = [
    "men",
    "women",
    "kids",
    "footwear",
    "accessories",
    "electronics",
  ];

  for (const category of categories) {
    if (text.includes(category)) {
      return category;
    }
  }

  return null;
};

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

    const userMessage = message.trim();

    // =================================================
    // DETECT USER REQUIREMENTS
    // =================================================

    const budget = extractBudget(userMessage);
    const category = extractCategory(userMessage);

    console.log("AI User Question:", userMessage);
    console.log("Detected Budget:", budget);
    console.log("Detected Category:", category);

    // =================================================
    // GET PRODUCTS FROM DATABASE
    // =================================================

    const products = await Product.find({})
      .select(
        "_id title description category brand image price salePrice totalStock averageReview"
      )
      .limit(200)
      .lean();

    // =================================================
    // FILTER PRODUCTS
    // =================================================

    let filteredProducts = products;

    // -------------------------------------------------
    // CATEGORY FILTER
    // -------------------------------------------------

    if (category) {
      filteredProducts = filteredProducts.filter((product) => {
        return (
          String(product?.category || "").toLowerCase() ===
          category.toLowerCase()
        );
      });
    }

    // -------------------------------------------------
    // BUDGET FILTER
    // -------------------------------------------------

    if (budget) {
      filteredProducts = filteredProducts.filter((product) => {
        const effectivePrice = getEffectivePrice(product);

        return effectivePrice <= budget;
      });
    }

    // -------------------------------------------------
    // ONLY IN-STOCK PRODUCTS
    // -------------------------------------------------

    filteredProducts = filteredProducts.filter((product) => {
      return Number(product?.totalStock || 0) > 0;
    });

    console.log(
      "Products Before Filtering:",
      products.length
    );

    console.log(
      "Products After Filtering:",
      filteredProducts.length
    );

    // =================================================
    // NO PRODUCT FOUND
    // =================================================

    if (filteredProducts.length === 0) {
      let noProductMessage =
        "Sorry, requested products are not available.";

      if (category && budget) {
        noProductMessage = `Sorry, ${category} category mein ₹${budget.toLocaleString(
          "en-IN"
        )} ke under koi product available nahi hai.`;
      } else if (category) {
        noProductMessage = `Sorry, ${category} category mein abhi koi product available nahi hai.`;
      } else if (budget) {
        noProductMessage = `Sorry, ₹${budget.toLocaleString(
          "en-IN"
        )} ke under koi product available nahi hai.`;
      }

      return res.status(200).json({
        success: true,
        message: noProductMessage,
        products: [],
        productsCount: 0,
      });
    }

    // =================================================
    // CREATE PRODUCT CONTEXT FOR AI
    // =================================================

    const productContext = filteredProducts
      .map((product, index) => {
        const effectivePrice = getEffectivePrice(product);

        return `
Product ${index + 1}
Product ID: ${product._id}
Title: ${product.title || ""}
Category: ${product.category || ""}
Brand: ${product.brand || ""}
Original Price: ₹${product.price || 0}
Sale Price: ₹${product.salePrice || 0}
Effective Price: ₹${effectivePrice}
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
You are an AI shopping assistant for an Indian e-commerce website.

Customer question:
"${userMessage}"

You MUST answer ONLY using the products provided below.

IMPORTANT RULES:

1. Never invent a product.
2. Never invent a price.
3. Never invent a brand.
4. Never invent a rating.
5. Never invent stock.
6. Never invent product details.
7. Only recommend products from the provided product list.
8. All provided products are already filtered according to the customer's requirements.
9. If a budget is mentioned, do NOT recommend anything above that budget.
10. If a category is mentioned, recommend only products from that category.
11. Do not recommend products that are out of stock.
12. If sale price is available and lower than original price, mention sale price.
13. Use Indian Rupees ₹.
14. Keep the answer short and friendly.
15. Recommend maximum 4 products.
16. Do not create markdown tables.
17. Do not create fake product links.
18. Do not mention products that are not in the provided list.

AVAILABLE FILTERED PRODUCTS:

${productContext}

Now answer the customer naturally.

Do not include product JSON.
Do not include product IDs.
Just give a short helpful shopping response.
`;

    // =================================================
    // GEMINI AI REQUEST
    // =================================================

    let response;
    let lastError;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(
          `Gemini AI attempt ${attempt}/3`
        );

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
            `Retrying Gemini AI after ${
              delay / 1000
            } seconds...`
          );

          await new Promise((resolve) => {
            setTimeout(resolve, delay);
          });
        }
      }
    }

    if (!response) {
      throw lastError;
    }

    // =================================================
    // PRODUCT DATA FOR FRONTEND
    // =================================================

    const productCards = filteredProducts
      .slice(0, 4)
      .map((product) => ({
        _id: product._id,
        title: product.title,
        category: product.category,
        brand: product.brand,
        image: getSecureImageUrl(product.image),
        price: Number(product.price || 0),
        salePrice: Number(product.salePrice || 0),
        effectivePrice: getEffectivePrice(product),
        totalStock: Number(product.totalStock || 0),
        averageReview: Number(
          product.averageReview || 0
        ),
      }));

    // =================================================
    // SUCCESS RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message:
        response.text ||
        "Sorry, I could not generate a response.",

      products: productCards,

      productsCount: productCards.length,

      filters: {
        category: category || null,
        budget: budget || null,
      },
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

    const models = (data.models || []).map(
      (model) => ({
        name: model.name,
        baseModelId: model.baseModelId,
        version: model.version,
        displayName: model.displayName,
        supportedGenerationMethods:
          model.supportedGenerationMethods || [],
        inputTokenLimit:
          model.inputTokenLimit,
        outputTokenLimit:
          model.outputTokenLimit,
      })
    );

    const generateContentModels =
      models.filter((model) =>
        model.supportedGenerationMethods.includes(
          "generateContent"
        )
      );

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
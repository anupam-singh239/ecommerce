const { GoogleGenAI } = require("@google/genai");
const Product = require("../../models/Product");


// ============================================================
// GEMINI SETUP
// ============================================================

const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey,
});

const GEMINI_MODEL = "gemini-3.5-flash-lite";


// ============================================================
// HELPER: SECURE IMAGE URL
// ============================================================

function getSecureImageUrl(image) {
  if (!image) return "";

  if (typeof image === "string") {
    return image.replace(/^http:\/\//i, "https://");
  }

  if (Array.isArray(image)) {
    const firstImage = image[0];

    if (typeof firstImage === "string") {
      return firstImage.replace(/^http:\/\//i, "https://");
    }

    if (firstImage?.url) {
      return firstImage.url.replace(/^http:\/\//i, "https://");
    }

    if (firstImage?.secure_url) {
      return firstImage.secure_url;
    }
  }

  if (image?.secure_url) {
    return image.secure_url;
  }

  if (image?.url) {
    return image.url.replace(/^http:\/\//i, "https://");
  }

  return "";
}


// ============================================================
// HELPER: EFFECTIVE PRICE
// ============================================================

function getEffectivePrice(product) {
  const salePrice = Number(product.salePrice || 0);
  const price = Number(product.price || 0);

  if (salePrice > 0 && salePrice < price) {
    return salePrice;
  }

  return price;
}


// ============================================================
// HELPER: EXTRACT BUDGET
// ============================================================

function extractBudget(message) {
  if (!message) return null;

  const text = message.toLowerCase();

  const budgetKeywords = [
    "under",
    "below",
    "within",
    "less than",
    "upto",
    "up to",
    "budget",
    "ke andar",
    "tak",
    "se kam",
    "maximum",
    "max",
  ];

  const hasBudgetKeyword = budgetKeywords.some((keyword) =>
    text.includes(keyword)
  );

  if (!hasBudgetKeyword) {
    return null;
  }

  // ₹10,000 / ₹10000 / 10000
  const rupeeMatch = text.match(
    /₹\s*([\d,]+(?:\.\d+)?)/
  );

  if (rupeeMatch) {
    return Number(rupeeMatch[1].replace(/,/g, ""));
  }

  // 10k / 5k
  const kMatch = text.match(
    /(\d+(?:\.\d+)?)\s*k\b/
  );

  if (kMatch) {
    return Number(kMatch[1]) * 1000;
  }

  // normal number
  const numberMatch = text.match(
    /\b(\d+(?:,\d{3})*(?:\.\d+)?)\b/
  );

  if (numberMatch) {
    return Number(
      numberMatch[1].replace(/,/g, "")
    );
  }

  return null;
}


// ============================================================
// HELPER: EXTRACT CATEGORY
// ============================================================

function extractCategory(message) {
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
}


// ============================================================
// HELPER: GREETING CHECK
// ============================================================

function isGreetingMessage(message) {
  if (!message) return false;

  const text = message.toLowerCase().trim();

  const greetings = [
    "hi",
    "hii",
    "hiii",
    "hiiii",
    "hello",
    "hey",
    "heyy",
    "heyyy",
    "namaste",
    "namaskar",

    "good morning",
    "good afternoon",
    "good evening",
    "good night",

    "thanks",
    "thank you",
    "thankyou",
    "thx",
  ];

  return greetings.includes(text);
}


// ============================================================
// AI CHAT
// ============================================================

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please enter a message.",
        products: [],
        productsCount: 0,
      });
    }

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return res.status(400).json({
        success: false,
        message: "Please enter a message.",
        products: [],
        productsCount: 0,
      });
    }


    // ========================================================
    // GREETING
    // ========================================================
    // IMPORTANT:
    // "hey", "hi", "hello" etc. par products nahi dikhayenge.
    // Gemini API call bhi nahi lagegi.
    // ========================================================

    if (isGreetingMessage(trimmedMessage)) {
      return res.status(200).json({
        success: true,

        message:
          "Hey there! 👋 Welcome to our store. How can I help you shop today? We have great products across electronics, fashion, footwear, and more!",

        products: [],

        productsCount: 0,

        filters: {
          category: null,
          budget: null,
        },
      });
    }


    // ========================================================
    // EXTRACT USER REQUIREMENTS
    // ========================================================

    const budget = extractBudget(trimmedMessage);

    const category = extractCategory(trimmedMessage);


    console.log("========================================");
    console.log("AI USER MESSAGE:", trimmedMessage);
    console.log("AI CATEGORY:", category);
    console.log("AI BUDGET:", budget);
    console.log("========================================");


    // ========================================================
    // FETCH PRODUCTS
    // ========================================================

    let products = await Product.find({})
      .select(
        "_id title description category brand image price salePrice totalStock averageReview"
      )
      .limit(200)
      .lean();


    // ========================================================
    // CATEGORY FILTER
    // ========================================================

    if (category) {
      const categoryLower = category.toLowerCase();

      products = products.filter((product) => {
        const productCategory =
          String(product.category || "").toLowerCase();

        return productCategory === categoryLower;
      });
    }


    // ========================================================
    // BUDGET FILTER
    // ========================================================

    if (budget !== null) {
      products = products.filter((product) => {
        const effectivePrice =
          getEffectivePrice(product);

        return effectivePrice <= budget;
      });
    }


    // ========================================================
    // STOCK FILTER
    // ========================================================

    products = products.filter((product) => {
      const stock = Number(product.totalStock || 0);

      return stock > 0;
    });


    // ========================================================
    // NO PRODUCTS FOUND
    // ========================================================

    if (products.length === 0) {
      let noProductMessage =
        "Sorry, I couldn't find matching products";

      if (category && budget !== null) {
        noProductMessage +=
          ` in the ${category} category under ₹${budget.toLocaleString(
            "en-IN"
          )}.`;
      } else if (category) {
        noProductMessage +=
          ` in the ${category} category.`;
      } else if (budget !== null) {
        noProductMessage +=
          ` under ₹${budget.toLocaleString("en-IN")}.`;
      } else {
        noProductMessage += ".";
      }

      return res.status(200).json({
        success: true,

        message:
          noProductMessage +
          " Try another category or budget.",

        products: [],

        productsCount: 0,

        filters: {
          category,
          budget,
        },
      });
    }


    // ========================================================
    // PRODUCT CARDS FOR FRONTEND
    // ========================================================

    const productCards = products
      .slice(0, 4)
      .map((product) => {
        const effectivePrice =
          getEffectivePrice(product);

        return {
          _id: product._id,

          title: product.title || "",

          description:
            product.description || "",

          category:
            product.category || "",

          brand:
            product.brand || "",

          image:
            getSecureImageUrl(product.image),

          price:
            Number(product.price || 0),

          salePrice:
            Number(product.salePrice || 0),

          effectivePrice,

          totalStock:
            Number(product.totalStock || 0),

          averageReview:
            Number(product.averageReview || 0),
        };
      });


    // ========================================================
    // PRODUCTS DATA FOR GEMINI
    // ========================================================

    const productsForAI = products
      .slice(0, 50)
      .map((product) => {
        const effectivePrice =
          getEffectivePrice(product);

        return {
          id: String(product._id),

          title: product.title,

          category: product.category,

          brand: product.brand,

          price: Number(product.price || 0),

          salePrice:
            Number(product.salePrice || 0),

          effectivePrice,

          stock:
            Number(product.totalStock || 0),

          rating:
            Number(product.averageReview || 0),

          description:
            product.description || "",
        };
      });


    // ========================================================
    // GEMINI PROMPT
    // ========================================================

    const prompt = `
You are an AI shopping assistant for an e-commerce website.

USER MESSAGE:
"${trimmedMessage}"

IMPORTANT RULES:

1. Only recommend products from the PRODUCT DATA below.
2. Never invent a product.
3. Never invent a price.
4. Never invent stock.
5. If a budget is provided, recommend ONLY products within that budget.
6. If a category is provided, prefer ONLY products from that category.
7. Only recommend products that are currently in stock.
8. Be helpful and concise.
9. Reply naturally in the same language/style as the user.
10. Do not show product IDs to the user.
11. Do not create fake specifications.
12. If there are no suitable products, clearly say that no matching product was found.
13. The frontend will separately display product cards, so do not create complicated product tables.

FILTERS:

Category:
${category || "No specific category"}

Maximum Budget:
${budget !== null ? `₹${budget}` : "No specific budget"}

PRODUCT DATA:

${JSON.stringify(productsForAI, null, 2)}

Now answer the user's message naturally.
`;


    // ========================================================
    // GEMINI API
    // ========================================================

    if (!apiKey) {
      console.error(
        "GEMINI_API_KEY is missing."
      );

      return res.status(500).json({
        success: false,

        message:
          "AI service is not configured.",

        products: [],
      });
    }


    let aiResponse = null;

    let lastError = null;


    // Keep existing retry behavior
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(
          `Gemini AI attempt ${attempt}/3`
        );

        const result =
          await ai.models.generateContent({
            model: GEMINI_MODEL,

            contents: prompt,
          });


        aiResponse =
          result?.text || "";


        if (aiResponse) {
          break;
        }


        throw new Error(
          "Gemini returned an empty response."
        );
      } catch (error) {
        lastError = error;

        console.error(
          `Gemini AI attempt ${attempt} failed:`,
          error?.message || error
        );


        if (attempt < 3) {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000)
          );
        }
      }
    }


    // ========================================================
    // GEMINI FAILED
    // ========================================================

    if (!aiResponse) {
      console.error(
        "Gemini final error:",
        lastError
      );

      return res.status(500).json({
        success: false,

        message:
          "AI response failed. Please try again.",

        error:
          lastError?.message ||
          "Unknown AI error",

        products: [],
      });
    }


    // ========================================================
    // SUCCESS RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      message: aiResponse,

      products: productCards,

      productsCount: products.length,

      filters: {
        category,
        budget,
      },
    });
  } catch (error) {
    console.error(
      "AI Controller Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Something went wrong while processing your request.",

      error:
        error?.message || "Unknown error",

      products: [],
    });
  }
};


// ============================================================
// LIST AVAILABLE GEMINI MODELS
// ============================================================

const listAIModels = async (req, res) => {
  try {
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message:
          "GEMINI_API_KEY is missing.",
      });
    }


    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(
        apiKey
      )}`
    );


    const data = await response.json();


    if (!response.ok) {
      return res.status(response.status).json({
        success: false,

        message:
          "Unable to fetch Gemini models",

        error:
          data?.error ||
          data,
      });
    }


    const models =
      data?.models || [];


    const generateContentModels =
      models.filter((model) =>
        Array.isArray(
          model.supportedGenerationMethods
        ) &&
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
      "List AI Models Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to fetch Gemini models",

      error:
        error?.message ||
        "Unknown error",
    });
  }
};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  chatWithAI,
  listAIModels,
};
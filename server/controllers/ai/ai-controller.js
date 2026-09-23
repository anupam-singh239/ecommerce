const { GoogleGenAI } = require("@google/genai");
const Product = require("../../models/Product");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    // Check message
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // ==========================================
    // GET PRODUCTS FROM MONGODB
    // ==========================================

    const products = await Product.find({})
      .select(
        "title description category brand price salePrice totalStock averageReview"
      )
      .limit(100)
      .lean();

    // ==========================================
    // CONVERT PRODUCTS INTO AI CONTEXT
    // ==========================================

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

    // ==========================================
    // AI PROMPT
    // ==========================================

    const prompt = `
You are an AI shopping assistant for an e-commerce website.

Your job is to help customers find products from the products available in the database.

IMPORTANT RULES:

1. Only recommend products that exist in the provided product list.
2. Do not invent products.
3. Do not invent prices, brands, ratings, stock or product details.
4. If the requested product is not available, clearly say that it is not available.
5. Keep the answer simple and useful.
6. Mention product name, price and relevant details when recommending products.
7. If multiple products match, show the most relevant products.
8. Answer the customer naturally.
9. If the customer asks for products under a specific budget, only recommend products within that budget.
10. If the customer asks for a category, only recommend products from that category.
11. If the customer asks for a rating, use the available averageReview value.
12. Do not claim a product is in stock if totalStock is 0.
13. If salePrice is greater than 0 and lower than price, mention the sale price.
14. If no product matches the customer's request, clearly say that no matching product was found.
15. Never create fake product recommendations.
16. Use Indian Rupees (₹) when mentioning prices.
17. Keep recommendations short and easy to understand.

AVAILABLE PRODUCTS:

${productContext}

CUSTOMER QUESTION:

${message}

Now answer the customer based only on the available products.
`;

    // ==========================================
    // GEMINI AI REQUEST WITH RETRY
    // ==========================================

    let response;
    let lastError;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Gemini AI attempt ${attempt}/3`);

        response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
        });

        console.log(`Gemini AI attempt ${attempt} successful`);

        break;
      } catch (error) {
        lastError = error;

        console.error(
          `Gemini AI attempt ${attempt} failed:`,
          error.message
        );

        // Retry only if another attempt is available
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

    // ==========================================
    // ALL RETRIES FAILED
    // ==========================================

    if (!response) {
      throw lastError;
    }

    // ==========================================
    // SEND SUCCESS RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message:
        response.text ||
        "Sorry, I could not generate a response.",
      productsCount: products.length,
    });
  } catch (error) {
    // ==========================================
    // ERROR HANDLING
    // ==========================================

    console.error("AI Error:", error);

    return res.status(500).json({
      success: false,
      message: "AI response failed",
      error: error.message,
    });
  }
};

module.exports = {
  chatWithAI,
};
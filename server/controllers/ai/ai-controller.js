const { GoogleGenAI } = require("@google/genai");
const Product = require("../../models/Product");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // Get products from MongoDB
    const products = await Product.find({})
      .select(
        "title description category brand price salePrice totalStock averageReview"
      )
      .limit(100)
      .lean();

    // Convert products into AI-readable context
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

AVAILABLE PRODUCTS:

${productContext}

CUSTOMER QUESTION:

${message}

Now answer the customer based only on the available products.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return res.status(200).json({
      success: true,
      message: response.text,
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

module.exports = {
  chatWithAI,
};
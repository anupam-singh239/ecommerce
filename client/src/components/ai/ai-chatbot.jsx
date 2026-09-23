import { useState } from "react";
import {
  Bot,
  Send,
  X,
  Sparkles,
  User,
  Star,
  Package,
} from "lucide-react";

import { Button } from "@/components/ui/button";

function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi! 👋 I'm your AI Shopping Assistant. What are you looking for today?",
      products: [],
    },
  ]);

  // =====================================================
  // SECURE CLOUDINARY IMAGE
  // =====================================================

  const secureImageUrl = (url) => {
    if (!url) return "";

    return String(url).replace(
      "http://res.cloudinary.com/",
      "https://res.cloudinary.com/"
    );
  };

  // =====================================================
  // FORMAT PRICE
  // =====================================================

  const formatPrice = (price) => {
    return `₹${Number(price || 0).toLocaleString("en-IN")}`;
  };

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const sendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: trimmedMessage,
        products: [],
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://ecommerce-h0hd.onrender.com/api/ai/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: trimmedMessage,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        console.error(
          "AI API Error:",
          response.status,
          errorText
        );

        throw new Error(
          `AI API failed with status ${response.status}`
        );
      }

      const data = await response.json();

      console.log("AI RESPONSE:", data);

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text:
              data.message ||
              "I received your request.",
            products: Array.isArray(data.products)
              ? data.products
              : [],
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text:
              data.message ||
              "Sorry, I couldn't process your request.",
            products: [],
          },
        ]);
      }
    } catch (error) {
      console.error("AI Chat Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            "Unable to connect with AI. Please try again.",
          products: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // ENTER KEY
  // =====================================================

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // =====================================================
  // PRODUCT CARD
  // =====================================================

  const ProductCard = ({ product }) => {
    if (!product) return null;

    const originalPrice = Number(product.price || 0);
    const salePrice = Number(product.salePrice || 0);

    const effectivePrice =
      Number(product.effectivePrice || 0) ||
      (salePrice > 0 && salePrice < originalPrice
        ? salePrice
        : originalPrice);

    const hasDiscount =
      salePrice > 0 && salePrice < originalPrice;

    const discount = hasDiscount
      ? Math.round(
          ((originalPrice - salePrice) /
            originalPrice) *
            100
        )
      : 0;

    const imageUrl = secureImageUrl(product.image);

    return (
      <div
        className="
          mt-3
          overflow-hidden
          rounded-xl
          border
          bg-white
          shadow-sm
          transition
          hover:shadow-md
        "
      >
        {/* Product Image */}

        <div className="relative bg-gray-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title || "Product"}
              className="
                h-32
                w-full
                object-cover
                sm:h-40
              "
              loading="lazy"
            />
          ) : (
            <div
              className="
                flex
                h-32
                items-center
                justify-center
                text-gray-400
                sm:h-40
              "
            >
              <Package size={36} />
            </div>
          )}

          {/* Discount */}

          {discount > 0 && (
            <span
              className="
                absolute
                left-2
                top-2
                rounded-full
                bg-red-500
                px-2
                py-1
                text-[10px]
                font-bold
                text-white
              "
            >
              {discount}% OFF
            </span>
          )}

          {/* Stock */}

          <span
            className="
              absolute
              right-2
              top-2
              max-w-[45%]
              truncate
              rounded-full
              bg-green-600
              px-2
              py-1
              text-[10px]
              font-semibold
              text-white
            "
          >
            {product.totalStock} in stock
          </span>
        </div>

        {/* Product Info */}

        <div className="p-3">
          <h4
            className="
              line-clamp-2
              text-sm
              font-bold
              text-gray-900
            "
          >
            {product.title}
          </h4>

          {/* Brand / Category */}

          <div className="mt-2 flex flex-wrap gap-1">
            {product.brand && (
              <span
                className="
                  max-w-[48%]
                  truncate
                  rounded-md
                  bg-blue-50
                  px-2
                  py-1
                  text-[10px]
                  font-medium
                  text-blue-700
                "
              >
                {product.brand}
              </span>
            )}

            {product.category && (
              <span
                className="
                  max-w-[48%]
                  truncate
                  rounded-md
                  bg-gray-100
                  px-2
                  py-1
                  text-[10px]
                  font-medium
                  text-gray-600
                "
              >
                {product.category}
              </span>
            )}
          </div>

          {/* Price */}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className="
                text-base
                font-bold
                text-blue-600
              "
            >
              {formatPrice(effectivePrice)}
            </span>

            {hasDiscount && (
              <span
                className="
                  text-xs
                  text-gray-400
                  line-through
                "
              >
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          {/* Rating */}

          <div className="mt-2 flex items-center gap-1">
            <Star
              size={14}
              className="fill-yellow-400 text-yellow-400"
            />

            <span className="text-xs font-medium">
              {Number(
                product.averageReview || 0
              ).toFixed(1)}
            </span>

            <span className="text-[10px] text-gray-400">
              rating
            </span>
          </div>
        </div>
      </div>
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      {/* =================================================
          FLOATING AI BUTTON
      ================================================= */}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="
            fixed
            bottom-4
            right-4
            z-50
            flex
            items-center
            gap-2
            rounded-full
            bg-blue-600
            px-4
            py-3
            text-white
            shadow-xl
            transition
            hover:scale-105
            hover:bg-blue-700
            sm:bottom-6
            sm:right-6
            sm:px-5
          "
        >
          <Sparkles size={20} />

          <span className="font-semibold">
            Ask AI
          </span>
        </button>
      )}

      {/* =================================================
          CHAT WINDOW
      ================================================= */}

      {open && (
        <div
          className="
            fixed
            inset-x-0
            bottom-0
            right-0
            z-50
            flex
            h-[100dvh]
            w-full
            min-h-0
            flex-col
            overflow-hidden
            rounded-none
            border
            bg-white
            shadow-2xl

            sm:inset-x-auto
            sm:bottom-6
            sm:right-6
            sm:h-[calc(100dvh-120px)]
            sm:w-[390px]
            sm:max-w-[calc(100vw-24px)]
            sm:rounded-2xl
            sm:border
          "
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <div
            className="
              flex
              shrink-0
              items-center
              justify-between
              bg-blue-600
              px-3
              py-3
              text-white
              sm:px-4
              sm:py-4
            "
          >
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-white/20
                  sm:h-10
                  sm:w-10
                "
              >
                <Bot size={20} className="sm:h-[22px] sm:w-[22px]" />
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold sm:text-base">
                  AI Shopping Assistant
                </h3>

                <p className="text-[11px] text-blue-100 sm:text-xs">
                  Powered by AI
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="
                shrink-0
                rounded-full
                p-2
                transition
                hover:bg-white/20
              "
            >
              <X size={20} />
            </button>
          </div>

          {/* =================================================
              MESSAGES
          ================================================= */}

          <div
            className="
              min-h-0
              flex-1
              space-y-4
              overflow-y-auto
              overscroll-contain
              bg-gray-50
              p-3
              sm:p-4
            "
          >
            {messages.map((item, index) => (
              <div
                key={index}
                className={`flex gap-2 ${
                  item.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {/* AI ICON */}

                {item.role === "ai" && (
                  <div
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-blue-100
                      text-blue-600
                    "
                  >
                    <Bot size={16} />
                  </div>
                )}

                {/* AI CONTENT */}

                <div
                  className="
                    min-w-0
                    max-w-[88%]
                    sm:max-w-[82%]
                  "
                >
                  {/* Text */}

                  <div
                    className={`break-words rounded-2xl px-3 py-2.5 text-sm sm:px-4 sm:py-3 ${
                      item.role === "user"
                        ? "rounded-br-md bg-blue-600 text-white"
                        : "rounded-bl-md bg-white text-gray-800 shadow-sm"
                    }`}
                  >
                    {item.text}
                  </div>

                  {/* Product Cards */}

                  {item.role === "ai" &&
                    Array.isArray(item.products) &&
                    item.products.length > 0 && (
                      <div className="mt-1 w-full">
                        {item.products.map((product) => (
                          <ProductCard
                            key={product._id}
                            product={product}
                          />
                        ))}
                      </div>
                    )}
                </div>

                {/* USER ICON */}

                {item.role === "user" && (
                  <div
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-gray-200
                      text-gray-600
                    "
                  >
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}

            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (
              <div className="flex items-center gap-2">
                <div
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-blue-100
                    text-blue-600
                  "
                >
                  <Bot size={16} />
                </div>

                <div
                  className="
                    rounded-2xl
                    bg-white
                    px-4
                    py-3
                    text-sm
                    text-gray-500
                    shadow-sm
                  "
                >
                  AI is thinking...
                </div>
              </div>
            )}
          </div>

          {/* =================================================
              INPUT
          ================================================= */}

          <div className="shrink-0 border-t bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Ask about products..."
                disabled={loading}
                className="
                  h-11
                  min-w-0
                  flex-1
                  rounded-xl
                  border
                  px-3
                  text-sm
                  outline-none
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                  disabled:bg-gray-100
                  sm:px-4
                "
              />

              <Button
                type="button"
                onClick={sendMessage}
                disabled={!message.trim() || loading}
                className="
                  h-11
                  w-11
                  shrink-0
                  rounded-xl
                  p-0
                "
              >
                <Send size={18} />
              </Button>
            </div>

            <p
              className="
                mt-2
                text-center
                text-[10px]
                text-gray-400
                sm:text-[11px]
              "
            >
              AI recommendations are based on available products.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default AIChatbot;

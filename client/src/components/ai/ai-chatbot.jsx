import { useState } from "react";
import { Bot, Send, X, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";

function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi! 👋 I'm your AI Shopping Assistant. What are you looking for today?",
    },
  ]);

  const sendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: trimmedMessage,
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

      // Check HTTP response first
      if (!response.ok) {
        const errorText = await response.text();

        console.error("AI API Error:", response.status, errorText);

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
              "I received your request, but no response was returned.",
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
          },
        ]);
      }
    } catch (error) {
      console.error("AI Chat Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Unable to connect with AI. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating AI Button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="
            fixed
            bottom-6
            right-6
            z-50
            flex
            items-center
            gap-2
            rounded-full
            bg-blue-600
            px-5
            py-3
            text-white
            shadow-xl
            transition
            hover:bg-blue-700
            hover:scale-105
          "
        >
          <Sparkles size={20} />

          <span className="font-semibold">
            Ask AI
          </span>
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div
          className="
            fixed
            bottom-6
            right-6
            z-50
            flex
            h-[600px]
            w-[380px]
            max-w-[calc(100vw-24px)]
            flex-col
            overflow-hidden
            rounded-2xl
            border
            bg-white
            shadow-2xl
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-blue-600 px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <Bot size={22} />
              </div>

              <div>
                <h3 className="font-bold">
                  AI Shopping Assistant
                </h3>

                <p className="text-xs text-blue-100">
                  Powered by AI
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-2 transition hover:bg-white/20"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4">
            {messages.map((item, index) => (
              <div
                key={index}
                className={`flex gap-2 ${
                  item.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {/* AI Icon */}
                {item.role === "ai" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Bot size={16} />
                  </div>
                )}

                {/* Message */}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    item.role === "user"
                      ? "rounded-br-md bg-blue-600 text-white"
                      : "rounded-bl-md bg-white text-gray-800 shadow-sm"
                  }`}
                >
                  {item.text}
                </div>

                {/* User Icon */}
                {item.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Bot size={16} />
                </div>

                <div className="rounded-2xl bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
                  AI is thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t bg-white p-3">
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
                  flex-1
                  rounded-xl
                  border
                  px-4
                  text-sm
                  outline-none
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                  disabled:bg-gray-100
                "
              />

              <Button
                type="button"
                onClick={sendMessage}
                disabled={!message.trim() || loading}
                className="h-11 w-11 rounded-xl p-0"
              >
                <Send size={18} />
              </Button>
            </div>

            <p className="mt-2 text-center text-[11px] text-gray-400">
              AI recommendations are based on available products.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default AIChatbot;
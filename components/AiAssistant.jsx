"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Sparkles, Bot } from "lucide-react";
import clsx from "clsx";

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I am PRO ENTREPREUNEUR, the AI Ambassador for HEC Entrepreneurs IHEC Carthage. I can guide you through our tracks, help you find a co-founder, or unlock resources. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");

    // Mock AI logic based on keywords
    setTimeout(() => {
      let response = "That's an interesting question. I'd recommend exploring our Discover track to learn more.";
      const lowerInput = input.toLowerCase();

      if (lowerInput.includes("fund") || lowerInput.includes("money") || lowerInput.includes("invest")) {
        response = "For funding and scaling, our **Scale Track** is perfect for you. We offer VC Office Hours and a fast-track to Station F.";
      } else if (lowerInput.includes("learn") || lowerInput.includes("start") || lowerInput.includes("idea")) {
        response = "Great! To get started, check out the **Discover Track**. We have Speaker Series and Intro to Tech workshops.";
      } else if (lowerInput.includes("team") || lowerInput.includes("founder") || lowerInput.includes("partner")) {
        response = "Looking for a team? Head over to our **TeamUp** section to find your perfect co-founder match.";
      } else if (lowerInput.includes("aws") || lowerInput.includes("notion") || lowerInput.includes("perk")) {
        response = "We offer great perks like AWS credits and Notion Enterprise! Check the **Resources** page (Members Only).";
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response }
      ]);
    }, 1000);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-4 left-4 md:left-auto md:right-6 md:w-96 h-[500px] glass rounded-2xl overflow-hidden z-50 flex flex-col border border-zinc-200 shadow-2xl shadow-zinc-200/50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-white to-zinc-50 p-4 border-b border-zinc-100 flex justify-between items-center backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-foreground to-zinc-500 flex items-center justify-center border border-zinc-200 shadow-lg shadow-zinc-100 animate-pulse-slow">
                  <Bot className="w-5 h-5 text-background" />
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-tighter text-zinc-900 italic">
                    PRO ENTREPREUNEUR
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">AI Ambassador</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={clsx(
                    "max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed font-medium",
                    msg.role === "user"
                      ? "ml-auto bg-foreground text-background rounded-br-none shadow-lg shadow-zinc-200"
                      : "bg-white border border-zinc-100 text-zinc-800 rounded-bl-none shadow-sm"
                  )}
                >
                  {msg.content}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-100 bg-white/80 backdrop-blur-md">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask PRO ENTREPREUNEUR..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 pr-12 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-all focus:bg-white shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-foreground text-background hover:bg-zinc-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-md shadow-zinc-200"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button (The Orb) */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full z-50 group pointer-events-auto shadow-2xl shadow-zinc-400/20"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-foreground to-zinc-400 rounded-full animate-pulse-slow blur-md opacity-30 group-hover:opacity-50 transition-opacity" />
        <div className="relative w-full h-full bg-white rounded-full border border-zinc-200 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-zinc-100 to-zinc-50 opacity-50" />
          <Sparkles className="w-8 h-8 text-foreground relative z-10 animate-pulse" />
        </div>

        {/* Helper Bubble */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 1 }}
              className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-white/80 backdrop-blur-md border border-zinc-200 rounded-xl whitespace-nowrap shadow-xl shadow-zinc-200/50"
            >
              <p className="text-sm font-black text-zinc-900 flex items-center gap-2 italic">
                <span className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse" />
                Chat with PRO ENTREPRENEUR
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}

"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Sparkles, Bot } from "lucide-react";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Salut ! 👋 Je suis **PRO ENTREPRENEUR**, l'ambassadeur IA de HEC Entrepreneurs IHEC Carthage.\n\nJe suis là pour t'accompagner dans ton aventure entrepreneuriale : que ce soit pour trouver un co-fondateur, accéder à nos ressources ou simplement discuter de ton projet. Comment puis-je t'aider aujourd'hui ?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.error }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Désolé, une erreur de connexion s'est produite. Veuillez réessayer." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-4 left-4 md:left-auto md:right-6 md:w-96 h-[500px] glass rounded-2xl overflow-hidden z-50 flex flex-col border border-primary/30 shadow-2xl shadow-primary/10"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-4 border-b border-white/10 flex justify-between items-center backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center border border-white/20 shadow-lg shadow-primary/20 animate-pulse-slow">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-light text-xs tracking-[0.2em] text-white uppercase">
                    PRO ENTREPRENEUR
                  </h3>
                  <p className="text-[10px] text-secondary font-mono uppercase tracking-widest">Ambassadeur IA</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={clsx(
                    "max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed",
                    msg.role === "user"
                      ? "ml-auto bg-primary text-white rounded-br-none shadow-lg shadow-primary/10"
                      : "bg-white/10 border border-white/5 text-gray-200 rounded-bl-none shadow-lg"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="max-w-[85%] p-3.5 rounded-2xl bg-white/10 border border-white/5 rounded-bl-none shadow-lg flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Posez votre question à PRO ENTREPREUNEUR..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all focus:bg-white/10 shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary hover:bg-primary/80 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
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
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full z-50 group pointer-events-auto"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-full animate-pulse-slow blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
        <div className="relative w-full h-full bg-black rounded-full border border-white/20 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/50 to-secondary/50 opacity-50" />
          <Sparkles className="w-8 h-8 text-white relative z-10 animate-pulse" />
        </div>

        {/* Helper Bubble */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 1 }}
              className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl whitespace-nowrap hidden md:block"
            >
              <p className="text-sm font-light text-white flex items-center gap-2 tracking-wide">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Discutez avec PRO ENTREPRENEUR
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}

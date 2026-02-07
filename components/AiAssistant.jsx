"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Sparkles, Bot } from "lucide-react";
import clsx from "clsx";

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Bonjour ! Je suis PRO ENTREPREUNEUR, l'ambassadeur IA de HEC Entrepreneurs IHEC Carthage. Je peux vous guider à travers nos parcours, vous aider à trouver un co-fondateur ou débloquer des ressources. Comment puis-je vous aider aujourd'hui ?" }
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
      let response = "C'est une question intéressante. Je vous recommande d'explorer notre parcours Découvrir pour en savoir plus.";
      const lowerInput = input.toLowerCase();

      if (lowerInput.includes("financement") || lowerInput.includes("argent") || lowerInput.includes("investir") || lowerInput.includes("funds")) {
        response = "Pour le financement et le passage à l'échelle, notre **Parcours Propulser** est parfait pour vous. Nous proposons des VC Office Hours et un accès privilégié à Station F.";
      } else if (lowerInput.includes("apprendre") || lowerInput.includes("commencer") || lowerInput.includes("idée") || lowerInput.includes("start")) {
        response = "Excellent ! Pour commencer, consultez le **Parcours Découvrir**. Nous avons des séries de conférences et des ateliers d'initiation à la tech.";
      } else if (lowerInput.includes("équipe") || lowerInput.includes("fondateur") || lowerInput.includes("partenaire") || lowerInput.includes("team")) {
        response = "Vous cherchez une équipe ? Rendez-vous dans notre section **TeamUp** pour trouver le co-fondateur idéal.";
      } else if (lowerInput.includes("aws") || lowerInput.includes("notion") || lowerInput.includes("avantage") || lowerInput.includes("perk")) {
        response = "Nous offrons d'excellents avantages comme des crédits AWS et Notion Enterprise ! Consultez la page **Ressources** (réservée aux membres).";
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
            className="fixed bottom-24 right-4 left-4 md:left-auto md:right-6 md:w-96 h-[500px] glass rounded-2xl overflow-hidden z-50 flex flex-col border border-primary/30 shadow-2xl shadow-primary/10"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-4 border-b border-white/10 flex justify-between items-center backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center border border-white/20 shadow-lg shadow-primary/20 animate-pulse-slow">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-wider text-white">
                    PRO ENTREPREUNEUR
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
                  {msg.content}
                </div>
              ))}
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
                  disabled={!input.trim()}
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
              className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl whitespace-nowrap"
            >
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Discutez avec PRO ENTREPREUNEUR
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}

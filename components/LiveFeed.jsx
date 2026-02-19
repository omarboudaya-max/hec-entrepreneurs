"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Reply, User, Zap } from "lucide-react";
import clsx from "clsx";

export default function LiveFeed() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, user: "Amine", content: "Quelqu'un est motivé pour le hackathon de demain ?", replies: [] },
        {
            id: 2, user: "Sarra", content: "Moi ! Je cherche justement une équipe tech.", replies: [
                { id: 3, user: "Kais", content: "Je suis partant, on se voit au club ?" }
            ]
        }
    ]);
    const [input, setInput] = useState("");
    const [replyTo, setReplyTo] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        if (replyTo) {
            setMessages(prev => prev.map(msg =>
                msg.id === replyTo.id
                    ? { ...msg, replies: [...msg.replies, { id: Date.now(), user: "Vous", content: input }] }
                    : msg
            ));
            setReplyTo(null);
        } else {
            setMessages(prev => [...prev, { id: Date.now(), user: "Vous", content: input, replies: [] }]);
        }
        setInput("");
    };

    return (
        <div className="fixed bottom-8 left-8 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9, x: -20 }}
                        animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9, x: -20 }}
                        className="absolute bottom-20 left-0 w-[350px] md:w-[400px] h-[500px] glass rounded-[2rem] border border-secondary/30 shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 bg-gradient-to-r from-secondary/20 to-primary/20 border-b border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-white/20">
                                    <Zap className="w-5 h-5 text-white animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm uppercase tracking-widest text-white">Live Feed</h3>
                                    <p className="text-[10px] text-secondary font-mono">Communauté en direct</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white pb-1">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black/40 custom-scrollbar">
                            {messages.map((msg) => (
                                <div key={msg.id} className="space-y-3">
                                    <div className="flex items-start gap-3 group">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-secondary">
                                            <User size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-black text-white uppercase tracking-tighter">{msg.user}</span>
                                                <span className="text-[8px] text-gray-500 font-mono">À l'instant</span>
                                            </div>
                                            <p className="text-sm text-gray-300 leading-relaxed">{msg.content}</p>
                                            <button
                                                onClick={() => setReplyTo(msg)}
                                                className="text-[10px] text-secondary font-bold uppercase tracking-widest mt-2 flex items-center gap-1 hover:gap-2 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Reply size={10} /> Répondre
                                            </button>
                                        </div>
                                    </div>

                                    {/* Replies */}
                                    {msg.replies.map((reply) => (
                                        <div key={reply.id} className="ml-11 flex items-start gap-3 border-l-2 border-white/5 pl-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{reply.user}</span>
                                                </div>
                                                <p className="text-xs text-gray-400">{reply.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSubmit} className="p-4 bg-black/60 border-t border-white/10">
                            {replyTo && (
                                <div className="mb-2 px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-lg flex justify-between items-center">
                                    <span className="text-[10px] text-secondary font-bold uppercase">Réponse à {replyTo.user}</span>
                                    <button onClick={() => setReplyTo(null)} className="text-secondary"><X size={12} /></button>
                                </div>
                            )}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Écrivez un message..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 pr-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-secondary/50 transition-all font-medium"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-secondary hover:bg-secondary/80 rounded-lg text-white disabled:opacity-50 transition-all"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Icon Trigger */}
            <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 rounded-full bg-black border border-white/20 flex items-center justify-center relative group overflow-hidden shadow-2xl shadow-secondary/20"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-secondary/50 to-primary/50 opacity-0 group-hover:opacity-40 transition-opacity" />
                <div className="absolute inset-x-0 bottom-0 h-1 bg-secondary animate-pulse" />
                <MessageCircle className="w-8 h-8 text-white relative z-10" />
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-black z-20 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    </span>
                )}
            </motion.button>
        </div>
    );
}

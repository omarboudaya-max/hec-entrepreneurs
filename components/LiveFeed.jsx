"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Reply, User, Zap } from "lucide-react";
import clsx from "clsx";
import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    updateDoc,
    doc,
    arrayUnion,
} from "firebase/firestore";

function timeAgo(timestamp) {
    if (!timestamp) return "À l'instant";
    const seconds = Math.floor((Date.now() - timestamp.toMillis()) / 1000);
    if (seconds < 60) return "À l'instant";
    if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)}h`;
    return `il y a ${Math.floor(seconds / 86400)}j`;
}

export default function LiveFeed() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [replyTo, setReplyTo] = useState(null);
    const [username, setUsername] = useState("");
    const [askingName, setAskingName] = useState(false);
    const [pendingMessage, setPendingMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);

    // Load saved username
    useEffect(() => {
        const saved = localStorage.getItem("livefeed_username");
        if (saved) setUsername(saved);
    }, []);

    // Real-time Firestore listener
    useEffect(() => {
        const q = query(collection(db, "livefeed"), orderBy("createdAt", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    const sendMessage = async (name, content, replyTarget) => {
        if (!content.trim() || isSending) return;
        setIsSending(true);
        try {
            if (replyTarget) {
                // Append reply to existing message
                await updateDoc(doc(db, "livefeed", replyTarget.id), {
                    replies: arrayUnion({ user: name, content, createdAt: new Date().toISOString() }),
                });
            } else {
                await addDoc(collection(db, "livefeed"), {
                    user: name,
                    content,
                    replies: [],
                    createdAt: serverTimestamp(),
                });
            }
        } finally {
            setIsSending(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        if (!username) {
            setPendingMessage(input);
            setAskingName(true);
            return;
        }

        sendMessage(username, input, replyTo);
        setInput("");
        setReplyTo(null);
    };

    const handleNameSubmit = (e) => {
        e.preventDefault();
        const name = e.target.name.value.trim();
        if (!name) return;
        localStorage.setItem("livefeed_username", name);
        setUsername(name);
        setAskingName(false);
        sendMessage(name, pendingMessage, replyTo);
        setInput("");
        setReplyTo(null);
        setPendingMessage("");
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
                                    <h3 className="font-light text-xs uppercase tracking-[0.2em] text-white">Live Feed</h3>
                                    <p className="text-[10px] text-secondary font-mono">
                                        {messages.length} message{messages.length !== 1 ? "s" : ""} · en direct
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white pb-1">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Ask Name Dialog */}
                        <AnimatePresence>
                            {askingName && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-8 gap-4"
                                >
                                    <User className="w-10 h-10 text-secondary" />
                                    <h4 className="text-white font-light uppercase tracking-[0.1em] text-center">Comment vous appelez-vous ?</h4>
                                    <p className="text-gray-400 text-xs text-center">Votre prénom sera visible dans le feed.</p>
                                    <form onSubmit={handleNameSubmit} className="w-full flex flex-col gap-3 mt-2">
                                        <input
                                            name="name"
                                            autoFocus
                                            placeholder="Votre prénom..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-secondary/50"
                                        />
                                        <button type="submit" className="bg-secondary/80 text-white font-light uppercase tracking-[0.2em] text-[10px] py-3 rounded-xl hover:bg-secondary transition-all">
                                            Rejoindre le Live
                                        </button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black/40">
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                                    <MessageCircle className="w-10 h-10 text-secondary/30" />
                                    <p className="text-gray-500 text-sm">Soyez le premier à écrire !</p>
                                </div>
                            )}
                            {messages.map((msg) => (
                                <div key={msg.id} className="space-y-3">
                                    <div className="flex items-start gap-3 group">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-secondary flex-shrink-0">
                                            <User size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-medium text-white/90 uppercase tracking-[0.05em]">{msg.user}</span>
                                                <span className="text-[8px] text-gray-500 font-mono">{timeAgo(msg.createdAt)}</span>
                                            </div>
                                            <p className="text-sm text-gray-300 leading-relaxed break-words">{msg.content}</p>
                                            <button
                                                onClick={() => setReplyTo(msg)}
                                                className="text-[10px] text-secondary font-bold uppercase tracking-widest mt-2 flex items-center gap-1 hover:gap-2 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Reply size={10} /> Répondre
                                            </button>
                                        </div>
                                    </div>

                                    {/* Replies */}
                                    {msg.replies?.map((reply, idx) => (
                                        <div key={idx} className="ml-11 flex items-start gap-3 border-l-2 border-white/5 pl-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-medium text-primary uppercase tracking-[0.05em]">{reply.user}</span>
                                                </div>
                                                <p className="text-xs text-gray-400 break-words">{reply.content}</p>
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
                                    <button type="button" onClick={() => setReplyTo(null)} className="text-secondary"><X size={12} /></button>
                                </div>
                            )}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={username ? `Écrivez en tant que ${username}...` : "Écrivez un message..."}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 pr-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-secondary/50 transition-all font-medium"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isSending}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-secondary hover:bg-secondary/80 rounded-lg text-white disabled:opacity-50 transition-all"
                                >
                                    <Send className={clsx("w-4 h-4", isSending && "animate-pulse")} />
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
                {!isOpen && messages.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full border border-black z-20 flex items-center justify-center text-[9px] font-light text-white">
                        {messages.length > 9 ? "9+" : messages.length}
                    </span>
                )}
            </motion.button>
        </div>
    );
}

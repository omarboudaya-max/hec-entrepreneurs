"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trash2, Minus, Plus, CreditCard, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const router = useRouter();
  
  // Checkout form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "Livraison à l'IHEC Carthage"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const finalTotal = getTotal();

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_info: formData,
          items,
          total_amount: finalTotal
        })
      });

      if (res.ok) {
        setIsSuccess(true);
        clearCart();
      } else {
        alert("Erreur lors de la commande.");
      }
    } catch (e) {
      alert("Erreur réseau");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center pt-24 px-4 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass p-12 rounded-3xl max-w-md w-full border border-primary/30"
        >
          <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-serif mb-4">Commande Réussie !</h1>
          <p className="text-foreground/70 font-light mb-8">
            Merci pour votre commande, {formData.name}. Vous recevrez bientôt un email de confirmation.
          </p>
          <Link 
            href="/store"
            className="inline-flex items-center justify-center w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl transition-all"
          >
            Retour à la boutique
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-20 pt-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link href="/store" className="inline-flex items-center gap-2 text-foreground/60 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Retour à la boutique
        </Link>

        <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-8">
          Votre <span className="text-primary">Panier</span>
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20 glass rounded-3xl border border-white/10">
            <p className="text-xl text-foreground/50 font-light mb-6">Votre panier est vide.</p>
            <Link 
              href="/store"
              className="inline-flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-8 py-3 rounded-xl transition-all"
            >
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div 
                    key={`${item.product.id}-${item.size}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-6 border border-white/10 relative"
                  >
                    <div className="w-24 h-24 relative rounded-xl overflow-hidden shrink-0 bg-black/50">
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="flex-grow text-center sm:text-left">
                      <div className="text-xs text-primary mb-1">{item.product.category}</div>
                      <h3 className="text-lg font-medium text-foreground">{item.product.name}</h3>
                      {item.size && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-white/10 text-xs rounded border border-white/20">
                          Taille : {item.size}
                        </span>
                      )}
                      <div className="text-[#d4af37] font-bold mt-1">
                        {(item.product.discount_price || item.product.price).toFixed(2)} TND
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-black/40 rounded-xl border border-white/10">
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.size, Math.max(1, item.quantity - 1))}
                          className="p-2 text-foreground/60 hover:text-white"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                          className="p-2 text-foreground/60 hover:text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeItem(item.product.id, item.size)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Checkout Form */}
            <div className="lg:col-span-1">
              <div className="glass p-6 rounded-3xl border border-white/10 sticky top-24">
                <h2 className="text-xl font-serif mb-6 border-b border-white/10 pb-4">Résumé de la commande</h2>
                
                <div className="space-y-3 mb-6 text-sm font-light">
                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <span className="text-foreground/70">Total</span>
                    <span className="text-2xl font-bold text-[#d4af37]">{finalTotal.toFixed(2)} TND</span>
                  </div>
                </div>

                <form onSubmit={handleCheckout} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Nom Complet"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Adresse Email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Numéro de Téléphone"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                    />
                  </div>
                  
                  <div className="bg-primary/10 border border-primary/30 p-4 rounded-xl">
                    <h4 className="font-medium text-primary mb-1">Livraison</h4>
                    <p className="text-sm text-foreground/70 font-light">
                      La remise se fera en main propre à l'IHEC Carthage. Notre équipe vous contactera pour fixer un rendez-vous.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || items.length === 0}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 mt-4 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">Traitement en cours...</span>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" /> Valider la commande
                      </>
                    )}
                  </button>
                  <p className="text-xs text-center text-foreground/40 font-light mt-4 flex justify-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Vos données sont sécurisées
                  </p>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

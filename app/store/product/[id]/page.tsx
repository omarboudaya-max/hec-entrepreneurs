"use client";
import React, { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, ShoppingCart, Loader2, Save, Trash2, Edit3, X, ShieldCheck, Truck } from "lucide-react";
import { useCartStore, Product } from "@/store/cartStore";

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { addItem } = useCartStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [sizeInput, setSizeInput] = useState("");

  // Editable fields state
  const [formData, setFormData] = useState<Partial<Product>>({});

  useEffect(() => {
    fetch("/api/auth/session")
      .then(res => res.json())
      .then(data => setIsAdmin(data.isAdmin))
      .catch(() => setIsAdmin(false));

    fetch(`/api/products/${resolvedParams.id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setProduct(data);
          setFormData(data);
        }
      })
      .finally(() => setIsLoading(false));
  }, [resolvedParams.id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/products/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const updated = await res.json();
        setProduct(updated);
        alert("Produit mis à jour avec succès !");
      } else {
        alert("Erreur lors de la mise à jour");
      }
    } catch (e) {
      alert("Erreur réseau");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    const currentSizes = formData.sizes || [];
    setFormData({ ...formData, sizes: currentSizes.filter((s: string) => s !== sizeToRemove) });
  };

  const handleAddSize = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    const currentSizes = formData.sizes || [];
    if (sizeInput.trim() && !currentSizes.includes(sizeInput.trim())) {
      setFormData({ ...formData, sizes: [...currentSizes, sizeInput.trim()] });
      setSizeInput("");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData({ ...formData, image_url: data.url });
      } else {
        const errorData = await res.json();
        alert("Erreur d'upload: " + errorData.error);
      }
    } catch (error) {
      alert("Erreur réseau lors de l'upload");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-background pt-32 text-center text-white">Chargement...</div>;

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center pt-24">
        <h1 className="text-3xl font-bold mb-4">Produit introuvable</h1>
        <Link href="/store" className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Retour à la boutique
        </Link>
      </div>
    );
  }

  const handleBuyNow = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert("Veuillez sélectionner une taille.");
      return;
    }
    addItem(product, selectedSize);
    router.push("/store/cart");
  };

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert("Veuillez sélectionner une taille.");
      return;
    }
    addItem(product, selectedSize);
  };

  return (
    <div className="bg-background min-h-screen pb-20 pt-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <Link href="/store" className="inline-flex items-center gap-2 text-foreground/60 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour à la boutique
          </Link>
          {isAdmin && (
            <button onClick={handleSave} disabled={isSaving} className="bg-primary px-6 py-2 rounded-xl text-white font-bold flex items-center gap-2 hover:bg-primary/80 transition-colors">
              <Save className="w-4 h-4" /> {isSaving ? "Sauvegarde..." : "Enregistrer les modifications"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative aspect-[4/5] rounded-3xl overflow-hidden glass border border-white/10 shadow-2xl flex flex-col"
          >
            {formData.discount_price && formData.discount_price > 0 && (
              <div className="absolute top-6 right-6 z-10 bg-red-500/90 backdrop-blur text-white text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-wider border border-red-400/50">
                Promo
              </div>
            )}
            <div className="relative flex-grow w-full">
              <Image
                src={formData.image_url || "/placeholder.jpg"}
                alt={formData.name || "Product"}
                fill
                className="object-cover"
                priority
              />
            </div>
            {isAdmin && (
              <div className="p-4 bg-black/80 backdrop-blur">
                <label className="text-xs text-white/50 block mb-2">Modifier l'image</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="w-full text-sm text-white file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30" 
                />
                {isUploading && <span className="text-xs text-primary animate-pulse mt-2 block">Upload en cours...</span>}
              </div>
            )}
          </motion.div>

          {/* Details Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col justify-center"
          >
            {isAdmin ? (
              <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="bg-transparent border-b border-primary text-sm font-medium text-primary mb-3 uppercase tracking-[0.2em] focus:outline-none w-1/2" placeholder="Catégorie" />
            ) : (
              <div className="text-sm font-medium text-primary mb-3 uppercase tracking-[0.2em]">
                {product.category}
              </div>
            )}

            {isAdmin ? (
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-transparent border-b border-white/30 text-4xl md:text-5xl font-serif text-foreground leading-tight mb-6 focus:outline-none w-full" placeholder="Nom du produit" />
            ) : (
              <h1 className="text-4xl md:text-5xl font-serif text-foreground leading-tight mb-6">
                {product.name}
              </h1>
            )}
            
            <div className="flex items-end gap-4 mb-8 pb-8 border-b border-white/10">
              {isAdmin ? (
                <div className="flex gap-4 items-end w-full">
                  <div className="flex flex-col">
                    <label className="text-xs text-white/50">Prix Normal (TND)</label>
                    <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} className="bg-transparent border-b border-white/30 text-3xl font-bold text-white focus:outline-none w-32" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs text-red-400/50">Prix Promo (TND)</label>
                    <input type="number" step="0.01" value={formData.discount_price || ''} onChange={e => setFormData({...formData, discount_price: parseFloat(e.target.value) || 0})} className="bg-transparent border-b border-red-500/30 text-3xl font-bold text-[#d4af37] focus:outline-none w-32" placeholder="0 = non" />
                  </div>
                </div>
              ) : (
                <>
                  {product.discount_price ? (
                    <>
                      <span className="text-4xl font-bold text-[#d4af37]">{product.discount_price.toFixed(2)} TND</span>
                      <span className="text-xl text-white/30 line-through mb-1">{product.price.toFixed(2)} TND</span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-[#d4af37]">{product.price.toFixed(2)} TND</span>
                  )}
                </>
              )}
            </div>

            {isAdmin ? (
              <textarea rows={5} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl p-4 text-lg text-foreground/70 font-light leading-relaxed mb-10 focus:outline-none w-full" placeholder="Description détaillée..." />
            ) : (
              <p className="text-lg text-foreground/70 font-light leading-relaxed mb-10">
                {product.description}
              </p>
            )}

            {/* Sizes Selection */}
            {isAdmin ? (
              <div className="mb-10">
                <label className="text-xs text-white/50 mb-1 block">Tailles disponibles</label>
                <div className="flex gap-2 mb-3">
                  <input 
                    type="text" 
                    value={sizeInput} 
                    onChange={e => setSizeInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' ? handleAddSize(e) : null}
                    className="flex-1 bg-black/50 border border-white/20 rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary" 
                    placeholder="Ex: S, M, L..."
                  />
                  <button 
                    type="button" 
                    onClick={handleAddSize}
                    className="bg-primary/20 hover:bg-primary/40 text-primary border border-primary/50 px-4 py-2 rounded-md transition-colors font-medium whitespace-nowrap"
                  >
                    Ajouter
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.sizes || []).map(size => (
                    <div key={size} className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                      <span className="text-sm font-medium">{size}</span>
                      <button type="button" onClick={() => handleRemoveSize(size)} className="text-white/50 hover:text-red-400 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {(!formData.sizes || formData.sizes.length === 0) && <span className="text-sm text-foreground/40 italic">Aucune taille</span>}
                </div>
              </div>
            ) : (
              product.sizes && product.sizes.length > 0 && (
                <div className="mb-10">
                  <span className="text-sm font-medium text-foreground/80 mb-3 block">Sélectionnez une taille :</span>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 rounded-xl border flex items-center justify-center text-sm font-bold transition-all ${selectedSize === size ? "bg-primary text-white border-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" : "bg-transparent text-foreground/60 border-white/20 hover:border-white/50"}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}

            {/* Admin Stock Controls */}
            {isAdmin && (
              <div className="mb-10 p-4 border border-primary/30 rounded-xl bg-primary/5 flex flex-wrap gap-4 items-center">
                <div className="flex flex-col mr-4">
                  <label className="text-xs text-white/50 mb-1">Stock</label>
                  <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} className="bg-black/50 border border-white/20 rounded-md px-3 py-1 w-24 text-white" />
                </div>
                <button onClick={() => setFormData({...formData, status: "out_of_stock"})} className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${formData.status === "out_of_stock" ? "bg-red-500 text-white border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-transparent text-red-400 border-red-500/50 hover:bg-red-500/20"}`}>
                  🔴 En Rupture
                </button>
                <button onClick={() => setFormData({...formData, status: "on_order"})} className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${formData.status === "on_order" ? "bg-yellow-500 text-black border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]" : "bg-transparent text-yellow-400 border-yellow-500/50 hover:bg-yellow-500/20"}`}>
                  🟡 Sur Commande
                </button>
                <button onClick={() => setFormData({...formData, status: "available"})} className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${formData.status === "available" ? "bg-green-500 text-white border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]" : "bg-transparent text-green-400 border-green-500/50 hover:bg-green-500/20"}`}>
                  🟢 Disponible
                </button>
              </div>
            )}

            {!isAdmin && (
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <button 
                  onClick={handleBuyNow}
                  disabled={product.status === "out_of_stock" || (product.sizes?.length ? !selectedSize : false)}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-4 rounded-2xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 text-lg border border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CreditCard className="w-5 h-5" /> {product.status === "on_order" ? "Pré-commander" : "Commander"}
                </button>
                <button 
                  onClick={handleAddToCart}
                  disabled={product.status === "out_of_stock" || (product.sizes?.length ? !selectedSize : false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-foreground font-medium py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" /> Ajouter
                </button>
              </div>
            )}

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-white/10">
              <div className="flex items-center gap-3 text-foreground/60">
                <div className="p-2 glass rounded-full text-primary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-sm font-light">Paiement Sécurisé</span>
              </div>
              <div className="flex items-center gap-3 text-foreground/60">
                <div className="p-2 glass rounded-full text-primary">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-sm font-light">Livraison sur Campus</span>
              </div>
            </div>
            
            <div className="mt-8 text-sm flex items-center gap-2 font-medium">
              {formData.status === "out_of_stock" && <><span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" /><span className="text-red-400">Rupture de stock</span></>}
              {formData.status === "on_order" && <><span className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" /><span className="text-yellow-400">Sur commande (Délai plus long)</span></>}
              {formData.status === "available" && <><span className="w-3 h-3 rounded-full bg-green-500" /><span className="text-green-400">En stock ({formData.stock} restants)</span></>}
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}

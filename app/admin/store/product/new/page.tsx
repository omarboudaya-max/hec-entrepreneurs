"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, X } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [sizeInput, setSizeInput] = useState("");
  const [sizesList, setSizesList] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    discount_price: 0,
    stock: 0,
    category: "",
    image_url: "",
    status: "available",
    sizes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        discount_price: formData.discount_price > 0 ? formData.discount_price : null,
        sizes: sizesList
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSubmit),
      });

      if (res.ok) {
        router.push("/store");
      } else {
        const errorData = await res.json();
        alert("Erreur: " + errorData.error);
      }
    } catch (error) {
      alert("Erreur réseau");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSize = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (sizeInput.trim() && !sizesList.includes(sizeInput.trim())) {
      setSizesList([...sizesList, sizeInput.trim()]);
      setSizeInput("");
    }
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    setSizesList(sizesList.filter(s => s !== sizeToRemove));
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

  return (
    <div className="bg-background min-h-screen pb-20 pt-24 text-foreground">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link href="/store" className="inline-flex items-center gap-2 text-foreground/60 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Retour à la boutique
        </Link>
        <h1 className="text-3xl font-serif mb-8 text-primary">Ajouter un produit</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 glass p-8 rounded-3xl border border-white/10">
          <div>
            <label className="block text-sm text-foreground/70 mb-2">Nom du produit</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="block text-sm text-foreground/70 mb-2">Catégorie</label>
            <input type="text" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="block text-sm text-foreground/70 mb-2">Description</label>
            <textarea rows={4} required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-foreground/70 mb-2">Prix (TND)</label>
              <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="block text-sm text-foreground/70 mb-2">Prix Promo (TND) (0 si aucun)</label>
              <input type="number" step="0.01" value={formData.discount_price} onChange={e => setFormData({...formData, discount_price: parseFloat(e.target.value) || 0})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-foreground/70 mb-2">Stock</label>
              <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="block text-sm text-foreground/70 mb-2">Statut</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50">
                <option value="available">Disponible</option>
                <option value="on_order">Sur commande</option>
                <option value="out_of_stock">Rupture de stock</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-foreground/70 mb-2">Tailles disponibles</label>
            <div className="flex gap-2 mb-3">
              <input 
                type="text" 
                value={sizeInput} 
                onChange={e => setSizeInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' ? handleAddSize(e) : null}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50" 
                placeholder="Ex: S, M, L..." 
              />
              <button 
                type="button" 
                onClick={handleAddSize}
                className="bg-primary/20 hover:bg-primary/40 text-primary border border-primary/50 px-4 py-2 rounded-xl transition-colors font-medium whitespace-nowrap"
              >
                Ajouter
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizesList.map(size => (
                <div key={size} className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                  <span className="text-sm font-medium">{size}</span>
                  <button type="button" onClick={() => handleRemoveSize(size)} className="text-white/50 hover:text-red-400 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {sizesList.length === 0 && <span className="text-sm text-foreground/40 italic">Aucune taille (Laisser vide si pas de taille)</span>}
            </div>
          </div>
          <div>
            <label className="block text-sm text-foreground/70 mb-2">Image du produit</label>
            <div className="flex flex-col gap-4">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30" 
              />
              {isUploading && <span className="text-sm text-primary animate-pulse">Upload en cours...</span>}
              {formData.image_url && (
                <div className="relative w-32 h-40 rounded-xl overflow-hidden border border-white/20">
                  <img src={formData.image_url} alt="Aperçu" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
          <button type="submit" disabled={isSubmitting || isUploading || !formData.image_url} className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
            {isSubmitting ? "Enregistrement..." : <><Save className="w-5 h-5" /> Ajouter à la boutique</>}
          </button>
        </form>
      </div>
    </div>
  );
}

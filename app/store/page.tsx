"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag, Search, Filter, ShoppingCart, Plus, Pencil, Trash2, LogOut } from "lucide-react";
import { useCartStore, Product } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StorePage() {
  const { addItem, items, searchQuery } = useCartStore();
  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/auth/session")
      .then(res => res.json())
      .then(data => setIsAdmin(data.isAdmin))
      .catch(() => setIsAdmin(false));
      
    fetchProducts();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setIsAdmin(false);
    router.refresh();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.")) {
      try {
        const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
        if (res.ok) {
          fetchProducts();
        } else {
          alert("Erreur lors de la suppression du produit.");
        }
      } catch (error) {
        alert("Erreur réseau lors de la suppression.");
      }
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-transparent min-h-screen pb-20">
      {/* Store Header & Hero */}
      <section className="border-b border-white/10 relative overflow-hidden pt-12">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 py-16 md:py-24 text-center relative z-10">
          
          {isAdmin && (
            <div className="absolute top-4 right-4 flex gap-4">
              <Link href="/admin/store/product/new" className="glass px-4 py-2 bg-primary/20 text-primary border border-primary/50 rounded-full flex items-center gap-2 hover:bg-primary/40 transition-colors text-sm">
                <Plus className="w-4 h-4" /> Ajouter un Produit
              </Link>
              <button onClick={handleLogout} className="glass px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-full flex items-center gap-2 hover:bg-red-500/40 transition-colors text-sm">
                <LogOut className="w-4 h-4" /> Se déconnecter
              </button>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center p-3 bg-primary/20 border border-primary/30 rounded-full mb-6">
              <ShoppingBag className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight mb-4">
              IHEC <span className="text-primary">Store</span>
            </h1>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto font-light">
              La boutique officielle de HEC Entrepreneurs. Portez vos valeurs et soutenez nos projets.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product, idx) => (
            <Link href={`/store/product/${product.id}`} key={product.id}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="glass rounded-3xl overflow-hidden border border-white/10 hover:border-primary/50 transition-colors group flex flex-col h-full bg-black/20"
              >
                {/* Product Image */}
                <div className="relative aspect-[4/5] bg-black/50 overflow-hidden border-b border-white/5">
                  {product.discount_price && (
                    <div className="absolute top-4 right-4 z-10 bg-red-500/90 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-red-400/50">
                      Promo
                    </div>
                  )}
                  
                  {isAdmin && (
                    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        router.push(`/admin/store/product/edit/${product.id}`);
                      }}
                      className="p-2 bg-black/60 backdrop-blur border border-white/20 text-white rounded-full hover:bg-primary hover:border-primary transition-colors" title="Modifier">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, product.id)}
                      className="p-2 bg-black/60 backdrop-blur border border-white/20 text-white rounded-full hover:bg-red-500 hover:border-red-500 transition-colors" title="Supprimer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  )}

                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  />
                </div>

                {/* Product Info */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-xs font-medium text-primary mb-2 uppercase tracking-widest">
                    {product.category}
                  </div>
                  <h3 className="text-lg font-serif text-foreground mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-foreground/60 font-light mb-6 flex-grow line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-end justify-between mt-auto">
                    <div>
                      {product.discount_price ? (
                        <div className="flex flex-col">
                          <span className="text-sm text-white/30 line-through">{product.price.toFixed(2)} TND</span>
                          <span className="text-2xl font-bold text-foreground">{product.discount_price.toFixed(2)} TND</span>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-foreground">{product.price.toFixed(2)} TND</span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addItem(product);
                      }}
                      className="p-3 bg-white/5 border border-white/10 text-foreground rounded-2xl hover:bg-primary hover:border-primary hover:text-white transition-all shadow-md active:scale-95 z-20 relative"
                      title="Ajouter au panier"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-xl text-foreground/50 font-light tracking-widest uppercase">Aucun produit trouvé.</h3>
          </div>
        )}
      </section>
    </div>
  );
}

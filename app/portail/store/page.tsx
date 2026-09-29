"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Clock, CheckCircle2, XCircle, ShoppingBag, Plus, ExternalLink, RefreshCw } from "lucide-react";
import { usePortailAuth } from "@/contexts/PortailAuthContext";

export default function PortailStorePage() {
  const { isBureau } = usePortailAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "served" | "cancelled" | "products">("pending");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/products"),
      ]);

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data);
      }
      if (productsRes.ok) {
        const pData = await productsRes.json();
        setProducts(pData);
      }
    } catch (err) {
      console.error("Error fetching store data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchData();
      } else {
        alert("Erreur lors de la mise à jour");
      }
    } catch {
      alert("Erreur réseau");
    }
  };

  if (!isBureau) {
    return (
      <div className="p-8 text-center text-gray-400">
        Accès réservé au bureau et au développeur.
      </div>
    );
  }

  const filteredOrders = orders.filter((o) => o.status === activeTab);
  const totalRevenue = orders
    .filter((o) => o.status === "served")
    .reduce((acc, o) => acc + (o.total_amount || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ShoppingBag className="text-purple-400" />
            <span>Gestion IHEC Store</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Supervisez les commandes, les stocks et le chiffre d&apos;affaires du club.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-4 rounded-2xl bg-[#121217] border border-white/10 text-right">
            <div className="text-[11px] text-gray-400 uppercase tracking-wider font-mono">Chiffre d&apos;Affaires</div>
            <div className="text-xl font-bold text-amber-400">{totalRevenue.toFixed(2)} TND</div>
          </div>
          <Link
            href="/admin/store/product/new"
            target="_blank"
            className="px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/20"
          >
            <Plus size={16} />
            <span>Nouveau Produit</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 ${
            activeTab === "pending"
              ? "bg-purple-600 text-white"
              : "bg-white/[0.04] text-gray-400 hover:text-white"
          }`}
        >
          <Clock size={14} />
          <span>En attente ({orders.filter((o) => o.status === "pending").length})</span>
        </button>

        <button
          onClick={() => setActiveTab("served")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 ${
            activeTab === "served"
              ? "bg-emerald-600 text-white"
              : "bg-white/[0.04] text-gray-400 hover:text-white"
          }`}
        >
          <CheckCircle2 size={14} />
          <span>Servies ({orders.filter((o) => o.status === "served").length})</span>
        </button>

        <button
          onClick={() => setActiveTab("cancelled")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 ${
            activeTab === "cancelled"
              ? "bg-red-600 text-white"
              : "bg-white/[0.04] text-gray-400 hover:text-white"
          }`}
        >
          <XCircle size={14} />
          <span>Annulées ({orders.filter((o) => o.status === "cancelled").length})</span>
        </button>

        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 ${
            activeTab === "products"
              ? "bg-indigo-600 text-white"
              : "bg-white/[0.04] text-gray-400 hover:text-white"
          }`}
        >
          <Package size={14} />
          <span>Catalogue Produits ({products.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <div className="p-12 text-center text-gray-400">Chargement des données...</div>
      ) : activeTab === "products" ? (
        /* Products List */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="p-5 rounded-3xl bg-[#121217] border border-white/10 space-y-3">
              <div className="aspect-video relative rounded-2xl overflow-hidden bg-black/40">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <Package size={28} />
                  </div>
                )}
              </div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-sm text-white">{p.name}</h3>
                <span className="text-sm font-bold text-amber-400">{p.price} TND</span>
              </div>
              <p className="text-xs text-gray-400 line-clamp-2">{p.description}</p>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <span className={`px-2 py-0.5 rounded-md font-mono ${p.stock > 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
                  Stock: {p.stock}
                </span>
                <Link
                  href={`/store/product/${p.id}`}
                  target="_blank"
                  className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <span>Voir en boutique</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#121217] border border-white/5 text-center text-gray-400">
          Aucune commande dans cette section.
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const customer = typeof order.customer_info === "string" ? JSON.parse(order.customer_info) : order.customer_info;

            return (
              <div
                key={order.id}
                className="p-5 rounded-3xl bg-[#121217] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-base">
                      {customer?.fullName || "Client Invité"}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 font-mono text-gray-300">
                      #{order.id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {customer?.phone} • {customer?.email} • {new Date(order.created_at).toLocaleString("fr-FR")}
                  </div>
                </div>

                <div className="flex items-center gap-4 justify-between md:justify-end">
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Total</div>
                    <div className="text-base font-bold text-amber-400">{order.total_amount?.toFixed(2)} TND</div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {order.status !== "served" && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "served")}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                      >
                        Servir
                      </button>
                    )}
                    {order.status !== "cancelled" && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "cancelled")}
                        className="px-3 py-1.5 rounded-xl bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-bold transition-colors"
                      >
                        Annuler
                      </button>
                    )}
                    {order.status !== "pending" && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "pending")}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
                      >
                        En attente
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

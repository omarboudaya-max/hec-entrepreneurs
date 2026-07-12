"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, CheckCircle, XCircle, Clock } from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'served' | 'cancelled'>('pending');

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else if (res.status === 401) {
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchOrders();
      } else {
        alert("Erreur lors de la mise à jour");
      }
    } catch (e) {
      alert("Erreur réseau");
    }
  };

  if (isLoading) return <div className="min-h-screen bg-background pt-32 text-center text-white">Chargement du dashboard...</div>;

  const filteredOrders = orders.filter(o => o.status === activeTab);
  const totalRevenue = orders.filter(o => o.status === 'served').reduce((acc, o) => acc + o.total_amount, 0);

  return (
    <div className="bg-background min-h-screen pb-20 pt-24 text-foreground">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link href="/store" className="inline-flex items-center gap-2 text-foreground/60 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Retour à la boutique
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 text-primary rounded-xl">
              <Package className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif">Tableau de bord</h1>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 flex flex-col items-end">
            <span className="text-sm text-foreground/60 font-light mb-1">Chiffre d'Affaires</span>
            <span className="text-3xl font-bold text-[#d4af37]">{totalRevenue.toFixed(2)} TND</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/10 pb-4 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'pending' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-foreground/60 hover:bg-white/10'}`}
          >
            ⏳ En attente
          </button>
          <button 
            onClick={() => setActiveTab('served')}
            className={`px-6 py-3 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'served' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-white/5 text-foreground/60 hover:bg-white/10'}`}
          >
            ✅ Servies
          </button>
          <button 
            onClick={() => setActiveTab('cancelled')}
            className={`px-6 py-3 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'cancelled' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 text-foreground/60 hover:bg-white/10'}`}
          >
            ❌ Annulées
          </button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 glass rounded-3xl border border-white/10">
            <p className="text-xl text-foreground/50 font-light">Aucune commande dans cette catégorie.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="glass rounded-2xl p-6 border border-white/10 flex flex-col md:flex-row gap-6 items-start md:items-center">
                {/* Client Info */}
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-medium">{order.customer_info.name}</h3>
                    <span className="text-xs text-foreground/40">{new Date(order.created_at).toLocaleString("fr-FR")}</span>
                  </div>
                  <p className="text-sm text-foreground/60 mb-1">{order.customer_info.email} | {order.customer_info.phone}</p>
                  <p className="text-sm text-foreground/60 mb-3">{order.customer_info.address}</p>
                  
                  <div className="bg-black/40 rounded-lg p-3 inline-block">
                    <p className="text-xs font-medium mb-1">Articles:</p>
                    <ul className="text-sm text-foreground/80 space-y-1">
                      {order.order_items?.map((item: any) => (
                        <li key={item.id}>
                          • {item.quantity}x {item.products?.name} 
                          {item.size && <span className="text-xs ml-1 bg-white/10 px-1.5 py-0.5 rounded">Taille: {item.size}</span>}
                          <span className="text-primary/60 ml-2">({item.price_at_time} TND)</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="shrink-0 flex flex-col gap-4 min-w-[200px] items-end">
                  <div className="text-2xl font-bold text-[#d4af37]">{order.total_amount.toFixed(2)} TND</div>
                  
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <>
                        <button onClick={() => updateOrderStatus(order.id, 'served')} className="flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/50 hover:bg-green-500/40 text-sm">
                          <CheckCircle className="w-4 h-4" /> Servie
                        </button>
                        <button onClick={() => updateOrderStatus(order.id, 'cancelled')} className="flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg border border-red-500/50 hover:bg-red-500/40 text-sm">
                          <XCircle className="w-4 h-4" /> Annuler
                        </button>
                      </>
                    )}
                    
                    {order.status === 'served' && (
                      <span className="flex items-center gap-2 px-3 py-2 bg-green-500/10 text-green-500 rounded-lg text-sm font-medium">
                        <CheckCircle className="w-4 h-4" /> Commande Servie
                      </span>
                    )}
                    
                    {order.status === 'cancelled' && (
                      <span className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-500 rounded-lg text-sm font-medium">
                        <XCircle className="w-4 h-4" /> Annulée
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

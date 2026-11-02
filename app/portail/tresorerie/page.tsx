"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePortailAuth } from "@/contexts/PortailAuthContext";
import { supabase } from "@/lib/supabase";
import { MemberTreasuryItem, PaymentStatus } from "@/types/portail";
import {
  Wallet,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Mail,
  Download,
  ShieldAlert,
  Sparkles,
  Send,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";

export default function TresoreriePage() {
  const { isTreasurer, loading: authLoading } = usePortailAuth();
  const [members, setMembers] = useState<MemberTreasuryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [remindingId, setRemindingId] = useState<string | null>(null);
  const [bulkReminding, setBulkReminding] = useState(false);
  const [autoSendEmail, setAutoSendEmail] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PaymentStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "new" | "old">("all");

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchTreasury = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/portail/tresorerie", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors du chargement de la trésorerie");
      }
      setMembers(data.members || []);
    } catch (err: any) {
      showToast("error", err.message || "Impossible de charger les données financières");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isTreasurer) {
      fetchTreasury();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, isTreasurer]);

  const handleUpdateStatus = async (member: MemberTreasuryItem, nextStatus: PaymentStatus) => {
    if (member.payment_status === nextStatus) return;
    try {
      setUpdatingId(member.id);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/portail/tresorerie", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId: member.id,
          paymentStatus: nextStatus,
          sendEmail: autoSendEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Échec de la mise à jour");
      }

      setMembers((prev) =>
        prev.map((m) =>
          m.id === member.id
            ? {
                ...m,
                payment_status: data.treasury.payment_status,
                amount_paid: data.treasury.amount_paid,
                remaining_amount: data.treasury.remaining_amount,
                last_payment_at: data.treasury.last_payment_at,
                updated_by: data.treasury.updated_by,
              }
            : m
        )
      );

      if (nextStatus === "paye") {
        showToast(
          "success",
          `${member.full_name} marqué Payé (${member.total_due} DT)${data.emailSent ? " • E-mail de confirmation envoyé ✉️" : ""}`
        );
      } else if (nextStatus === "partiel") {
        showToast(
          "success",
          `${member.full_name} marqué 1re Tranche (${member.first_tranche_amount} DT / reste ${member.second_tranche_amount} DT)${data.emailSent ? " • E-mail envoyé ✉️" : ""}`
        );
      } else {
        showToast("success", `${member.full_name} remis en Non payé (0 DT)`);
      }
    } catch (err: any) {
      showToast("error", err.message || "Erreur lors de la mise à jour");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSendReminder = async (member?: MemberTreasuryItem) => {
    try {
      if (member) {
        setRemindingId(member.id);
      } else {
        setBulkReminding(true);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/portail/tresorerie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(member ? { userId: member.id } : {}),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi du rappel");
      }

      showToast("success", data.message || "Rappel envoyé avec succès !");
    } catch (err: any) {
      showToast("error", err.message || "Erreur lors de l'envoi du rappel");
    } finally {
      setRemindingId(null);
      setBulkReminding(false);
    }
  };

  const exportCsv = () => {
    const headers = [
      "Nom Complet",
      "Email",
      "Catégorie",
      "Poste",
      "Statut Financier",
      "Montant Payé (DT)",
      "Total Dû (DT)",
      "Reste à Payer (DT)",
      "Dernière Mise à Jour",
    ];

    const rows = members.map((m) => [
      `"${m.full_name.replace(/"/g, '""')}"`,
      `"${m.email}"`,
      m.is_new_member ? '"Nouveau Membre (70 DT)"' : '"Ancien / Responsable / Bureau (50 DT)"',
      `"${(m.poste || "").replace(/"/g, '""')}"`,
      m.payment_status === "paye"
        ? '"Payé intégralement"'
        : m.payment_status === "partiel"
        ? '"Partiellement payé (1re Tranche)"'
        : '"Non payé"',
      m.amount_paid,
      m.total_due,
      m.remaining_amount,
      m.last_payment_at ? `"${new Date(m.last_payment_at).toLocaleDateString("fr-FR")}"` : '""',
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Tresorerie_HEC_Entrepreneurs_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const stats = useMemo(() => {
    const totalExpected = members.reduce((acc, m) => acc + m.total_due, 0);
    const totalCollected = members.reduce((acc, m) => acc + m.amount_paid, 0);
    const totalRemaining = members.reduce((acc, m) => acc + m.remaining_amount, 0);
    const paidCount = members.filter((m) => m.payment_status === "paye").length;
    const partialCount = members.filter((m) => m.payment_status === "partiel").length;
    const unpaidCount = members.filter((m) => m.payment_status === "non_paye").length;
    const partialRemainingAmount = members
      .filter((m) => m.payment_status === "partiel")
      .reduce((acc, m) => acc + m.remaining_amount, 0);

    return {
      totalExpected,
      totalCollected,
      totalRemaining,
      paidCount,
      partialCount,
      unpaidCount,
      partialRemainingAmount,
      progressPct: totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0,
    };
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (statusFilter !== "all" && m.payment_status !== statusFilter) return false;
      if (categoryFilter === "new" && !m.is_new_member) return false;
      if (categoryFilter === "old" && m.is_new_member) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.full_name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          (m.poste || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [members, statusFilter, categoryFilter, searchQuery]);

  if (!authLoading && !isTreasurer) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-8 rounded-3xl bg-white dark:bg-[#12121a] border border-red-500/30 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Accès Strictement Confidentiel
        </h1>
        <p className="text-sm text-slate-500 dark:text-gray-400">
          Le suivi financier des cotisations est réservé exclusivement au{" "}
          <strong>Trésorier</strong> et au <strong>Développeur</strong> du club.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-emerald-950/95 border-emerald-500/50 text-emerald-200"
              : "bg-rose-950/95 border-rose-500/50 text-rose-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#12121a] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
            <Wallet size={13} /> Espace Confidentiel • Trésorerie &amp; Dev
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Suivi Financier des Cotisations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
            Barème officiel : <strong>Anciens / Responsables / Bureau : 50 DT</strong> (1re tranche : 30 DT) •{" "}
            <strong>Nouveaux Membres : 70 DT</strong> (1re tranche : 40 DT).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleSendReminder()}
            disabled={bulkReminding || stats.partialCount === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-600 dark:text-amber-300 font-semibold text-xs sm:text-sm transition-all disabled:opacity-40"
          >
            <Send size={15} />
            <span>
              {bulkReminding
                ? "Envoi des rappels..."
                : `Relancer les 2e tranches (${stats.partialCount})`}
            </span>
          </button>

          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-200 font-semibold text-xs sm:text-sm transition-all"
          >
            <Download size={15} />
            <span>Exporter CSV</span>
          </button>

          <button
            onClick={fetchTreasury}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300 transition-all"
            title="Actualiser"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#12121a] border border-slate-200 dark:border-white/5 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
            <span>Total Encaissé</span>
            <TrendingUp size={16} className="text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats.totalCollected} DT
            </span>
            <span className="text-xs text-slate-500 dark:text-gray-400">
              / {stats.totalExpected} DT ({stats.progressPct}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${Math.min(100, stats.progressPct)}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#12121a] border border-emerald-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-500 uppercase tracking-wider">
            <span>Payé Intégralement</span>
            <CheckCircle2 size={16} />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.paidCount} <span className="text-sm font-normal text-slate-400">membres</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            Cotisation 100% réglée (50 DT / 70 DT)
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#12121a] border border-amber-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-500 uppercase tracking-wider">
            <span>Partiellement Payé (1re Tranche)</span>
            <Clock size={16} />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.partialCount} <span className="text-sm font-normal text-slate-400">membres</span>
          </div>
          <p className="text-xs text-amber-500/90">
            Reste {stats.partialRemainingAmount} DT à collecter en 2e tranche
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#12121a] border border-rose-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-400 uppercase tracking-wider">
            <span>Non Payé</span>
            <Users size={16} />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.unpaidCount} <span className="text-sm font-normal text-slate-400">membres</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            Aucun versement enregistré (0 DT)
          </p>
        </div>
      </div>

      {/* Filters & Email Toggle Bar */}
      <div className="bg-white dark:bg-[#12121a] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un membre par nom, e-mail ou poste..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#181824] border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white outline-none focus:border-purple-500"
            />
          </div>

          {/* Auto Email Toggle */}
          <label className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 cursor-pointer text-xs font-medium text-purple-700 dark:text-purple-300 shrink-0">
            <input
              type="checkbox"
              checked={autoSendEmail}
              onChange={(e) => setAutoSendEmail(e.target.checked)}
              className="rounded text-purple-600 focus:ring-purple-500"
            />
            <Mail size={14} />
            <span>Envoyer automatiquement l&apos;e-mail de confirmation reçu / rappel</span>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-white/5">
          {/* Status filter pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "all", label: `Tous (${members.length})` },
              { id: "paye", label: `Payé (${stats.paidCount})` },
              { id: "partiel", label: `1re Tranche (${stats.partialCount})` },
              { id: "non_paye", label: `Non payé (${stats.unpaidCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === tab.id
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "all", label: "Toutes catégories" },
              { id: "old", label: "Anciens / Resp. / Bureau (50 DT • Tranche 30 DT)" },
              { id: "new", label: "Nouveaux Membres (70 DT • Tranche 40 DT)" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  categoryFilter === cat.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Members Table / List */}
      <div className="bg-white dark:bg-[#12121a] rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
            <p className="text-xs uppercase tracking-widest text-slate-400 font-mono">
              Chargement des états financiers...
            </p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500 dark:text-gray-400">
            Aucun membre ne correspond aux critères sélectionnés.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {filteredMembers.map((member) => {
              const isUpdating = updatingId === member.id;
              const isReminding = remindingId === member.id;

              return (
                <div
                  key={member.id}
                  className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
                >
                  {/* Member Identity & Category */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-300 font-bold text-sm shrink-0">
                      {member.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                          {member.full_name}
                        </span>
                        {member.is_new_member ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 inline-flex items-center gap-1">
                            <Sparkles size={10} /> Nouveau Membre • 70 DT
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/15 text-purple-400 border border-purple-500/30">
                            {member.poste || "Membre"} • 50 DT
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-gray-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>{member.email}</span>
                        <span>•</span>
                        <span>
                          Payé :{" "}
                          <strong className="text-slate-800 dark:text-gray-200">
                            {member.amount_paid} DT / {member.total_due} DT
                          </strong>
                        </span>
                        {member.remaining_amount > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-amber-500 font-semibold">
                              Reste : {member.remaining_amount} DT
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Controls */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Non payé (0 DT) */}
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(member, "non_paye")}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        member.payment_status === "non_paye"
                          ? "bg-rose-500/20 border-rose-500 text-rose-400 ring-1 ring-rose-500/50"
                          : "bg-slate-100 dark:bg-[#181824] border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      Non payé (0 DT)
                    </button>

                    {/* 1re Tranche (30 DT ou 40 DT) */}
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(member, "partiel")}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        member.payment_status === "partiel"
                          ? "bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/50 shadow-sm"
                          : "bg-slate-100 dark:bg-[#181824] border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300 hover:border-amber-500/40"
                      }`}
                    >
                      1re Tranche ({member.first_tranche_amount} DT)
                    </button>

                    {/* Payé Total (50 DT ou 70 DT) */}
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(member, "paye")}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        member.payment_status === "paye"
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/50 shadow-sm"
                          : "bg-slate-100 dark:bg-[#181824] border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300 hover:border-emerald-500/40"
                      }`}
                    >
                      Payé ({member.total_due} DT)
                    </button>

                    {/* Individual Reminder Button when status === 'partiel' */}
                    {member.payment_status === "partiel" && (
                      <button
                        type="button"
                        disabled={isReminding}
                        onClick={() => handleSendReminder(member)}
                        title={`Envoyer un rappel par e-mail pour régler les ${member.remaining_amount} DT restants`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-semibold transition-all"
                      >
                        <Mail size={13} />
                        <span>
                          {isReminding
                            ? "Envoi..."
                            : `Rappel (${member.remaining_amount} DT)`}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

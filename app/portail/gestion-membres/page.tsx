"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck, UserPlus, Trash2, Key, Edit2, CheckCircle2,
  AlertCircle, Lock, RefreshCw, Sparkles, User
} from "lucide-react";
import { usePortailAuth } from "@/contexts/PortailAuthContext";
import { supabase } from "@/lib/supabase";
import { ClubProfile, ClubRole } from "@/types/portail";

export default function GestionMembresPage() {
  const { isDeveloper, isBureau } = usePortailAuth();
  const [members, setMembers] = useState<ClubProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // New Member Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<ClubRole>("membre");
  const [poste, setPoste] = useState("Membre");
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit Member Modal State
  const [editingMember, setEditingMember] = useState<ClubProfile | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editRole, setEditRole] = useState<ClubRole>("membre");
  const [editPoste, setEditPoste] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editCareer, setEditCareer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchMembers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/portail/admin/users", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await res.json();
      if (data.profiles) {
        setMembers(data.profiles);
      }
    } catch (err) {
      console.error("Error loading members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const openEditModal = (member: ClubProfile) => {
    setEditingMember(member);
    setEditFullName(member.full_name || "");
    setEditRole(member.role);
    setEditPoste(member.poste || "");
    setEditBio(member.bio || "");
    setEditCareer(member.career || "");
    setNewPassword("");
  };

  const closeEditModal = () => {
    setEditingMember(null);
    setNewPassword("");
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/portail/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          role,
          poste: poste.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la création.");
      }

      setMessage({ type: "success", text: `Le compte pour ${fullName} a été créé avec succès !` });
      setEmail("");
      setPassword("");
      setFullName("");
      setRole("membre");
      setPoste("Membre");
      await fetchMembers();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erreur lors de la création du compte." });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    setIsUpdating(true);
    setMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const payload: any = {
        userId: editingMember.id,
        full_name: editFullName.trim(),
        role: editRole,
        poste: editPoste.trim(),
        bio: editBio.trim(),
        career: editCareer.trim(),
      };
      if (newPassword.trim()) {
        payload.password = newPassword.trim();
      }

      const res = await fetch("/api/portail/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de la mise à jour");

      setMessage({ type: "success", text: `Le profil de ${editFullName} a été mis à jour et synchronisé avec le site !` });
      closeEditModal();
      await fetchMembers();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteMember = async (userId: string, name: string) => {
    if (!confirm(`Expulser et supprimer définitivement ${name} du club ? Cette action le supprimera également de la page Notre Équipe sur le site public.`)) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/portail/admin/users?userId=${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (res.ok) {
        setMessage({ type: "success", text: `Le membre ${name} a été expulsé et supprimé de l'équipe.` });
        setMembers((prev) => prev.filter((m) => m.id !== userId));
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  };

  if (!isBureau) {
    return (
      <div className="p-8 text-center text-gray-400">
        Accès restreint au Bureau Exécutif / RH et Développeur.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-purple-400" />
            <span>Gestion des Membres & Équipe (RH / Bureau)</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Gestion des adhérents, mise à jour des rôles & postes, et expulsion de membres. Synchronisé automatiquement avec la section &quot;Notre Équipe&quot; du site public.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
              : "bg-red-500/10 border border-red-500/20 text-red-300"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Fast Account Creation Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#121217] border border-white/10 shadow-xl mb-10">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <UserPlus size={20} className="text-purple-400" />
          <span>Formulaire Rapide : Ajouter un Nouveau Membre</span>
        </h2>

        <form onSubmit={handleCreateMember} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Nom Complet</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: Youssef Trabelsi"
              className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Adresse Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="youssef@ihec.tn"
              className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Mot de Passe Provisoire</label>
            <input
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ex: HEC2026!secret"
              className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Rôle d&apos;Accès</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as ClubRole)}
              className="w-full px-3.5 py-2.5 bg-[#1a1a22] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
            >
              <option value="membre">Membre (Lecture + Interactions)</option>
              <option value="responsable">Responsable</option>
              <option value="bureau">Bureau (Publication d&apos;annonces + Store + Membres)</option>
              <option value="developpeur">Développeur (Tous les droits)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Poste / Pôle</label>
            <input
              type="text"
              required
              value={poste}
              onChange={(e) => setPoste(e.target.value)}
              placeholder="Ex: Pôle Marketing, VPA, Trésorier..."
              className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 disabled:opacity-50 h-[38px]"
            >
              {isCreating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Créer le Compte</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Members Table */}
      <div className="p-6 rounded-3xl bg-[#121217] border border-white/10 shadow-xl overflow-hidden">
        <h2 className="text-lg font-bold text-white mb-4">Comptes Existants ({members.length})</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider font-mono">
                <th className="py-3 px-4">Membre</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Rôle</th>
                <th className="py-3 px-4">Poste</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-[10px] font-bold text-purple-300 shrink-0 overflow-hidden">
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          member.full_name?.charAt(0).toUpperCase() || "M"
                        )}
                      </div>
                      <span>{member.full_name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-400">
                    {member.email}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.04] border border-white/10 text-gray-300">
                      {member.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-purple-300 font-medium">
                    {member.poste || "Non assigné"}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(member)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        title="Modifier le membre (poste, bio, roadmap)"
                      >
                        <Edit2 size={14} />
                      </button>

                      {member.email !== "omarboudaya1@gmail.com" && (
                        <button
                          onClick={() => handleDeleteMember(member.id, member.full_name)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Expulser et supprimer de l'équipe"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#121217] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit2 size={18} className="text-purple-400" />
                  <span>Modifier la Fiche Membre</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Les modifications seront immédiatement synchronisées avec la section &quot;Notre Équipe&quot; du site.
                </p>
              </div>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateMember} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Nom Complet</label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Rôle d&apos;Accès</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as ClubRole)}
                    className="w-full px-3.5 py-2.5 bg-[#1a1a22] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="membre">Membre</option>
                    <option value="responsable">Responsable</option>
                    <option value="bureau">Bureau</option>
                    <option value="developpeur">Développeur</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Poste / Pôle Officiel</label>
                <input
                  type="text"
                  required
                  value={editPoste}
                  onChange={(e) => setEditPoste(e.target.value)}
                  placeholder="Ex: Responsable Protocole Interne, VPA, Trésorier..."
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Bio Personnelle (Présentation courte)</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Présentation ou devise qui s'affichera sur la première slide..."
                  className="w-full p-3 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                  Parcours Universitaire & Carrière (Roadmap qui s&apos;affiche sur le site)
                </label>
                <textarea
                  rows={3}
                  value={editCareer}
                  onChange={(e) => setEditCareer(e.target.value)}
                  placeholder="Chaque ligne représentera un point fort de la feuille de route..."
                  className="w-full p-3 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                  Nouveau Mot de Passe Provisoire (optionnel)
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Laisser vide pour ne pas modifier"
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs rounded-xl font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs rounded-xl font-bold shadow-md shadow-purple-600/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {isUpdating ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

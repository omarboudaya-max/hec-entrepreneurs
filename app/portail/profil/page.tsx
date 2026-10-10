"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { User, Mail, Phone, Briefcase, GraduationCap, Camera, Save, Lock, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { usePortailAuth } from "@/contexts/PortailAuthContext";
import { supabase } from "@/lib/supabase";

export default function ProfilPage() {
  const { user, profile, refreshProfile } = usePortailAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [career, setCareer] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password Change State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setBio(profile.bio || "");
      setCareer(profile.career || "");
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    setMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "portail-media");

      const res = await fetch("/api/portail/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        setAvatarUrl(data.url);
        // Direct update in profile
        await supabase
          .from("club_profiles")
          .update({ avatar_url: data.url })
          .eq("id", user?.id);

        await refreshProfile();
        setMessage({ type: "success", text: "Photo de profil mise à jour !" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erreur lors du téléversement." });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("club_profiles")
        .update({
          full_name: fullName.trim(),
          phone: phone.trim(),
          bio: bio.trim(),
          career: career.trim(),
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      await refreshProfile();
      setMessage({ type: "success", text: "Profil enregistré avec succès !" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erreur lors de la sauvegarde." });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Le mot de passe doit comporter au moins 6 caractères." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Les deux mots de passe ne correspondent pas." });
      return;
    }

    setIsChangingPassword(true);
    setPasswordMsg(null);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setPasswordMsg({ type: "success", text: "Votre mot de passe a été mis à jour avec succès !" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMsg({ type: "error", text: err.message || "Erreur lors du changement de mot de passe." });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Mon Profil Membre
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Gérez vos informations personnelles, votre parcours et vos contacts au sein du club.
        </p>
      </div>

      {/* Sync Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs sm:text-sm flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
        <span>
          <strong>Synchronisation en direct :</strong> Votre photo de profil (PDP), votre bio et votre feuille de route (parcours) sont automatiquement synchronisées avec votre fiche dans la section <strong>&quot;Notre Équipe&quot;</strong> du site officiel.
        </span>
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

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile Card Header */}
        <div className="p-6 rounded-3xl bg-[#121217] border border-white/10 shadow-xl flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-purple-600/20 border-2 border-purple-500/30 flex items-center justify-center text-3xl font-black text-purple-300 overflow-hidden relative shadow-lg">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
              ) : (
                fullName.charAt(0).toUpperCase() || "M"
              )}
            </div>
            <label className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity text-xs font-medium">
              <Camera size={20} className="mb-1 text-purple-400" />
              <span>Changer</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={isUploadingAvatar}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <h2 className="text-xl font-bold text-white">{fullName || "Membre HEC"}</h2>
            <div className="text-sm text-purple-400 font-medium">{profile?.poste || "Membre"}</div>
            <div className="text-xs text-gray-400">{profile?.email}</div>
          </div>
        </div>

        {/* Roles & Status (Locked) */}
        <div className="p-6 rounded-3xl bg-[#121217] border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Lock size={16} className="text-amber-400" />
            <span>Statut Officiel au Club (Attribué par l&apos;Administration)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="text-xs text-gray-400 uppercase tracking-wider font-mono">Rôle d&apos;Accès</div>
              <div className="text-sm font-bold text-white uppercase tracking-wider">{profile?.role}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="text-xs text-gray-400 uppercase tracking-wider font-mono">Poste / Pôle</div>
              <div className="text-sm font-bold text-purple-300">{profile?.poste || "Non assigné"}</div>
            </div>
          </div>
          <p className="text-xs text-gray-500 italic">
            Pour modifier votre pôle ou rôle officiel, veuillez vous adresser au développeur ou au bureau.
          </p>
        </div>

        {/* Personal Details */}
        <div className="p-6 rounded-3xl bg-[#121217] border border-white/10 shadow-xl space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
            Informations Personnelles
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Nom & Prénom</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Numéro de Téléphone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+216 ..."
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Bio / Description Personnelle</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Présentez-vous en quelques lignes..."
              className="w-full p-4 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500 placeholder:text-gray-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium flex items-center gap-2">
              <GraduationCap size={16} className="text-purple-400" />
              <span>Parcours Universitaire & Carrière Professionnelle</span>
            </label>
            <textarea
              rows={4}
              value={career}
              onChange={(e) => setCareer(e.target.value)}
              placeholder="Ex: Étudiant en Licence Business Computing @ IHEC Carthage. Expériences en Marketing, Stage chez..."
              className="w-full p-4 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500 placeholder:text-gray-500 resize-none"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={16} />
                <span>Enregistrer mon profil</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Security & Password Section */}
      <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-[#121217] border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 text-base font-bold text-white">
          <Lock size={18} className="text-purple-400" />
          <span>Sécurité & Changement de Mot de Passe</span>
        </div>
        <p className="text-xs text-gray-400">
          Modifiez votre mot de passe de connexion à l&apos;intranet en toute autonomie.
        </p>

        {passwordMsg && (
          <div
            className={`p-3.5 rounded-2xl flex items-center gap-3 text-xs ${
              passwordMsg.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                : "bg-red-500/10 border border-red-500/20 text-red-300"
            }`}
          >
            {passwordMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Nouveau mot de passe</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Au moins 6 caractères"
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Confirmer le mot de passe</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Répétez le mot de passe"
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isChangingPassword ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock size={14} />
                  <span>Mettre à jour mon mot de passe</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

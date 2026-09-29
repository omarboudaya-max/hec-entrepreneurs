"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Search, Mail, Phone, GraduationCap, ShieldCheck, Sparkles, Filter, User } from "lucide-react";
import { usePortailAuth } from "@/contexts/PortailAuthContext";
import { supabase } from "@/lib/supabase";
import { ClubProfile } from "@/types/portail";

function RoleBadge({ role }: { role: string }) {
  switch (role) {
    case "developpeur":
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
          Développeur
        </span>
      );
    case "bureau":
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
          Bureau
        </span>
      );
    case "responsable":
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
          Responsable
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
          Membre
        </span>
      );
  }
}

export default function MembresPage() {
  const { isBureau } = usePortailAuth();
  const [members, setMembers] = useState<ClubProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  useEffect(() => {
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
        console.error("Error fetching members:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.poste?.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "all" || m.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <span>Annuaire des Membres</span>
          <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
            {members.length} inscrit{members.length > 1 ? "s" : ""}
          </span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Coordonnées, rôles et fiches des membres actifs du Club HEC Entrepreneurs.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="p-4 rounded-2xl bg-[#121217] border border-white/10 mb-8 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, pôle..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["all", "developpeur", "bureau", "responsable", "membre"].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                roleFilter === role
                  ? "bg-purple-600 text-white"
                  : "bg-white/[0.04] text-gray-400 hover:text-white"
              }`}
            >
              {role === "all" ? "Tous" : role}
            </button>
          ))}
        </div>
      </div>

      {/* Members Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-6 rounded-3xl bg-[#121217] border border-white/5 animate-pulse h-48" />
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#121217] border border-white/5 text-center text-gray-400">
          Aucun membre ne correspond à votre recherche.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="p-6 rounded-3xl bg-[#121217] border border-white/10 shadow-lg flex flex-col justify-between space-y-4 hover:border-purple-500/30 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-xl font-bold text-purple-300 overflow-hidden relative flex-shrink-0">
                    {member.avatar_url ? (
                      <Image src={member.avatar_url} alt={member.full_name} fill className="object-cover" />
                    ) : (
                      member.full_name?.charAt(0).toUpperCase() || "M"
                    )}
                  </div>
                  <RoleBadge role={member.role} />
                </div>

                <h3 className="text-base font-bold text-white">{member.full_name}</h3>
                <div className="text-xs text-purple-400 font-medium mb-2">{member.poste || "Membre"}</div>

                {member.bio && (
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-3">{member.bio}</p>
                )}

                {member.career && (
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-gray-300 flex items-start gap-2">
                    <GraduationCap size={14} className="text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{member.career}</span>
                  </div>
                )}
              </div>

              {/* Contact footer */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                <a
                  href={`mailto:${member.email}`}
                  className="hover:text-purple-400 flex items-center gap-1.5 truncate max-w-[180px]"
                >
                  <Mail size={13} />
                  <span className="truncate">{member.email}</span>
                </a>
                {member.phone && (
                  <a href={`tel:${member.phone}`} className="hover:text-emerald-400 flex items-center gap-1">
                    <Phone size={13} />
                    <span>{member.phone}</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

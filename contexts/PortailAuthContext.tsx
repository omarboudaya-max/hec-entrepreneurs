"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { ClubProfile, ClubRole } from "@/types/portail";

interface PortailAuthContextType {
  user: User | null;
  profile: ClubProfile | null;
  loading: boolean;
  isDeveloper: boolean;
  isBureau: boolean;
  isResponsable: boolean;
  isMember: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const PortailAuthContext = createContext<PortailAuthContextType | undefined>(undefined);

export function PortailAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ClubProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from("club_profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (error && error.code === "PGRST116") {
        // Profile does not exist yet (e.g. first login of dev or legacy account)
        const isOmar = currentUser.email?.toLowerCase() === "omarboudaya1@gmail.com";
        const newProfile: Partial<ClubProfile> = {
          id: currentUser.id,
          email: currentUser.email || "",
          full_name: currentUser.user_metadata?.full_name || (isOmar ? "Omar Boudaya" : "Membre HEC"),
          role: (isOmar ? "developpeur" : (currentUser.user_metadata?.role || "membre")) as ClubRole,
          poste: isOmar ? "Lead Développeur" : (currentUser.user_metadata?.poste || "Membre"),
        };

        const { data: inserted, error: insertError } = await supabase
          .from("club_profiles")
          .upsert(newProfile)
          .select()
          .single();

        if (!insertError && inserted) {
          setProfile(inserted as ClubProfile);
          return;
        }
      }

      if (data) {
        // Enforce developer role for omarboudaya1@gmail.com
        if (currentUser.email?.toLowerCase() === "omarboudaya1@gmail.com" && data.role !== "developpeur") {
          data.role = "developpeur";
          data.poste = data.poste || "Lead Développeur";
          await supabase.from("club_profiles").update({ role: "developpeur", poste: data.poste }).eq("id", currentUser.id);
        }
        setProfile(data as ClubProfile);
      }
    } catch (err) {
      console.error("Error fetching club profile:", err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const role = profile?.role || (user?.email?.toLowerCase() === "omarboudaya1@gmail.com" ? "developpeur" : null);

  const isDeveloper = role === "developpeur";
  const isBureau = isDeveloper || role === "bureau";
  const isResponsable = isBureau || role === "responsable";
  const isMember = !!role;

  return (
    <PortailAuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isDeveloper,
        isBureau,
        isResponsable,
        isMember,
        refreshProfile,
        signOut,
      }}
    >
      {children}
    </PortailAuthContext.Provider>
  );
}

export function usePortailAuth() {
  const context = useContext(PortailAuthContext);
  if (!context) {
    throw new Error("usePortailAuth must be used within a PortailAuthProvider");
  }
  return context;
}

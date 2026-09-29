"use client";

import React, { useState, useEffect } from "react";
import {
  FileText, Download, Maximize2, UploadCloud, CheckCircle2,
  AlertCircle, ShieldCheck, Sparkles, BookOpen, ScrollText, Award
} from "lucide-react";
import { usePortailAuth } from "@/contexts/PortailAuthContext";
import { supabase } from "@/lib/supabase";
import { ClubDocument } from "@/types/portail";

const DEFAULT_DOCS: ClubDocument[] = [
  {
    id: "1",
    doc_key: "reglement",
    title: "Règlement Intérieur du Club",
    file_url: "",
    description: "Statuts officiels, droits, devoirs et charte d'engagement des membres HEC Entrepreneurs.",
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    doc_key: "protocole",
    title: "Protocole Officiel du Club",
    file_url: "",
    description: "Directives opérationnelles, organisation logistique des événements et relations extérieures.",
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    doc_key: "book",
    title: "Book de Bienvenue",
    file_url: "",
    description: "Guide d'accueil, historique, structure des pôles et carnet de bord pour les nouveaux membres.",
    updated_at: new Date().toISOString(),
  },
];

export default function DocumentsPage() {
  const { isBureau } = usePortailAuth();
  const [documents, setDocuments] = useState<ClubDocument[]>(DEFAULT_DOCS);
  const [selectedKey, setSelectedKey] = useState<"reglement" | "protocole" | "book">("reglement");
  const [loading, setLoading] = useState(true);

  // Upload modal / state
  const [uploadingDocKey, setUploadingDocKey] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchDocuments = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/portail/documents", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await res.json();
      if (data.documents && data.documents.length > 0) {
        // Merge with defaults to guarantee all 3 exist
        const merged = DEFAULT_DOCS.map((def) => {
          const found = data.documents.find((d: ClubDocument) => d.doc_key === def.doc_key);
          return found || def;
        });
        setDocuments(merged);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const currentDoc = documents.find((d) => d.doc_key === selectedKey) || documents[0];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatusMsg(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "portail-documents");

      // 1. Upload PDF
      const uploadRes = await fetch("/api/portail/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadData.url) {
        throw new Error(uploadData.error || "Erreur de téléversement");
      }

      // 2. Save document record
      const docToUpdate = documents.find((d) => d.doc_key === docKey);
      const updateRes = await fetch("/api/portail/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          doc_key: docKey,
          title: docToUpdate?.title || docKey,
          file_url: uploadData.url,
          description: docToUpdate?.description,
        }),
      });

      if (updateRes.ok) {
        setStatusMsg({ type: "success", text: "Fichier PDF mis à jour avec succès !" });
        await fetchDocuments();
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Erreur lors de la mise à jour." });
    } finally {
      setIsUploading(false);
      setUploadingDocKey(null);
    }
  };

  const getDocIcon = (key: string) => {
    switch (key) {
      case "reglement":
        return <ScrollText size={20} className="text-purple-400" />;
      case "protocole":
        return <Award size={20} className="text-indigo-400" />;
      default:
        return <BookOpen size={20} className="text-pink-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Documents Officiels du Club
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Consultez et téléchargez les textes fondamentaux, le règlement et les protocoles officiels de HEC Entrepreneurs.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm ${
            statusMsg.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
              : "bg-red-500/10 border border-red-500/20 text-red-300"
          }`}
        >
          {statusMsg.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {documents.map((doc) => {
          const isSelected = doc.doc_key === selectedKey;
          return (
            <button
              key={doc.doc_key}
              onClick={() => setSelectedKey(doc.doc_key as any)}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? "bg-gradient-to-tr from-purple-900/30 to-indigo-900/20 border-purple-500/50 shadow-lg shadow-purple-500/10"
                  : "bg-[#121217] border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
                  {getDocIcon(doc.doc_key)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-white truncate">{doc.title}</div>
                  <div className="text-[11px] text-gray-400 truncate">
                    {doc.file_url ? "Document disponible" : "En attente"}
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{doc.description}</p>
            </button>
          );
        })}
      </div>

      {/* Main Document Viewer Container */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#121217] border border-white/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {getDocIcon(currentDoc.doc_key)}
              <span>{currentDoc.title}</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">{currentDoc.description}</p>
          </div>

          <div className="flex items-center gap-3">
            {currentDoc.file_url && (
              <>
                <a
                  href={currentDoc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <Maximize2 size={14} />
                  <span>Plein écran</span>
                </a>

                <a
                  href={currentDoc.file_url}
                  download
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-purple-600/20 transition-all"
                >
                  <Download size={14} />
                  <span>Télécharger</span>
                </a>
              </>
            )}

            {/* Bureau / Developer Upload Button */}
            {isBureau && (
              <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2 transition-colors">
                <UploadCloud size={14} />
                <span>{isUploading ? "Envoi..." : "Remplacer le PDF"}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  disabled={isUploading}
                  onChange={(e) => handleFileUpload(e, currentDoc.doc_key)}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Viewer Area */}
        {currentDoc.file_url ? (
          <div className="w-full h-[650px] rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-inner">
            <iframe
              src={`${currentDoc.file_url}#toolbar=0`}
              className="w-full h-full border-none"
              title={currentDoc.title}
            />
          </div>
        ) : (
          <div className="p-16 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto text-purple-400">
              <FileText size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Document en cours de finalisation</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                Le document <span className="text-purple-300 font-semibold">{currentDoc.title}</span> sera bientôt
                téléversé par le bureau. Revenez prochainement pour le consulter !
              </p>
            </div>
            {isBureau && (
              <label className="inline-flex cursor-pointer px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-wider items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-purple-600/20">
                <UploadCloud size={16} />
                <span>Téléverser le PDF ({currentDoc.title})</span>
                <input
                  type="file"
                  accept="application/pdf"
                  disabled={isUploading}
                  onChange={(e) => handleFileUpload(e, currentDoc.doc_key)}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

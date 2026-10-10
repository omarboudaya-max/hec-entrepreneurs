"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Heart, MessageCircle, Send, Image as ImageIcon, Link as LinkIcon,
  Trash2, X, Sparkles, ExternalLink, ShieldCheck, CheckCircle2, AlertCircle
} from "lucide-react";
import { usePortailAuth } from "@/contexts/PortailAuthContext";
import { supabase } from "@/lib/supabase";
import { Announcement, AnnouncementComment } from "@/types/portail";

// Auto-detect and render clickable links in text
function FormattedContent({ text }: { text: string }) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return (
    <p className="text-gray-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
      {parts.map((part, i) => {
        if (part.match(urlRegex)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 underline font-medium inline-flex items-center gap-1"
            >
              {part}
              <ExternalLink size={12} className="inline" />
            </a>
          );
        }
        return part;
      })}
    </p>
  );
}

function RoleBadgeSmall({ role }: { role?: string }) {
  if (role === "developpeur") {
    return (
      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
        Développeur
      </span>
    );
  }
  if (role === "bureau") {
    return (
      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
        Bureau
      </span>
    );
  }
  if (role === "responsable") {
    return (
      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
        Responsable
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
      Membre
    </span>
  );
}

export default function AnnoncesPage() {
  const { user, profile, isBureau, isDeveloper } = usePortailAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Publisher State
  const [content, setContent] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [broadcastEmail, setBroadcastEmail] = useState(false);

  // Lightbox Modal
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // Comments open state for each post
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  const fetchAnnouncements = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/portail/announcements", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await res.json();
      if (data.announcements) {
        setAnnouncements(data.announcements);
      }
    } catch (err) {
      console.error("Error loading announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let uploadedImageUrl = null;

      // Upload image if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("bucket", "portail-media");

        const uploadRes = await fetch("/api/portail/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          uploadedImageUrl = uploadData.url;
        }
      }

      // Create announcement
      const res = await fetch("/api/portail/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          content,
          image_url: uploadedImageUrl,
          link_url: linkUrl.trim() || null,
          link_title: linkTitle.trim() || null,
          broadcastEmail,
        }),
      });

      if (res.ok) {
        setContent("");
        setLinkUrl("");
        setLinkTitle("");
        setShowLinkInput(false);
        setBroadcastEmail(false);
        removeImage();
        await fetchAnnouncements();
      }
    } catch (err) {
      console.error("Error posting announcement:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLike = async (announcementId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Optimistic update
      setAnnouncements((prev) =>
        prev.map((ann) => {
          if (ann.id === announcementId) {
            const newHasLiked = !ann.has_liked;
            return {
              ...ann,
              has_liked: newHasLiked,
              likes_count: newHasLiked ? ann.likes_count + 1 : Math.max(0, ann.likes_count - 1),
            };
          }
          return ann;
        })
      );

      await fetch(`/api/portail/announcements/${announcementId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
    } catch (err) {
      console.error("Error toggling like:", err);
      fetchAnnouncements();
    }
  };

  const handleAddComment = async (announcementId: string) => {
    const text = commentInputs[announcementId]?.trim();
    if (!text) return;

    setSubmittingComment((prev) => ({ ...prev, [announcementId]: true }));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/portail/announcements/${announcementId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ content: text }),
      });

      const data = await res.json();
      if (data.comment) {
        setAnnouncements((prev) =>
          prev.map((ann) => {
            if (ann.id === announcementId) {
              return {
                ...ann,
                comments: [...ann.comments, data.comment],
              };
            }
            return ann;
          })
        );
        setCommentInputs((prev) => ({ ...prev, [announcementId]: "" }));
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [announcementId]: false }));
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette annonce ?")) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/portail/announcements?id=${announcementId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (res.ok) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== announcementId));
      }
    } catch (err) {
      console.error("Error deleting announcement:", err);
    }
  };

  const handleDeleteComment = async (announcementId: string, commentId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/portail/announcements/${announcementId}/comments?commentId=${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (res.ok) {
        setAnnouncements((prev) =>
          prev.map((ann) => {
            if (ann.id === announcementId) {
              return {
                ...ann,
                comments: ann.comments.filter((c) => c.id !== commentId),
              };
            }
            return ann;
          })
        );
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <span>Fil d&apos;Actualités & Annonces</span>
          <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
            {announcements.length} annonce{announcements.length > 1 ? "s" : ""}
          </span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Restez informés des décisions, événements et actualités officielles du club HEC Entrepreneurs.
        </p>
      </div>

      {/* Publisher Box - Bureau & Développeur Only */}
      {isBureau && (
        <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-[#121217] border border-white/10 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold overflow-hidden relative">
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt="Me" fill className="object-cover" />
              ) : (
                profile?.full_name?.charAt(0).toUpperCase() || "B"
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Publier une annonce officielle</div>
              <div className="text-xs text-purple-400 flex items-center gap-1">
                <Sparkles size={12} /> Visible par tous les membres du club
              </div>
            </div>
          </div>

          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Écrivez votre annonce ici... (les liens URL seront automatiquement cliquables)"
              rows={3}
              className="w-full p-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors placeholder:text-gray-500 resize-none"
            />

            {/* Link inputs */}
            {showLinkInput && (
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="URL du lien (ex: https://...)"
                  className="w-full px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
                <input
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="Titre facultatif du lien (ex: Formulaire d'inscription)"
                  className="w-full px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative rounded-2xl overflow-hidden border border-white/10 max-h-72">
                <img src={imagePreview} alt="Aperçu" className="w-full h-auto object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 hover:bg-black text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="flex items-center gap-2">
                <label className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 hover:text-white text-xs font-medium transition-colors">
                  <ImageIcon size={16} className="text-purple-400" />
                  <span>Ajouter une photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setShowLinkInput(!showLinkInput)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    showLinkInput
                      ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                      : "bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 hover:text-white"
                  }`}
                >
                  <LinkIcon size={16} className="text-indigo-400" />
                  <span>Joindre un lien</span>
                </button>

                <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium cursor-pointer select-none hover:bg-purple-500/15 transition-colors">
                  <input
                    type="checkbox"
                    checked={broadcastEmail}
                    onChange={(e) => setBroadcastEmail(e.target.checked)}
                    className="w-3.5 h-3.5 accent-purple-600 rounded cursor-pointer"
                  />
                  <span>Notifier par email</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-purple-600/20 flex items-center gap-2 disabled:opacity-40"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Publier</span>
                    <Send size={14} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feed List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-3xl bg-[#121217] border border-white/5 animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-white/10 rounded w-1/4" />
                  <div className="h-3 bg-white/10 rounded w-1/6" />
                </div>
              </div>
              <div className="h-16 bg-white/5 rounded-xl" />
            </div>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#121217] border border-white/5 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto text-purple-400">
            <Sparkles size={28} />
          </div>
          <h3 className="text-lg font-bold text-white">Aucune annonce pour le moment</h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            Les annonces officielles publiées par le bureau apparaîtront directement ici.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {announcements.map((post) => {
            const isCommentsOpen = openComments[post.id];
            const canDelete = isDeveloper || post.author_id === user?.id;

            return (
              <article
                key={post.id}
                className="p-5 sm:p-6 rounded-3xl bg-[#121217] border border-white/10 shadow-lg relative transition-all"
              >
                {/* Post Author Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold overflow-hidden relative">
                      {post.author?.avatar_url ? (
                        <Image src={post.author.avatar_url} alt={post.author.full_name} fill className="object-cover" />
                      ) : (
                        post.author?.full_name?.charAt(0).toUpperCase() || "M"
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{post.author?.full_name || "Membre HEC"}</span>
                        <RoleBadgeSmall role={post.author?.role} />
                      </div>
                      <div className="text-xs text-gray-400">
                        {post.author?.poste || "Bureau"} • {new Date(post.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>

                  {canDelete && (
                    <button
                      onClick={() => handleDeleteAnnouncement(post.id)}
                      className="p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Supprimer l'annonce"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <FormattedContent text={post.content} />

                  {/* Attached Link Card */}
                  {post.link_url && (
                    <a
                      href={post.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-colors group"
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 mb-1">
                        <ExternalLink size={14} />
                        <span>{post.link_title || "Lien externe joint"}</span>
                      </div>
                      <div className="text-xs text-gray-400 truncate font-mono">{post.link_url}</div>
                    </a>
                  )}

                  {/* Attached Image (Clickable Lightbox) */}
                  {post.image_url && (
                    <div
                      onClick={() => setActiveImage(post.image_url || null)}
                      className="relative rounded-2xl overflow-hidden border border-white/10 cursor-pointer group max-h-[480px] bg-black/40"
                    >
                      <img
                        src={post.image_url}
                        alt="Photo de l'annonce"
                        className="w-full h-auto object-cover max-h-[480px] group-hover:scale-[1.01] transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-4 py-2 rounded-full bg-black/70 text-white text-xs font-medium backdrop-blur-sm">
                          Cliquer pour plein écran
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Post Footer Actions */}
                <div className="flex items-center gap-6 pt-4 mt-4 border-t border-white/5 text-xs text-gray-400">
                  <button
                    onClick={() => handleToggleLike(post.id)}
                    className={`flex items-center gap-2 font-medium transition-colors ${
                      post.has_liked ? "text-pink-500 font-bold" : "hover:text-pink-400"
                    }`}
                  >
                    <Heart
                      size={18}
                      className={post.has_liked ? "fill-pink-500 text-pink-500 scale-110" : ""}
                    />
                    <span>{post.likes_count} J&apos;aime</span>
                  </button>

                  <button
                    onClick={() =>
                      setOpenComments((prev) => ({
                        ...prev,
                        [post.id]: !prev[post.id],
                      }))
                    }
                    className="flex items-center gap-2 hover:text-purple-400 transition-colors font-medium"
                  >
                    <MessageCircle size={18} />
                    <span>{post.comments.length} Commentaire{post.comments.length > 1 ? "s" : ""}</span>
                  </button>
                </div>

                {/* Collapsible Comments Section */}
                {isCommentsOpen && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                    {/* Comments List */}
                    {post.comments.length > 0 && (
                      <div className="space-y-3">
                        {post.comments.map((comment) => {
                          const canDeleteComment = isDeveloper || comment.user_id === user?.id;

                          return (
                            <div key={comment.id} className="flex items-start gap-3 group">
                              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-gray-300 overflow-hidden relative flex-shrink-0">
                                {comment.author?.avatar_url ? (
                                  <Image src={comment.author.avatar_url} alt="Author" fill className="object-cover" />
                                ) : (
                                  comment.author?.full_name?.charAt(0).toUpperCase() || "M"
                                )}
                              </div>
                              <div className="flex-1 bg-white/[0.03] rounded-2xl p-3 border border-white/5">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-white">
                                      {comment.author?.full_name || "Membre"}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                      {comment.author?.poste || ""}
                                    </span>
                                  </div>
                                  {canDeleteComment && (
                                    <button
                                      onClick={() => handleDeleteComment(post.id, comment.id)}
                                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity"
                                      title="Supprimer"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  )}
                                </div>
                                <p className="text-xs text-gray-200 whitespace-pre-wrap">{comment.content}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add Comment Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentInputs[post.id] || ""}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddComment(post.id);
                        }}
                        placeholder="Écrivez un commentaire..."
                        className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={submittingComment[post.id] || !commentInputs[post.id]?.trim()}
                        className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 transition-colors"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal (Full-Screen Photo Preview) */}
      {activeImage && (
        <div
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
        >
          <button
            onClick={() => setActiveImage(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={24} />
          </button>
          <img
            src={activeImage}
            alt="Plein écran"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}

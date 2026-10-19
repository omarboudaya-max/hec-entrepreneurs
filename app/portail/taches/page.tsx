"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  CheckSquare, Plus, Filter, User, Calendar, Clock,
  ArrowRight, ArrowLeft, Trash2, CheckCircle2, AlertCircle,
  Flag, Sparkles
} from "lucide-react";
import { usePortailAuth } from "@/contexts/PortailAuthContext";
import { supabase } from "@/lib/supabase";
import { ClubProfile } from "@/types/portail";
import { getAllowedPolesForUser, isTaskVisibleToUser, POLE_OPTIONS } from "@/lib/pole-permissions";

interface TaskItem {
  id: string;
  title: string;
  description?: string | null;
  pole: string;
  status: "a_faire" | "en_cours" | "termine";
  priority: "urgente" | "normale" | "basse";
  due_date?: string | null;
  assigned_to?: string | null;
  assignee?: ClubProfile | null;
  created_at: string;
}

export default function TachesPage() {
  const { user, profile, isResponsable } = usePortailAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [members, setMembers] = useState<ClubProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPole, setSelectedPole] = useState("Tous");
  const [onlyMyTasks, setOnlyMyTasks] = useState(false);
  const [mobileStatusTab, setMobileStatusTab] = useState<"all" | "a_faire" | "en_cours" | "termine">("all");

  // Dynamic poles allowed for the current user (Général is always 2nd after Tous)
  const allowedPoles = useMemo(() => {
    return getAllowedPolesForUser(user?.email, profile?.poste, profile?.role);
  }, [user?.email, profile?.poste, profile?.role]);

  const createPoles = useMemo(() => {
    return allowedPoles.filter((p) => p !== "Tous");
  }, [allowedPoles]);

  // If active selected pole is no longer in allowed list, reset to Tous
  useEffect(() => {
    if (!allowedPoles.includes(selectedPole)) {
      setSelectedPole("Tous");
    }
  }, [allowedPoles, selectedPole]);

  // New Task Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPole, setNewPole] = useState("Général");
  const [newPriority, setNewPriority] = useState<TaskItem["priority"]>("normale");
  const [newAssignedTo, setNewAssignedTo] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchTasksAndMembers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const [tasksRes, membersRes] = await Promise.all([
        fetch("/api/portail/tasks", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch("/api/portail/admin/users", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
      ]);

      const tData = await tasksRes.json();
      if (tData.tasks) setTasks(tData.tasks);

      const mData = await membersRes.json();
      if (mData.profiles) setMembers(mData.profiles);
    } catch (err) {
      console.error("Error loading tasks and members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndMembers();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/portail/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          pole: newPole,
          priority: newPriority,
          assigned_to: newAssignedTo || null,
          due_date: newDueDate || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de création.");

      setMessage({ type: "success", text: "Tâche créée et assignée avec succès !" });
      setIsModalOpen(false);
      setNewTitle("");
      setNewDescription("");
      setNewAssignedTo("");
      setNewDueDate("");
      await fetchTasksAndMembers();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskItem["status"]) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch("/api/portail/tasks", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
    } catch (err) {
      console.error("Error updating status:", err);
      fetchTasksAndMembers();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Supprimer cette tâche ?")) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/portail/tasks?id=${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      }
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  // Filter tasks with strict role and department permissions
  const filteredTasks = tasks.filter((t) => {
    // Check permission: super-viewers, assignees, general tasks, or department members
    if (!isTaskVisibleToUser(t, user?.id, user?.email, profile?.poste, profile?.role)) {
      return false;
    }
    const matchesPole = selectedPole === "Tous" || t.pole === selectedPole;
    const matchesMy = !onlyMyTasks || t.assigned_to === user?.id;
    return matchesPole && matchesMy;
  });

  const todoTasks = filteredTasks.filter((t) => t.status === "a_faire");
  const inProgressTasks = filteredTasks.filter((t) => t.status === "en_cours");
  const doneTasks = filteredTasks.filter((t) => t.status === "termine");

  const getPriorityBadge = (p: TaskItem["priority"]) => {
    switch (p) {
      case "urgente":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">Urgente</span>;
      case "normale":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">Normale</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">Basse</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <CheckSquare className="text-purple-400" />
            <span>Gestion des Tâches & Pôles</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Tableau collaboratif pour suivre les missions du mandat par pôle et par membre.
          </p>
        </div>

        {isResponsable && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all shrink-0"
          >
            <Plus size={16} />
            <span>Nouvelle Tâche</span>
          </button>
        )}
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

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#121217] border border-white/10 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Pole Filter Pills without white swinger bar */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto pb-1.5 md:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {allowedPoles.map((pole) => (
            <button
              key={pole}
              onClick={() => setSelectedPole(pole)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                selectedPole === pole
                  ? "bg-purple-600 text-white"
                  : "bg-white/[0.04] text-gray-400 hover:text-white"
              }`}
            >
              {pole}
            </button>
          ))}
        </div>

        {/* Toggle my tasks */}
        <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none shrink-0">
          <input
            type="checkbox"
            checked={onlyMyTasks}
            onChange={(e) => setOnlyMyTasks(e.target.checked)}
            className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
          />
          <span>Mes tâches assignées</span>
        </label>
      </div>

      {/* Mobile Kanban Tab Selector (clean & native feel on smartphones) */}
      <div className="flex md:hidden items-center justify-between p-1 rounded-2xl bg-[#121217] border border-white/10 mb-6 gap-1 overflow-x-auto [scrollbar-width:none]">
        {[
          { key: "all", label: "Toutes", count: filteredTasks.length },
          { key: "a_faire", label: "À Faire", count: todoTasks.length, dot: "bg-amber-400" },
          { key: "en_cours", label: "En Cours", count: inProgressTasks.length, dot: "bg-blue-400" },
          { key: "termine", label: "Terminé", count: doneTasks.length, dot: "bg-emerald-400" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMobileStatusTab(tab.key as any)}
            className={`flex-1 py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 ${
              mobileStatusTab === tab.key
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.dot && <span className={`w-1.5 h-1.5 rounded-full ${tab.dot}`} />}
            <span>{tab.label}</span>
            <span className="text-[10px] opacity-75 font-mono">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* 3-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: A Faire */}
        <div className={`flex flex-col space-y-4 ${mobileStatusTab !== "all" && mobileStatusTab !== "a_faire" ? "hidden md:flex" : "flex"}`}>
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#121217] border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">À Faire</span>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/5 text-gray-400 font-bold">
              {todoTasks.length}
            </span>
          </div>

          <div className="space-y-3 min-h-[150px] sm:min-h-[300px]">
            {todoTasks.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500 bg-white/[0.015] border border-dashed border-white/5 rounded-2xl">
                Aucune tâche à faire
              </div>
            ) : (
              todoTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onMoveForward={() => handleStatusChange(task.id, "en_cours")}
                  onDelete={() => handleDeleteTask(task.id)}
                  isResponsable={isResponsable}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 2: En Cours */}
        <div className={`flex flex-col space-y-4 ${mobileStatusTab !== "all" && mobileStatusTab !== "en_cours" ? "hidden md:flex" : "flex"}`}>
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#121217] border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">En Cours</span>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/5 text-gray-400 font-bold">
              {inProgressTasks.length}
            </span>
          </div>

          <div className="space-y-3 min-h-[150px] sm:min-h-[300px]">
            {inProgressTasks.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500 bg-white/[0.015] border border-dashed border-white/5 rounded-2xl">
                Aucune tâche en cours
              </div>
            ) : (
              inProgressTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onMoveBack={() => handleStatusChange(task.id, "a_faire")}
                  onMoveForward={() => handleStatusChange(task.id, "termine")}
                  onDelete={() => handleDeleteTask(task.id)}
                  isResponsable={isResponsable}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 3: Terminé */}
        <div className={`flex flex-col space-y-4 ${mobileStatusTab !== "all" && mobileStatusTab !== "termine" ? "hidden md:flex" : "flex"}`}>
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#121217] border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Terminé</span>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/5 text-gray-400 font-bold">
              {doneTasks.length}
            </span>
          </div>

          <div className="space-y-3 min-h-[150px] sm:min-h-[300px]">
            {doneTasks.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500 bg-white/[0.015] border border-dashed border-white/5 rounded-2xl">
                Aucune tâche terminée
              </div>
            ) : (
              doneTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onMoveBack={() => handleStatusChange(task.id, "en_cours")}
                  onDelete={() => handleDeleteTask(task.id)}
                  isResponsable={isResponsable}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#121217] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus size={18} className="text-purple-400" />
                  <span>Créer une Tâche de Pôle</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Attribuez une mission à un membre avec priorité et échéance.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Titre de la tâche</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Contacter 5 partenaires potentiels pour sponsoring"
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Pôle</label>
                  <select
                    value={newPole}
                    onChange={(e) => setNewPole(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#1a1a22] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    {createPoles.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Priorité</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#1a1a22] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="normale">Normale</option>
                    <option value="urgente">Urgente</option>
                    <option value="basse">Basse</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Membre Assigné</label>
                  <select
                    value={newAssignedTo}
                    onChange={(e) => setNewAssignedTo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#1a1a22] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Non assigné (Libre)</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name} ({m.poste || m.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Date Limite (Échéance)</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Consignes & Détails</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Objectif à atteindre, ressources à disposition..."
                  className="w-full p-3 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs rounded-xl font-medium transition-colors text-center"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs rounded-xl font-bold shadow-md shadow-purple-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? "Création..." : "Créer la tâche"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({
  task,
  onMoveBack,
  onMoveForward,
  onDelete,
  isResponsable,
}: {
  task: TaskItem;
  onMoveBack?: () => void;
  onMoveForward?: () => void;
  onDelete: () => void;
  isResponsable: boolean;
}) {
  const isDone = task.status === "termine";

  return (
    <div className={`p-4 rounded-2xl bg-[#121217] border transition-all space-y-3 shadow-md hover:border-purple-500/30 ${isDone ? "border-emerald-500/20 opacity-80" : "border-white/10"}`}>
      {/* Top row: Pole & Priority */}
      <div className="flex items-center justify-between gap-2">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
          {task.pole}
        </span>
        {task.priority === "urgente" && (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
            Urgente
          </span>
        )}
      </div>

      {/* Title & Description */}
      <div>
        <h3 className={`text-sm font-bold text-white ${isDone ? "line-through text-gray-400" : ""}`}>
          {task.title}
        </h3>
        {task.description && (
          <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Assignee & Due Date */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-gray-400">
        <div className="flex items-center gap-1.5 min-w-0">
          {task.assignee ? (
            <div className="flex items-center gap-1.5 truncate">
              <div className="w-5 h-5 rounded-full bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-[9px] font-bold text-purple-300 shrink-0 overflow-hidden">
                {task.assignee.avatar_url ? (
                  <img src={task.assignee.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  task.assignee.full_name?.charAt(0) || "M"
                )}
              </div>
              <span className="truncate text-gray-300 font-medium">{task.assignee.full_name}</span>
            </div>
          ) : (
            <span className="text-gray-500 italic">Libre</span>
          )}
        </div>

        {task.due_date && (
          <div className="flex items-center gap-1 text-gray-400 shrink-0">
            <Calendar size={12} className="text-purple-400" />
            <span>{new Date(task.due_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
          </div>
        )}
      </div>

      {/* Movement Buttons */}
      <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
        <div>
          {onMoveBack && (
            <button
              onClick={onMoveBack}
              className="px-2.5 py-1.5 rounded-xl text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium flex items-center gap-1 transition-all active:scale-95"
              title="Reculer d'une étape"
            >
              <ArrowLeft size={13} />
              <span className="text-[11px]">Reculer</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isResponsable && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all active:scale-95"
              title="Supprimer la tâche"
            >
              <Trash2 size={14} />
            </button>
          )}

          {onMoveForward && (
            <button
              onClick={onMoveForward}
              className="px-3 py-1.5 rounded-xl bg-purple-600/25 hover:bg-purple-600 border border-purple-500/30 text-purple-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              title="Avancer d'une étape"
            >
              <span>Avancer</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

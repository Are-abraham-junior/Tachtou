import React, { useState, useEffect } from 'react';
import { Task, Project, Priority, SubTask } from '../types';
import {
  X,
  Calendar,
  Clock,
  Bell,
  Folder,
  Tag,
  Plus,
  Trash2,
  Swords,
  Sparkles,
} from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt'> & { id?: string }) => void;
  initialTask?: Task | null;
  projects: Project[];
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  projects,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('09:00');
  const [reminderTime, setReminderTime] = useState('15');
  const [estimatedMinutes, setEstimatedMinutes] = useState('30');
  const [xpReward, setXpReward] = useState<number>(50);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setProjectId(initialTask.projectId || projects[0]?.id || '');
      setPriority(initialTask.priority || 'medium');
      setDueDate(initialTask.dueDate || new Date().toISOString().split('T')[0]);
      setDueTime(initialTask.dueTime || '09:00');
      setReminderTime(initialTask.reminderTime || '15');
      setEstimatedMinutes(initialTask.estimatedMinutes?.toString() || '30');
      setXpReward(initialTask.xpReward || 50);
      setSubtasks(initialTask.subtasks || []);
    } else {
      // Reset defaults
      setTitle('');
      setDescription('');
      setProjectId(projects[0]?.id || '');
      setPriority('medium');
      setDueDate(new Date().toISOString().split('T')[0]);
      setDueTime('09:00');
      setReminderTime('15');
      setEstimatedMinutes('30');
      setXpReward(50);
      setSubtasks([]);
    }
  }, [initialTask, projects, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: newSubtaskTitle.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (subId: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== subId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: initialTask?.id,
      title: title.trim(),
      description: description.trim(),
      projectId,
      priority,
      status: initialTask?.status || 'todo',
      dueDate,
      dueTime,
      reminderTime,
      reminderSent: false,
      estimatedMinutes: parseInt(estimatedMinutes, 10) || 30,
      xpReward,
      subtasks,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-amber-50 dark:bg-slate-900 rounded-3xl border-4 border-slate-900 shadow-[8px_8px_0px_#000] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-amber-400 dark:bg-slate-800 border-b-4 border-slate-900">
          <div className="flex items-center gap-2">
            <Swords className="w-6 h-6 text-slate-950 dark:text-amber-400 stroke-[2.5]" />
            <h2 className="font-pixel text-sm font-bold text-slate-950 dark:text-white">
              {initialTask ? 'MODIFIER LA QUÊTE' : 'CRÉER UNE NOUVELLE QUÊTE'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-900 text-white hover:bg-rose-600 rounded-xl transition-colors border-2 border-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-sm">
          {/* Title */}
          <div>
            <label className="block font-bold text-slate-900 dark:text-slate-100 mb-1">
              Intitulé de la Quête <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="ex: Réparer l'armure, Vaincre le projet X..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-900 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-[3px_3px_0px_#000]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
              Description de la Quête
            </label>
            <textarea
              rows={2}
              placeholder="Consignes secretes, objectifs secondaires..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-900 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none shadow-[3px_3px_0px_#000]"
            />
          </div>

          {/* Project & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200 mb-1">
                <Folder className="w-4 h-4 text-amber-600" />
                <span>Royaume / Projet</span>
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-[3px_3px_0px_#000]"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200 mb-1">
                <Tag className="w-4 h-4 text-amber-600" />
                <span>Danger / Priorité</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-[3px_3px_0px_#000]"
              >
                <option value="low">📜 Quête Normale (+50 XP)</option>
                <option value="medium">🛡️ Quête Moyenne (+75 XP)</option>
                <option value="high">⚔️ Quête Difficile (+100 XP)</option>
                <option value="urgent">🔥 QUÊTE ÉPIQUE (+150 XP)</option>
              </select>
            </div>
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200 mb-1">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>Date d'Échéance</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-[3px_3px_0px_#000]"
              />
            </div>

            <div>
              <label className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200 mb-1">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Heure limite</span>
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-[3px_3px_0px_#000]"
              />
            </div>
          </div>

          {/* Reminder & XP Reward */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200 mb-1">
                <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Rappel Alerte</span>
              </label>
              <select
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-[3px_3px_0px_#000]"
              >
                <option value="none">Aucun rappel</option>
                <option value="0">A l'heure pile</option>
                <option value="15">15 minutes avant</option>
                <option value="30">30 minutes avant</option>
                <option value="60">1 heure avant</option>
                <option value="1440">1 jour avant</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200 mb-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Gain d'XP Bonus</span>
              </label>
              <input
                type="number"
                min="10"
                step="10"
                value={xpReward}
                onChange={(e) => setXpReward(parseInt(e.target.value, 10) || 50)}
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-[3px_3px_0px_#000]"
              />
            </div>
          </div>

          {/* Subtasks / Sub-quests */}
          <div className="pt-2 border-t-2 border-slate-900/10 dark:border-slate-800">
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-2">
              Étapes / Sous-Quêtes ({subtasks.length})
            </label>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Ajouter une sous-étape..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask(e);
                  }
                }}
                className="flex-1 px-3 py-2 rounded-xl border-2 border-slate-900 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-[2px_2px_0px_#000]"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-pixel text-[10px] font-bold rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#000] flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {subtasks.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-900 shadow-[2px_2px_0px_#000] text-xs font-semibold"
                  >
                    <span className="text-slate-900 dark:text-slate-100">{sub.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(sub.id)}
                      className="text-rose-600 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t-2 border-slate-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-pixel text-xs font-bold rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
            >
              {initialTask ? 'MÉMORISER QUÊTE' : 'LANCER LA QUÊTE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


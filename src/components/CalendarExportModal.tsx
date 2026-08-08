import React, { useState } from 'react';
import { Task, Project } from '../types';
import { generateGoogleCalendarUrl, exportTasksToICS } from '../utils/calendarUtils';
import {
  X,
  Calendar,
  Download,
  ExternalLink,
  Check,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface CalendarExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  projects: Project[];
}

export const CalendarExportModal: React.FC<CalendarExportModalProps> = ({
  isOpen,
  onClose,
  tasks,
  projects,
}) => {
  const [selectedScope, setSelectedScope] = useState<'all' | 'today' | 'upcoming'>('upcoming');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const exportableTasks = tasks.filter((t) => {
    if (selectedScope === 'today') return t.dueDate === todayStr;
    if (selectedScope === 'upcoming') return t.dueDate >= todayStr && t.status !== 'completed';
    return true; // all
  });

  const handleDownloadICS = () => {
    exportTasksToICS(exportableTasks, projects, `planning-taches-${selectedScope}.ics`);
  };

  const projectMap = new Map<string, Project>(projects.map((p) => [p.id, p]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Exportation vers Google Calendar
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Synchronisez vos tâches avec votre calendrier en 1 clic
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Filter scope selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              1. Choisir les tâches à exporter
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'upcoming', label: 'Tâches à venir' },
                { id: 'today', label: "Aujourd'hui" },
                { id: 'all', label: 'Toutes les tâches' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedScope(tab.id as typeof selectedScope)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    selectedScope === tab.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Download ICS option */}
          <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Export global en 1 fichier (.ICS)</span>
              </h4>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-400/80 mt-0.5">
                Générez un fichier d'agenda compatible Google Calendar, Apple Calendar et Outlook.
              </p>
            </div>

            <button
              onClick={handleDownloadICS}
              disabled={exportableTasks.length === 0}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger .ICS ({exportableTasks.length})</span>
            </button>
          </div>

          {/* Quick Direct Google Calendar Links list */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              2. Liens directs vers Google Calendar ({exportableTasks.length})
            </label>

            {exportableTasks.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                Aucune tâche ne correspond au filtre sélectionné.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {exportableTasks.map((task, idx) => {
                  const proj = projectMap.get(task.projectId);
                  const gcalUrl = generateGoogleCalendarUrl(task, proj);

                  return (
                    <div
                      key={task.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                            {task.title}
                          </span>
                          {proj && (
                            <span
                              className="text-[10px] px-1.5 py-0.2 rounded-full text-slate-700 dark:text-slate-200"
                              style={{ backgroundColor: `${proj.color}20` }}
                            >
                              {proj.name}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>📅 {task.dueDate}</span>
                          {task.dueTime && <span>⏰ {task.dueTime}</span>}
                        </div>
                      </div>

                      <a
                        href={gcalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-indigo-600 dark:text-indigo-300 font-semibold text-xs rounded-lg border border-slate-200 dark:border-slate-600 transition-colors flex items-center gap-1 whitespace-nowrap"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Ajouter à Google</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

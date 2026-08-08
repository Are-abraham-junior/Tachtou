import React, { useState } from 'react';
import { Task, Project } from '../types';
import { generateGoogleCalendarUrl } from '../utils/calendarUtils';
import confetti from 'canvas-confetti';
import {
  Swords,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Bell,
  ExternalLink,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Check,
  Sparkles,
  Award,
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  projects: Project[];
  onToggleComplete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  projects,
  onToggleComplete,
  onToggleSubtask,
  onEditTask,
  onDeleteTask,
}) => {
  const [showSubtasks, setShowSubtasks] = useState(false);

  const project = projects.find((p) => p.id === task.projectId);

  const xpReward = task.xpReward || (task.priority === 'urgent' ? 100 : task.priority === 'high' ? 75 : 50);

  // Trigger completion
  const handleCompleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.status !== 'completed') {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#f59e0b', '#10b981', '#6366f1'],
        });
      } catch (err) {
        console.warn('Confetti error:', err);
      }
    }
    onToggleComplete(task.id);
  };

  // Priority badge styling in RPG theme
  const priorityStyles = {
    urgent: 'bg-rose-500 text-white border-2 border-slate-900',
    high: 'bg-amber-400 text-slate-950 border-2 border-slate-900 font-bold',
    medium: 'bg-sky-400 text-slate-950 border-2 border-slate-900 font-bold',
    low: 'bg-emerald-300 text-slate-950 border-2 border-slate-900 font-bold',
  };

  const priorityLabels = {
    urgent: '🔥 Très Haute',
    high: '⚔️ Haute',
    medium: '🛡️ Moyenne',
    low: '📜 Normal',
  };

  // Date status calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = task.dueDate < todayStr && task.status !== 'completed';
  const isToday = task.dueDate === todayStr;

  const completedSubtasksCount = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasksCount = task.subtasks.length;

  const gcalUrl = generateGoogleCalendarUrl(task, project);

  return (
    <div
      className={`group relative rounded-2xl p-4 transition-all duration-200 rpg-card bg-amber-50/90 dark:bg-slate-800 ${
        task.status === 'completed'
          ? 'opacity-70 grayscale-[20%] border-slate-400 dark:border-slate-700'
          : isOverdue
          ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/20'
          : 'hover:border-amber-500 dark:hover:border-amber-400'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Sword / Checkbox Button */}
        <button
          onClick={handleCompleteClick}
          className={`mt-0.5 p-2 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#000] transition-transform active:scale-90 ${
            task.status === 'completed'
              ? 'bg-emerald-400 text-slate-950'
              : 'bg-amber-300 hover:bg-amber-400 text-slate-950'
          }`}
          title={
            task.status === 'completed'
              ? 'Quête déjà accomplie (cliquez pour réactiver)'
              : 'TRANCHER LA QUÊTE (Coup d’épée !)'
          }
        >
          {task.status === 'completed' ? (
            <Check className="w-5 h-5 stroke-[3]" />
          ) : (
            <Swords className="w-5 h-5 stroke-[2.5]" />
          )}
        </button>

        {/* Task / Quest details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <h3
              className={`text-base font-bold text-slate-900 dark:text-slate-100 break-words ${
                task.status === 'completed'
                  ? 'line-through text-slate-500 dark:text-slate-400'
                  : ''
              }`}
            >
              {task.title}
            </h3>

            {/* XP Reward Badge */}
            <span className="px-2 py-0.5 text-[10px] font-pixel font-bold bg-amber-300 dark:bg-amber-950 text-amber-900 dark:text-amber-300 rounded-lg border border-slate-900 flex items-center gap-1 shadow-[1px_1px_0px_#000]">
              <Sparkles className="w-3 h-3 text-amber-600" /> +{xpReward} XP
            </span>

            {/* Priority Badge */}
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg shadow-[1px_1px_0px_#000] ${priorityStyles[task.priority]}`}>
              {priorityLabels[task.priority]}
            </span>

            {/* Project Badge */}
            {project && (
              <span
                className="px-2 py-0.5 text-xs font-bold rounded-lg text-slate-900 dark:text-slate-100 border-2 border-slate-900 flex items-center gap-1 shadow-[1px_1px_0px_#000]"
                style={{ backgroundColor: `${project.color}30` }}
              >
                <span className="w-2.5 h-2.5 rounded-full border border-slate-900" style={{ backgroundColor: project.color }} />
                {project.name}
              </span>
            )}
          </div>

          {/* Quest Description */}
          {task.description && (
            <p className="text-xs text-slate-700 dark:text-slate-300 mb-2.5 line-clamp-2 italic font-medium">
              "{task.description}"
            </p>
          )}

          {/* Date, Time, Reminder Bar */}
          <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 flex-wrap mt-2">
            {/* Due date */}
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold border border-slate-900 shadow-[1px_1px_0px_#000] ${
                isOverdue
                  ? 'bg-rose-500 text-white font-pixel text-[10px]'
                  : isToday
                  ? 'bg-amber-300 text-slate-950'
                  : 'bg-white dark:bg-slate-700'
              }`}
            >
              {isOverdue && <AlertTriangle className="w-3.5 h-3.5 text-white animate-bounce" />}
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {isToday
                  ? "Aujourd'hui"
                  : new Date(task.dueDate + 'T00:00:00').toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })}
              </span>
            </div>

            {/* Due time */}
            {task.dueTime && (
              <div className="flex items-center gap-1 bg-white dark:bg-slate-700 px-2 py-0.5 rounded-xl border border-slate-900 shadow-[1px_1px_0px_#000] font-semibold">
                <Clock className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                <span>{task.dueTime}</span>
              </div>
            )}

            {/* Reminder Badge */}
            {task.reminderTime && task.reminderTime !== 'none' && (
              <div className="flex items-center gap-1 text-indigo-900 dark:text-indigo-200 bg-indigo-200 dark:bg-indigo-900/80 px-2 py-0.5 rounded-xl border border-slate-900 font-bold text-[11px] shadow-[1px_1px_0px_#000]">
                <Bell className="w-3 h-3 text-indigo-700 dark:text-indigo-300" />
                <span>
                  {task.reminderTime === '0'
                    ? 'Rappel exact'
                    : `Rappel -${task.reminderTime} min`}
                </span>
              </div>
            )}

            {/* Subtasks summary */}
            {totalSubtasksCount > 0 && (
              <button
                onClick={() => setShowSubtasks(!showSubtasks)}
                className="flex items-center gap-1 text-indigo-700 dark:text-indigo-300 hover:underline font-bold ml-auto text-[11px]"
              >
                <span>
                  Sous-quêtes ({completedSubtasksCount}/{totalSubtasksCount})
                </span>
                {showSubtasks ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>

          {/* Subtasks checklist expander */}
          {showSubtasks && totalSubtasksCount > 0 && (
            <div className="mt-3 pt-2.5 border-t-2 border-slate-900/10 dark:border-slate-700 space-y-2">
              {task.subtasks.map((sub) => (
                <div key={sub.id} className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <button
                    onClick={() => onToggleSubtask(task.id, sub.id)}
                    className="p-1 rounded-lg border border-slate-900 transition-colors"
                  >
                    {sub.completed ? (
                      <div className="w-3.5 h-3.5 rounded bg-emerald-400 text-slate-950 flex items-center justify-center font-bold">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded bg-white dark:bg-slate-700" />
                    )}
                  </button>
                  <span className={sub.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                    {sub.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {/* Quick Google Calendar Export Link */}
          <a
            href={gcalUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Ajouter à Google Calendar"
            className="p-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-900 shadow-[1.5px_1.5px_0px_#000] hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors text-slate-800 dark:text-slate-200"
          >
            <ExternalLink className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </a>

          {/* Edit */}
          <button
            onClick={() => onEditTask(task)}
            title="Modifier la quête"
            className="p-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-900 shadow-[1.5px_1.5px_0px_#000] hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors text-slate-800 dark:text-slate-200"
          >
            <Edit2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDeleteTask(task.id)}
            title="Supprimer la quête"
            className="p-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-900 shadow-[1.5px_1.5px_0px_#000] hover:bg-rose-100 dark:hover:bg-rose-900 transition-colors text-slate-800 dark:text-slate-200"
          >
            <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </button>
        </div>
      </div>
    </div>
  );
};


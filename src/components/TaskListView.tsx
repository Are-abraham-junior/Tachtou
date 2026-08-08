import React, { useState } from 'react';
import { Task, Project, FilterOptions, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  CalendarDays,
  Clock,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Swords,
  Scroll,
} from 'lucide-react';

interface TaskListViewProps {
  tasks: Task[];
  projects: Project[];
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onToggleComplete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenNewTaskModal: () => void;
  onQuickAddTask: (title: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  projects,
  filters,
  onFilterChange,
  onToggleComplete,
  onToggleSubtask,
  onEditTask,
  onDeleteTask,
  onOpenNewTaskModal,
  onQuickAddTask,
  onStatusChange,
}) => {
  const [quickTitle, setQuickTitle] = useState('');
  const [isKanbanView, setIsKanbanView] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Apply filters
  const filteredTasks = tasks.filter((task) => {
    // Search
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    // Project
    if (filters.projectId !== 'all' && task.projectId !== filters.projectId) {
      return false;
    }
    // Priority
    if (filters.priority !== 'all' && task.priority !== filters.priority) {
      return false;
    }
    // Status
    if (filters.status !== 'all' && task.status !== filters.status) {
      return false;
    }
    // Date filter
    if (filters.dateFilter === 'today') {
      return task.dueDate === todayStr;
    }
    if (filters.dateFilter === 'upcoming') {
      return task.dueDate > todayStr && task.status !== 'completed';
    }
    if (filters.dateFilter === 'overdue') {
      return task.dueDate < todayStr && task.status !== 'completed';
    }
    if (filters.dateFilter === 'completed') {
      return task.status === 'completed';
    }

    return true;
  });

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    onQuickAddTask(quickTitle.trim());
    setQuickTitle('');
  };

  // Counts for quick tabs
  const todayCount = tasks.filter((t) => t.dueDate === todayStr && t.status !== 'completed').length;
  const overdueCount = tasks.filter((t) => t.dueDate < todayStr && t.status !== 'completed').length;

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-amber-100 dark:bg-slate-900 rounded-2xl p-3.5 border-4 border-slate-900 shadow-[5px_5px_0px_#000] flex items-center gap-3">
        <div className="flex-1 flex items-center gap-3">
          <div className="p-2 bg-amber-400 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#000]">
            <Search className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="relative flex-1">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              placeholder="Rechercher une quête, un mot-clé ou une tâche..."
              className="w-full bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border-2 border-slate-900 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-[2px_2px_0px_#000]"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, search: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 border border-slate-900"
              >
                Effacer
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onOpenNewTaskModal}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-pixel text-xs font-bold rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>NOUVELLE QUÊTE</span>
          </button>
        </div>
      </div>

      {/* Filter and View Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-amber-50/80 dark:bg-slate-800/80 p-4 rounded-2xl border-4 border-slate-900 shadow-[5px_5px_0px_#000]">
        {/* Date Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'Toutes les quêtes', icon: Scroll, count: tasks.length },
            { id: 'today', label: "Aujourd'hui", icon: CalendarDays, count: todayCount, badge: todayCount > 0 },
            { id: 'upcoming', label: 'Prochaines', icon: Clock },
            { id: 'overdue', label: 'En retard !', icon: AlertCircle, count: overdueCount, alert: overdueCount > 0 },
            { id: 'completed', label: 'Accomplies', icon: CheckCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = filters.dateFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onFilterChange({ ...filters, dateFilter: tab.id as FilterOptions['dateFilter'] })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap border-2 ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 border-slate-900 shadow-[2px_2px_0px_#000]'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-900 hover:bg-amber-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-pixel border border-slate-900 ${
                      tab.alert
                        ? 'bg-rose-500 text-white'
                        : isActive
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dropdown Filters & View Switcher */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
          {/* Project dropdown */}
          <select
            value={filters.projectId}
            onChange={(e) => onFilterChange({ ...filters, projectId: e.target.value })}
            className="px-3 py-1.5 rounded-xl border-2 border-slate-900 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-[2px_2px_0px_#000]"
          >
            <option value="all">Tous les royaumes</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* View mode toggle (List vs Kanban) */}
          <div className="flex items-center bg-amber-200 dark:bg-slate-900 p-1 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#000]">
            <button
              onClick={() => setIsKanbanView(false)}
              title="Vue Liste"
              className={`p-1.5 rounded-lg transition-all ${
                !isKanbanView
                  ? 'bg-amber-400 text-slate-950 font-bold border border-slate-900'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <List className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              onClick={() => setIsKanbanView(true)}
              title="Vue Tableau (Kanban)"
              className={`p-1.5 rounded-lg transition-all ${
                isKanbanView
                  ? 'bg-amber-400 text-slate-950 font-bold border border-slate-900'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <LayoutGrid className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Task Display Area */}
      {filteredTasks.length === 0 ? (
        <div className="bg-amber-50/90 dark:bg-slate-800 rounded-3xl p-12 text-center border-4 border-slate-900 shadow-[8px_8px_0px_#000] my-8">
          <div className="w-20 h-20 bg-amber-300 border-4 border-slate-900 rounded-full flex items-center justify-center text-slate-950 mx-auto mb-4 shadow-[4px_4px_0px_#000]">
            <Sparkles className="w-10 h-10" />
          </div>
          <h3 className="font-pixel text-base font-bold text-slate-900 dark:text-amber-400 mb-2">
            AUCUNE QUÊTE EN COURS !
          </h3>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 max-w-md mx-auto mb-6">
            Votre journal de quêtes est totalement vide pour ce filtre. Préparez de nouvelles aventures !
          </p>
          <button
            onClick={onOpenNewTaskModal}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-pixel text-xs font-bold rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_#000] transition-all"
          >
            + CRÉER UNE NOUVELLE QUÊTE
          </button>
        </div>
      ) : isKanbanView ? (
        /* Kanban View (3 Columns) */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {[
            { id: 'todo' as TaskStatus, title: 'À faire', color: 'bg-amber-400' },
            { id: 'in_progress' as TaskStatus, title: 'En cours', color: 'bg-sky-400' },
            { id: 'completed' as TaskStatus, title: 'Accomplies', color: 'bg-emerald-400' },
          ].map((column) => {
            const colTasks = filteredTasks.filter((t) => t.status === column.id);
            return (
              <div
                key={column.id}
                className="bg-amber-50 dark:bg-slate-800/80 rounded-2xl p-4 border-4 border-slate-900 shadow-[6px_6px_0px_#000] space-y-3 min-h-[400px]"
              >
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-3.5 h-3.5 rounded-full border border-slate-900 ${column.color}`} />
                    <h3 className="font-pixel text-xs font-bold text-slate-900 dark:text-amber-300">
                      {column.title}
                    </h3>
                  </div>
                  <span className="text-xs font-pixel font-bold px-2 py-0.5 rounded-lg bg-amber-300 dark:bg-slate-900 text-slate-950 dark:text-amber-400 border border-slate-900">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {colTasks.map((task) => (
                    <div key={task.id} className="relative">
                      <TaskCard
                        task={task}
                        projects={projects}
                        onToggleComplete={onToggleComplete}
                        onToggleSubtask={onToggleSubtask}
                        onEditTask={onEditTask}
                        onDeleteTask={onDeleteTask}
                      />
                      {/* Move status buttons in kanban */}
                      <div className="mt-1 flex items-center justify-end gap-2 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        {column.id !== 'todo' && (
                          <button
                            onClick={() => onStatusChange(task.id, 'todo')}
                            className="hover:underline text-indigo-600 dark:text-indigo-400"
                          >
                            ← À faire
                          </button>
                        )}
                        {column.id !== 'in_progress' && (
                          <button
                            onClick={() => onStatusChange(task.id, 'in_progress')}
                            className="hover:underline text-amber-600 dark:text-amber-400"
                          >
                            En cours
                          </button>
                        )}
                        {column.id !== 'completed' && (
                          <button
                            onClick={() => onStatusChange(task.id, 'completed')}
                            className="hover:underline text-emerald-600 dark:text-emerald-400"
                          >
                            Terminé →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Standard List View */
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              projects={projects}
              onToggleComplete={onToggleComplete}
              onToggleSubtask={onToggleSubtask}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </div>
      )}
    </div>
  );
};


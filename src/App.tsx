import React, { useState, useEffect } from 'react';
import { Task, Project, ViewMode, FilterOptions, TaskStatus, UserProfile } from './types';
import {
  loadTasks,
  saveTasks,
  loadProjects,
  saveProjects,
  loadDarkMode,
  saveDarkMode,
  loadUserProfile,
  saveUserProfile,
  saveEmailLog,
} from './utils/storage';
import { checkPendingReminders } from './utils/notificationUtils';
import { dispatchEmailNotification } from './utils/emailUtils';
import { playSwordSlashSound, speakCongratulations, playLevelUpSound } from './utils/audioUtils';

import { Navbar } from './components/Navbar';
import { TaskListView } from './components/TaskListView';
import { ProjectsView } from './components/ProjectsView';
import { StatsView } from './components/StatsView';
import { TaskModal } from './components/TaskModal';
import { CalendarExportModal } from './components/CalendarExportModal';
import { NotificationModal } from './components/NotificationModal';
import { ProfileModal } from './components/ProfileModal';
import { SwordSlashOverlay } from './components/SwordSlashOverlay';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => loadDarkMode());
  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadUserProfile());

  const [currentView, setCurrentView] = useState<ViewMode>('tasks');
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    projectId: 'all',
    priority: 'all',
    status: 'all',
    dateFilter: 'today',
  });

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isCalendarExportOpen, setIsCalendarExportOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Sword slash animation state
  const [isSwordOverlayOpen, setIsSwordOverlayOpen] = useState(false);
  const [lastCompletedTaskTitle, setLastCompletedTaskTitle] = useState('');

  const [recentReminders, setRecentReminders] = useState<
    { id: string; title: string; time: string }[]
  >([]);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveDarkMode(isDarkMode);
  }, [isDarkMode]);

  // Sync tasks to LocalStorage
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Sync projects to LocalStorage
  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  // Sync UserProfile to LocalStorage
  useEffect(() => {
    saveUserProfile(userProfile);
  }, [userProfile]);

  // Periodic Reminder Check Interval (every 20s)
  useEffect(() => {
    const checkReminders = () => {
      const triggeredIds = checkPendingReminders(tasks, (task) => {
        setRecentReminders((prev) => [
          {
            id: `${task.id}-${Date.now()}`,
            title: task.title,
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          },
          ...prev,
        ]);

        // Dispatch Email Notification for Task Reminder
        if (userProfile.emailNotificationsEnabled && userProfile.notifyOnTaskDueDate) {
          const targetEmail = userProfile.userEmail || 'hero@tachtou.app';
          const salutation = userProfile.title
            ? `${userProfile.title} ${userProfile.heroName}`
            : userProfile.heroName || 'Junior';

          dispatchEmailNotification({
            toEmail: targetEmail,
            subject: `⏰ Rappel de Quête : ${task.title}`,
            body: `Bonjour ${salutation},\n\nVotre quête "${task.title}" arrive à échéance !\nN'oubliez pas d'accomplir vos tâches pour remporter de l'XP et de l'or.\n\nÀ bientôt sur TACHTOU !`,
            type: 'reminder',
            profile: userProfile,
          });
        }
      });

      if (triggeredIds.length > 0) {
        setTasks((prevTasks) =>
          prevTasks.map((t) => (triggeredIds.includes(t.id) ? { ...t, reminderSent: true } : t))
        );
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 20000);
    return () => clearInterval(interval);
  }, [tasks, userProfile]);

  // Award XP and handle completion sound/voice/slash
  const handleRewardCompletion = (task: Task) => {
    // Audio Sound FX
    playSwordSlashSound();

    // Trigger sword slash animation overlay (which speaks the congratulations)
    setLastCompletedTaskTitle(task.title);
    setIsSwordOverlayOpen(true);

    // Dispatch Email Notification for Quest Completion
    if (userProfile.emailNotificationsEnabled && userProfile.notifyOnQuestCompleted) {
      const targetEmail = userProfile.userEmail || 'hero@tachtou.app';
      const salutation = userProfile.title
        ? `${userProfile.title} ${userProfile.heroName}`
        : userProfile.heroName || 'Junior';
      const xpGained = task.xpReward || 50;

      dispatchEmailNotification({
        toEmail: targetEmail,
        subject: `⚔️ Quête Accomplie : ${task.title}`,
        body: `Félicitations ${salutation} !\n\nVous avez accompli la quête "${task.title}" avec succès et gagné +${xpGained} XP ainsi que +10 pièces d'or.\n\nContinuez ainsi pour franchir les prochains niveaux !`,
        type: 'completion',
        profile: userProfile,
      });
    }

    // Calculate XP & Level progression
    const xpGained = task.xpReward || 50;
    const newXp = userProfile.xp + xpGained;
    const newGold = userProfile.gold + 10;
    const newLevel = Math.floor(newXp / 500) + 1;
    const newQuestsCompleted = userProfile.questsCompleted + 1;

    if (newLevel > userProfile.level) {
      setTimeout(() => {
        playLevelUpSound();
      }, 600);
    }

    setUserProfile((prev) => ({
      ...prev,
      xp: newXp,
      gold: newGold,
      level: newLevel,
      questsCompleted: newQuestsCompleted,
    }));
  };

  // Handlers for Tasks
  const handleToggleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isCurrentlyCompleted = t.status === 'completed';
          const nextStatus = isCurrentlyCompleted ? 'todo' : 'completed';

          if (!isCurrentlyCompleted) {
            handleRewardCompletion(t);
          }

          return {
            ...t,
            status: nextStatus,
            completedAt: !isCurrentlyCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          );
          return { ...t, subtasks: updatedSubtasks };
        }
        return t;
      })
    );
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          if (t.status !== 'completed' && newStatus === 'completed') {
            handleRewardCompletion(t);
          }
          return {
            ...t,
            status: newStatus,
            completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt'> & { id?: string }) => {
    if (taskData.id) {
      // Edit existing task
      setTasks((prev) =>
        prev.map((t) => (t.id === taskData.id ? ({ ...t, ...taskData } as Task) : t))
      );
    } else {
      // Create new task
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette quête ?')) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };

  const handleQuickAddTask = (title: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      projectId: projects[0]?.id || 'proj-1',
      priority: 'medium',
      status: 'todo',
      dueDate: todayStr,
      dueTime: '12:00',
      reminderTime: '15',
      estimatedMinutes: 30,
      xpReward: 50,
      subtasks: [],
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  // Handlers for Projects
  const handleAddProject = (projData: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...projData,
      id: `proj-${Date.now()}`,
    };
    setProjects((prev) => [...prev, newProject]);
  };

  const handleEditProject = (updatedProj: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
  };

  const handleDeleteProject = (projectId: string) => {
    if (projects.length <= 1) {
      alert('Vous devez conserver au moins un royaume (projet).');
      return;
    }
    if (window.confirm('Supprimer ce royaume ? Les quêtes associées seront transférées au premier royaume.')) {
      const fallbackProjectId = projects.find((p) => p.id !== projectId)?.id || projects[0].id;
      setTasks((prev) =>
        prev.map((t) => (t.projectId === projectId ? { ...t, projectId: fallbackProjectId } : t))
      );
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    }
  };

  const handleSelectProjectFilter = (projectId: string) => {
    setFilters((prev) => ({ ...prev, projectId }));
    setCurrentView('tasks');
  };

  // Overdue check for bell indicator
  const todayStr = new Date().toISOString().split('T')[0];
  const hasOverdueTasks = tasks.some((t) => t.dueDate < todayStr && t.status !== 'completed');

  return (
    <div className="min-h-screen bg-amber-50/30 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col selection:bg-amber-400 selection:text-slate-950">
      {/* Sword Slash Completion Effect */}
      <SwordSlashOverlay
        isOpen={isSwordOverlayOpen}
        onClose={() => setIsSwordOverlayOpen(false)}
        taskTitle={lastCompletedTaskTitle}
        heroName={userProfile.heroName}
        title={userProfile.title}
        voiceEnabled={userProfile.voiceVoiceEnabled}
      />

      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        userProfile={userProfile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenNewTaskModal={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onOpenCalendarExport={() => setIsCalendarExportOpen(true)}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        notificationCount={recentReminders.length}
        hasOverdueTasks={hasOverdueTasks}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'tasks' && (
          <TaskListView
            tasks={tasks}
            projects={projects}
            filters={filters}
            onFilterChange={setFilters}
            onToggleComplete={handleToggleComplete}
            onToggleSubtask={handleToggleSubtask}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onOpenNewTaskModal={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            onQuickAddTask={handleQuickAddTask}
            onStatusChange={handleStatusChange}
          />
        )}

        {currentView === 'projects' && (
          <ProjectsView
            projects={projects}
            tasks={tasks}
            onAddProject={handleAddProject}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
            onSelectProjectFilter={handleSelectProjectFilter}
          />
        )}

        {currentView === 'stats' && <StatsView tasks={tasks} projects={projects} />}

        {currentView === 'calendar' && (
          <div className="space-y-6">
            <div className="bg-amber-100/80 dark:bg-slate-800/90 rounded-3xl p-6 border-4 border-slate-900 shadow-[6px_6px_0px_#000]">
              <h2 className="font-pixel text-base font-bold text-slate-950 dark:text-amber-400 mb-2">
                SYNCHRONISATION ET EXPORTATION DES QUÊTES
              </h2>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-300 mb-6 max-w-2xl leading-relaxed">
                Exporter facilement vos quêtes TACHTOU vers Google Calendar ou générez un fichier .ICS pour planifier vos victoires dans votre emploi du temps quotidien !
              </p>
              <button
                onClick={() => setIsCalendarExportOpen(true)}
                className="px-5 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-pixel text-xs font-bold rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2"
              >
                <span>EXPORTER VERS GOOGLE CALENDAR</span>
              </button>
            </div>
            <StatsView tasks={tasks} projects={projects} />
          </div>
        )}
      </main>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        initialTask={editingTask}
        projects={projects}
      />

      <CalendarExportModal
        isOpen={isCalendarExportOpen}
        onClose={() => setIsCalendarExportOpen(false)}
        tasks={tasks}
        projects={projects}
      />

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        recentReminders={recentReminders}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={userProfile}
        onUpdateProfile={setUserProfile}
        onSaveProfile={setUserProfile}
      />
    </div>
  );
}


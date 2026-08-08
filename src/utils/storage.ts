import { Task, Project, UserProfile } from '../types';
import { INITIAL_PROJECTS, INITIAL_TASKS } from '../data/initialData';

const TASKS_KEY = 'tachtou_tasks_v2';
const PROJECTS_KEY = 'tachtou_projects_v2';
const THEME_KEY = 'tachtou_theme_v2';
const PROFILE_KEY = 'tachtou_profile_v2';

const EMAIL_LOGS_KEY = 'tachtou_email_logs_v1';

export const DEFAULT_USER_PROFILE: UserProfile = {
  heroName: 'Junior',
  title: 'Mage',
  avatar: '🧙‍♂️',
  level: 1,
  xp: 120,
  xpToNextLevel: 300,
  goldCoins: 45,
  soundEffectsEnabled: true,
  voiceVoiceEnabled: true,
  emailNotificationsEnabled: true,
  userEmail: 'hero@tachtou.app',
  notifyOnTaskDueDate: true,
  notifyOnQuestCompleted: true,
};

export function loadUserProfile(): UserProfile {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    if (!data) {
      saveUserProfile(DEFAULT_USER_PROFILE);
      return DEFAULT_USER_PROFILE;
    }
    return { ...DEFAULT_USER_PROFILE, ...JSON.parse(data) };
  } catch (e) {
    console.error('Failed to load user profile:', e);
    return DEFAULT_USER_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save user profile:', e);
  }
}

export function loadTasks(): Task[] {
  try {
    const data = localStorage.getItem(TASKS_KEY);
    if (!data) {
      saveTasks(INITIAL_TASKS);
      return INITIAL_TASKS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load tasks from localStorage:', e);
    return INITIAL_TASKS;
  }
}

export function saveTasks(tasks: Task[]) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks to localStorage:', e);
  }
}

export function loadProjects(): Project[] {
  try {
    const data = localStorage.getItem(PROJECTS_KEY);
    if (!data) {
      saveProjects(INITIAL_PROJECTS);
      return INITIAL_PROJECTS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load projects from localStorage:', e);
    return INITIAL_PROJECTS;
  }
}

export function saveProjects(projects: Project[]) {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects to localStorage:', e);
  }
}

export function loadDarkMode(): boolean {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    if (theme !== null) {
      return theme === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

export function saveDarkMode(isDark: boolean) {
  try {
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  } catch (e) {
    console.error('Failed to save dark mode setting:', e);
  }
}

export function loadEmailLogs(): import('../types').EmailLog[] {
  try {
    const data = localStorage.getItem(EMAIL_LOGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load email logs:', e);
    return [];
  }
}

export function saveEmailLog(log: Omit<import('../types').EmailLog, 'id' | 'sentAt'>) {
  try {
    const logs = loadEmailLogs();
    const newLog: import('../types').EmailLog = {
      ...log,
      id: 'email-' + Date.now(),
      sentAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }),
    };
    const updated = [newLog, ...logs].slice(0, 30); // Keep last 30
    localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(updated));
    return newLog;
  } catch (e) {
    console.error('Failed to save email log:', e);
    return null;
  }
}


export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface UserProfile {
  heroName: string;
  title: string; // e.g. "Chevalier du Code", "Mage de la Productivité", "Aventurier Légendaire"
  avatar: string; // e.g. "⚔️", "🧙‍♂️", "🥷", "🛡️", "🐉", "👑"
  level: number;
  xp: number;
  xpToNextLevel: number;
  goldCoins: number;
  soundEffectsEnabled: boolean;
  voiceVoiceEnabled: boolean;
  // Email Notifications & Gmail Integration
  emailNotificationsEnabled: boolean;
  userEmail: string;
  notifyOnTaskDueDate: boolean;
  notifyOnQuestCompleted: boolean;
  gmailConnected?: boolean;
  gmailAccessToken?: string;
  gmailRefreshToken?: string;
  gmailUserEmail?: string;
}

export interface EmailLog {
  id: string;
  toEmail: string;
  subject: string;
  body: string;
  sentAt: string;
  type: 'reminder' | 'completion' | 'test' | 'summary';
  status?: 'sent_via_gmail' | 'logged' | 'failed';
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  reminderTime?: string; // e.g., '0' (at time), '15' (15 min before), '60' (1 hour before), '1440' (1 day before)
  reminderSent?: boolean;
  estimatedMinutes?: number;
  actualMinutes?: number;
  xpReward?: number;
  tags?: string[];
  subtasks: SubTask[];
  createdAt: string;
  completedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  color: string; // Hex color code or Tailwind color string
  icon: string; // Lucide icon name
  description?: string;
}

export type ViewMode = 'tasks' | 'projects' | 'stats' | 'calendar';

export interface FilterOptions {
  search: string;
  projectId: string; // 'all' or specific ID
  priority: string; // 'all' or specific Priority
  status: string; // 'all' or specific TaskStatus
  dateFilter: 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';
}


import { Project, Task } from '../types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Travail & Business',
    color: '#3B82F6', // Blue
    icon: 'Briefcase',
    description: 'Projets professionnels, réunions et livrables client',
  },
  {
    id: 'proj-2',
    name: 'Personnel & Vie',
    color: '#10B981', // Green
    icon: 'User',
    description: 'Tâches quotidiennes, santé, maison et démarches',
  },
  {
    id: 'proj-3',
    name: 'Études & Formation',
    color: '#8B5CF6', // Purple
    icon: 'GraduationCap',
    description: 'Apprentissage, cours, lecture et développement de compétences',
  },
  {
    id: 'proj-4',
    name: 'Santé & Sport',
    color: '#EF4444', // Red
    icon: 'HeartPulse',
    description: 'Séances d’entraînement, planification de repas et bien-être',
  },
  {
    id: 'proj-5',
    name: 'Projets Créatifs',
    color: '#F59E0B', // Amber
    icon: 'Sparkles',
    description: 'Design, écriture, vidéo et idées innovantes',
  },
];

const getFormattedDate = (offsetDays: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Préparer la présentation pour le client',
    description: 'Finaliser les diapositives du rapport trimestriel et vérifier les chiffres clés.',
    projectId: 'proj-1',
    priority: 'urgent',
    status: 'todo',
    dueDate: getFormattedDate(0), // Today
    dueTime: '14:30',
    reminderTime: '15', // 15 min before
    reminderSent: false,
    estimatedMinutes: 60,
    subtasks: [
      { id: 'sub-1', title: 'Relire les graphiques financiers', completed: true },
      { id: 'sub-2', title: 'Ajouter la conclusion marketing', completed: false },
      { id: 'sub-3', title: 'Exporter au format PDF', completed: false },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Séance de Running 5km',
    description: 'Course à pied matinale dans le parc pour maintenir le rythme hebdomadaire.',
    projectId: 'proj-4',
    priority: 'medium',
    status: 'completed',
    dueDate: getFormattedDate(0), // Today
    dueTime: '08:00',
    reminderTime: '0',
    reminderSent: true,
    estimatedMinutes: 45,
    actualMinutes: 40,
    subtasks: [],
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Rendez-vous dentiste',
    description: 'Contrôle annuel et nettoyage.',
    projectId: 'proj-2',
    priority: 'high',
    status: 'todo',
    dueDate: getFormattedDate(1), // Tomorrow
    dueTime: '10:00',
    reminderTime: '60', // 1h before
    reminderSent: false,
    estimatedMinutes: 45,
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Suivre le module 4 de la formation TypeScript',
    description: 'Etudier les types avancés, Generics et Mapped Types.',
    projectId: 'proj-3',
    priority: 'medium',
    status: 'in_progress',
    dueDate: getFormattedDate(0),
    dueTime: '17:00',
    reminderTime: '15',
    reminderSent: false,
    estimatedMinutes: 90,
    subtasks: [
      { id: 'sub-4', title: 'Regarder les vidéos du chapitre 1', completed: true },
      { id: 'sub-5', title: 'Faire les exercices pratiques', completed: false },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-5',
    title: 'Rédiger l’article de blog sur la productivité',
    description: 'Expliquer l’utilisation de la méthode Time-Blocking et la règle des 2 minutes.',
    projectId: 'proj-5',
    priority: 'low',
    status: 'completed',
    dueDate: getFormattedDate(-1), // Yesterday
    dueTime: '16:00',
    estimatedMinutes: 120,
    actualMinutes: 110,
    subtasks: [
      { id: 'sub-6', title: 'Trouver des exemples concrets', completed: true },
      { id: 'sub-7', title: 'Relecture orthographique', completed: true },
    ],
    createdAt: new Date().toISOString(),
    completedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'task-6',
    title: 'Planifier le menu de la semaine et faire les courses',
    description: 'Acheter des légumes frais, protéines et céréales complètes.',
    projectId: 'proj-2',
    priority: 'medium',
    status: 'completed',
    dueDate: getFormattedDate(-2), // 2 days ago
    dueTime: '11:00',
    estimatedMinutes: 60,
    actualMinutes: 55,
    subtasks: [],
    createdAt: new Date().toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'task-7',
    title: 'Revue de code de la Pull Request #42',
    description: 'Vérifier la couverture de tests et l’architecture des composants.',
    projectId: 'proj-1',
    priority: 'high',
    status: 'completed',
    dueDate: getFormattedDate(-3),
    dueTime: '15:00',
    estimatedMinutes: 30,
    actualMinutes: 35,
    subtasks: [],
    createdAt: new Date().toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'task-8',
    title: 'Analyse hebdomadaire des indicateurs de performance',
    description: 'Faire un bilan des objectifs atteints et ajuster le planning de la semaine prochaine.',
    projectId: 'proj-1',
    priority: 'medium',
    status: 'completed',
    dueDate: getFormattedDate(-4),
    dueTime: '18:00',
    estimatedMinutes: 45,
    actualMinutes: 45,
    subtasks: [],
    createdAt: new Date().toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

import React from 'react';
import { Task, Project } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  Trophy,
  Flame,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award,
  Zap,
} from 'lucide-react';

interface StatsViewProps {
  tasks: Task[];
  projects: Project[];
}

export const StatsView: React.FC<StatsViewProps> = ({ tasks, projects }) => {
  // Weekly Days Data Calculation (Mon - Sun)
  const getDayName = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { weekday: 'short' });
  };

  // Generate last 7 days array
  const last7DaysData = Array.from({ length: 7 })
    .map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = getDayName(d);

      const completedCount = tasks.filter(
        (t) => t.status === 'completed' && t.completedAt && t.completedAt.startsWith(dateStr)
      ).length;

      const createdCount = tasks.filter(
        (t) => t.createdAt && t.createdAt.startsWith(dateStr)
      ).length;

      return {
        date: dateStr,
        day: dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1),
        Terminées: completedCount,
        Créées: createdCount,
      };
    });

  // Project Distribution Data
  const projectStatsData = projects.map((proj) => {
    const projTasks = tasks.filter((t) => t.projectId === proj.id);
    const completed = projTasks.filter((t) => t.status === 'completed').length;
    return {
      name: proj.name,
      total: projTasks.length,
      completed,
      color: proj.color,
    };
  }).filter((p) => p.total > 0);

  // Priority Distribution Data
  const priorityMap = {
    urgent: { label: 'Urgente', color: '#EF4444' },
    high: { label: 'Haute', color: '#F59E0B' },
    medium: { label: 'Moyenne', color: '#3B82F6' },
    low: { label: 'Basse', color: '#64748B' },
  };

  const priorityStatsData = (['urgent', 'high', 'medium', 'low'] as const).map((pKey) => {
    const count = tasks.filter((t) => t.priority === pKey && t.status === 'completed').length;
    return {
      name: priorityMap[pKey].label,
      count,
      color: priorityMap[pKey].color,
    };
  });

  // Global KPIs
  const totalCompleted = tasks.filter((t) => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  const totalEstimatedMinutes = tasks
    .filter((t) => t.status === 'completed')
    .reduce((acc, curr) => acc + (curr.actualMinutes || curr.estimatedMinutes || 30), 0);

  const totalHours = Math.round((totalEstimatedMinutes / 60) * 10) / 10;

  // Streak calculation
  let streakDays = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const hasCompletedOnDay = tasks.some(
      (t) => t.status === 'completed' && t.completedAt && t.completedAt.startsWith(dateStr)
    );
    if (hasCompletedOnDay) {
      streakDays++;
    } else if (i > 0) {
      break;
    }
  }

  // Productivity Score out of 100
  const productivityScore = Math.min(100, Math.round(completionRate * 0.6 + streakDays * 8 + totalCompleted * 2));

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 rounded-2xl shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-400 border border-white/20">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Tableau de Productivité Hebdomadaire</h2>
            <p className="text-xs text-indigo-200 mt-0.5">
              Analyse détaillée de vos performances et de l'atteinte de vos objectifs
            </p>
          </div>
        </div>

        {/* Productivity Score Pill */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20">
          <Zap className="w-6 h-6 text-amber-400 animate-pulse" />
          <div>
            <div className="text-xs text-indigo-200 uppercase font-bold tracking-wider">
              Score de Productivité
            </div>
            <div className="text-xl font-extrabold text-white">{productivityScore} / 100</div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Tâches Terminées
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {totalCompleted} <span className="text-xs font-normal text-slate-400">/ {totalTasks}</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Taux de Complétion
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {completionRate}%
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Série Actuelle (Streak)
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {streakDays} jour{streakDays > 1 ? 's' : ''} 🔥
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Temps Concentré
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {totalHours} h
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Daily Completed Tasks Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Activité des 7 Derniers Jours
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Nombre de tâches accomplies jour par jour
            </p>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Terminées" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Project Distribution Donut Chart (1 col) */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Répartition par Projet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Volume de tâches par catégorie
            </p>
          </div>

          {projectStatsData.length > 0 ? (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="completed"
                  >
                    {projectStatsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              Pas encore de données projet.
            </div>
          )}

          {/* Legend */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 max-h-28 overflow-y-auto">
            {projectStatsData.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{p.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  {p.completed} / {p.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights & Tips Box */}
      <div className="bg-indigo-50/60 dark:bg-indigo-950/40 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-4">
        <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md">
          <Award className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200 mb-1">
            Conseils d'Optimisation de votre Emploi du Temps
          </h4>
          <p className="text-xs text-indigo-900/80 dark:text-indigo-300/80 leading-relaxed">
            {completionRate >= 70
              ? "Excellente régularité ! Vous maintenez un rythme très élevé cette semaine. Pensez à exporter vos rendez-vous importants vers Google Calendar pour garder vos créneaux verrouillés."
              : "Pour booster votre score de productivité, essayez d'exécuter 2 petites tâches prioritaires dès le début de votre journée."}
          </p>
        </div>
      </div>
    </div>
  );
};

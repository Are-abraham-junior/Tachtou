import React from 'react';
import { ViewMode, UserProfile } from '../types';
import {
  Swords,
  FolderKanban,
  BarChart3,
  Calendar,
  Sun,
  Moon,
  Bell,
  Plus,
  Coins,
  ShieldAlert,
  User,
  Trophy,
} from 'lucide-react';

interface NavbarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenNewTaskModal: () => void;
  onOpenCalendarExport: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  userProfile: UserProfile;
  notificationCount: number;
  hasOverdueTasks: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  isDarkMode,
  onToggleDarkMode,
  onOpenNewTaskModal,
  onOpenCalendarExport,
  onOpenNotifications,
  onOpenProfile,
  userProfile,
  notificationCount,
  hasOverdueTasks,
}) => {
  const navItems = [
    { id: 'tasks' as ViewMode, label: 'Quêtes', icon: Swords },
    { id: 'projects' as ViewMode, label: 'Royaumes', icon: FolderKanban },
    { id: 'stats' as ViewMode, label: 'Hauts-Faits', icon: BarChart3 },
    { id: 'calendar' as ViewMode, label: 'Agenda & Export', icon: Calendar },
  ];

  const xpPercent = Math.min(
    100,
    Math.round((userProfile.xp / userProfile.xpToNextLevel) * 100)
  );

  return (
    <header className="sticky top-0 z-40 bg-amber-100/90 dark:bg-slate-900/95 backdrop-blur-md border-b-4 border-slate-900 dark:border-amber-500/40 shadow-[0_4px_0px_rgba(0,0,0,0.15)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2">
          {/* TACHTOU Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 border-2 border-slate-900 shadow-[3px_3px_0px_#000] flex items-center justify-center text-slate-950">
              <Swords className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-pixel text-lg sm:text-xl font-extrabold text-slate-950 dark:text-amber-400 tracking-wider">
                  TACHTOU
                </h1>
                <span className="text-[10px] font-pixel px-1.5 py-0.5 bg-amber-300 dark:bg-amber-950 dark:text-amber-300 border border-slate-900 rounded-md">
                  RPG
                </span>
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 hidden sm:block">
                Vos quêtes quotidiennes & aventures
              </p>
            </div>
          </div>

          {/* Hero Profile Status Bar Button (Opens Profile Modal) */}
          <button
            onClick={onOpenProfile}
            title="Modifier mon profil de héros (Nom, classe, son)"
            className="flex items-center gap-2.5 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_#000] hover:bg-amber-50 dark:hover:bg-slate-700 transition-all text-left"
          >
            <div className="text-2xl p-0.5 bg-amber-100 dark:bg-slate-900 rounded-xl border border-slate-900">
              {userProfile.avatar}
            </div>
            <div className="hidden min-[480px]:block">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-900 dark:text-amber-300 truncate max-w-[110px]">
                  {userProfile.heroName || 'Mon Nom'}
                </span>
                <span className="text-[9px] font-pixel font-bold px-1.5 py-0.2 bg-indigo-600 text-white rounded">
                  Niv.{userProfile.level}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-600 dark:text-slate-400">
                <span className="font-semibold truncate max-w-[100px]">
                  {userProfile.title}
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5">
                  <Coins className="w-3 h-3 text-amber-500" /> {userProfile.goldCoins}
                </span>
              </div>
            </div>
          </button>

          {/* Nav Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-amber-200/60 dark:bg-slate-800 p-1.5 rounded-2xl border-2 border-slate-900">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-[2px_2px_0px_#000]'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Calendar Export */}
            <button
              onClick={onOpenCalendarExport}
              title="Exporter vers Google Calendar"
              className="p-2 bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#000] hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden xl:inline">Google Calendar</span>
            </button>

            {/* Notifications */}
            <button
              onClick={onOpenNotifications}
              title="Rappels de quêtes"
              className="relative p-2 bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#000] hover:bg-amber-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Bell className="w-4 h-4 text-slate-800 dark:text-slate-200" />
              {notificationCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 border border-slate-900 text-[10px] font-pixel font-bold text-white">
                  {notificationCount}
                </span>
              )}
              {hasOverdueTasks && notificationCount === 0 && (
                <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-rose-500 border border-slate-900 animate-pulse" />
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Mode jour' : 'Mode nuit'}
              className="p-2 bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#000] hover:bg-amber-50 dark:hover:bg-slate-700 transition-colors"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-700" />
              )}
            </button>

            {/* Quick New Quest Button */}
            <button
              onClick={onOpenNewTaskModal}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-pixel text-[11px] font-bold rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">NOUVELLE QUÊTE</span>
              <span className="sm:hidden">QUÊTE</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t-2 border-slate-900/10 dark:border-slate-800 font-bold text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-pixel text-[10px] border border-slate-900'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

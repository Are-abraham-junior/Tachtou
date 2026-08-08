import React, { useState, useEffect } from 'react';
import {
  requestNotificationPermission,
  sendBrowserNotification,
  playReminderChime,
} from '../utils/notificationUtils';
import { loadEmailLogs, saveEmailLog, loadUserProfile } from '../utils/storage';
import { dispatchEmailNotification } from '../utils/emailUtils';
import { EmailLog, UserProfile } from '../types';
import {
  X,
  Bell,
  BellRing,
  Volume2,
  Mail,
  Send,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  AtSign,
} from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recentReminders: { id: string; title: string; time: string }[];
  onOpenProfile?: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  recentReminders,
  onOpenProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'browser' | 'email'>('browser');
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if ('Notification' in window) {
        setPermission(Notification.permission);
      }
      setEmailLogs(loadEmailLogs());
      setUserProfile(loadUserProfile());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEnableNotifications = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
  };

  const handleTestNotification = () => {
    playReminderChime();
    sendBrowserNotification(
      '⏰ Test de Rappel',
      'Votre système de notification de tâches fonctionne parfaitement !'
    );
  };

  const handleSendTestEmail = async () => {
    const targetEmail = userProfile?.userEmail || 'hero@tachtou.app';
    const salutation = userProfile?.title
      ? `${userProfile.title} ${userProfile.heroName}`
      : userProfile?.heroName || 'Junior';

    setTestSent(false);

    await dispatchEmailNotification({
      toEmail: targetEmail,
      subject: `📧 Test de Rappel E-mail - ${salutation}`,
      body: `Bonjour ${salutation},\n\nCeci est une notification de rappel de test envoyée par TACHTOU à l'adresse ${targetEmail}.\nVos notifications de quêtes par e-mail sont actives !`,
      type: 'test',
      profile: userProfile || undefined,
    });

    setEmailLogs(loadEmailLogs());
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-2 border-slate-900 dark:border-slate-800 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Centre de Notifications
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('browser')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'browser'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Navigateur</span>
          </button>

          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'email'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Notifications E-mail</span>
            {userProfile?.emailNotificationsEnabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>
        </div>

        {/* TAB 1: BROWSER NOTIFICATIONS */}
        {activeTab === 'browser' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Statut du navigateur :
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    permission === 'granted'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {permission === 'granted' ? 'Activé' : 'Désactivé'}
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {permission === 'granted'
                  ? 'Les rappels s’afficheront directement sur votre écran au moment configuré.'
                  : 'Autorisez le navigateur à vous envoyer des alertes pour ne manquer aucune échéance.'}
              </p>

              {permission !== 'granted' && (
                <button
                  onClick={handleEnableNotifications}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Bell className="w-4 h-4" />
                  <span>Activer les notifications du navigateur</span>
                </button>
              )}

              <button
                onClick={handleTestNotification}
                className="w-full py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Volume2 className="w-4 h-4 text-indigo-500" />
                <span>Tester le rappel (Son + Alerte)</span>
              </button>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Historique Récent des Rappels Nav ({recentReminders.length})
              </h4>

              {recentReminders.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  Aucun rappel déclenché récemment.
                </div>
              ) : (
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {recentReminders.map((rem) => (
                    <div
                      key={rem.id}
                      className="p-2.5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-lg border border-indigo-100 dark:border-indigo-900/50 text-xs flex items-center justify-between"
                    >
                      <span className="font-medium text-indigo-950 dark:text-indigo-200 truncate">
                        {rem.title}
                      </span>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 whitespace-nowrap ml-2">
                        {rem.time}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: EMAIL NOTIFICATIONS */}
        {activeTab === 'email' && (
          <div className="space-y-4 animate-fade-in">
            {/* Email Config Status */}
            <div className="p-4 rounded-xl border bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-amber-200 flex items-center gap-1.5">
                  <AtSign className="w-4 h-4 text-amber-500" /> E-mail enregistré :
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    userProfile?.emailNotificationsEnabled
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {userProfile?.emailNotificationsEnabled ? 'Actif' : 'Désactivé'}
                </span>
              </div>

              <div className="text-xs font-mono font-bold text-slate-900 dark:text-amber-300 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-amber-300/60 dark:border-amber-800">
                {userProfile?.userEmail || 'hero@tachtou.app'}
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleSendTestEmail}
                  className={`py-1.5 px-3 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 ${
                    testSent
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-400 hover:bg-amber-500 text-slate-950'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{testSent ? 'E-mail envoyé !' : 'Tester l\'envoi par e-mail'}</span>
                </button>

                {onOpenProfile && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenProfile();
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                  >
                    Modifier dans le Profil
                  </button>
                )}
              </div>
            </div>

            {/* Email Sent History */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> Historique des E-mails envoyés ({emailLogs.length})
              </h4>

              {emailLogs.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  Aucun e-mail envoyé pour le moment.
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {emailLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1 shadow-sm"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-amber-300">
                        <span className="truncate pr-2">{log.subject}</span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {log.sentAt}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 whitespace-pre-wrap line-clamp-2">
                        {log.body}
                      </p>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <span>À : {log.toEmail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white text-xs font-semibold rounded-xl"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};


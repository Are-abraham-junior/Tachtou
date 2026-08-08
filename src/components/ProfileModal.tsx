import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { playLevelUpSound, speakCongratulations } from '../utils/audioUtils';
import { saveEmailLog } from '../utils/storage';
import { dispatchEmailNotification } from '../utils/emailUtils';
import {
  X,
  UserCheck,
  Shield,
  Coins,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Sparkles,
  Trophy,
  Mail,
  Send,
  Check,
  AtSign,
  Bell,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile?: (updated: UserProfile) => void;
  onSaveProfile?: (updated: UserProfile) => void;
}

const AVATAR_OPTIONS = ['⚔️', '🧙‍♂️', '🥷', '🛡️', '🐉', '👑', '🦄', '⚡', '🏹', '🦅'];

const HERO_TITLES = [
  'Mage',
  'Chevalier',
  'Guerrier',
  'Ninja',
  'Paladin',
  'Aventurier',
  'Mage de la Productivité',
  'Chevalier de la Tâche',
  'Ninja du Temps',
  'Paladin du Code',
  'Maître du TACHTOU',
  'Légende vivante',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onSaveProfile,
}) => {
  const [heroName, setHeroName] = useState(profile.heroName);
  const [title, setTitle] = useState(profile.title);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(profile.soundEffectsEnabled);
  const [voiceVoiceEnabled, setVoiceVoiceEnabled] = useState(profile.voiceVoiceEnabled);

  // Email notifications state
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(
    profile.emailNotificationsEnabled ?? true
  );
  const [userEmail, setUserEmail] = useState(profile.userEmail || '');
  const [notifyOnTaskDueDate, setNotifyOnTaskDueDate] = useState(
    profile.notifyOnTaskDueDate ?? true
  );
  const [notifyOnQuestCompleted, setNotifyOnQuestCompleted] = useState(
    profile.notifyOnQuestCompleted ?? true
  );

  // Gmail OAuth State
  const [gmailConnected, setGmailConnected] = useState(profile.gmailConnected ?? false);
  const [gmailAccessToken, setGmailAccessToken] = useState(profile.gmailAccessToken || '');
  const [gmailRefreshToken, setGmailRefreshToken] = useState(profile.gmailRefreshToken || '');
  const [gmailUserEmail, setGmailUserEmail] = useState(profile.gmailUserEmail || profile.userEmail || '');
  const [oauthConnecting, setOauthConnecting] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [testEmailSent, setTestEmailSent] = useState(false);

  // Listen for OAuth postMessage from popup window
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GMAIL_AUTH_SUCCESS') {
        const { email, accessToken, refreshToken } = event.data;
        setGmailConnected(true);
        if (email) {
          setGmailUserEmail(email);
          setUserEmail(email);
        }
        if (accessToken) setGmailAccessToken(accessToken);
        if (refreshToken) setGmailRefreshToken(refreshToken);
        setOauthConnecting(false);
        setOauthError(null);

        // Auto-save connected profile
        const updatedProfile: UserProfile = {
          ...profile,
          gmailConnected: true,
          gmailAccessToken: accessToken || profile.gmailAccessToken,
          gmailRefreshToken: refreshToken || profile.gmailRefreshToken,
          gmailUserEmail: email || profile.gmailUserEmail || profile.userEmail,
          userEmail: email || userEmail || profile.userEmail,
          emailNotificationsEnabled: true,
        };
        if (onUpdateProfile) onUpdateProfile(updatedProfile);
        else if (onSaveProfile) onSaveProfile(updatedProfile);
      } else if (event.data?.type === 'GMAIL_AUTH_ERROR') {
        setOauthConnecting(false);
        setOauthError(event.data.error || 'Connexion OAuth échouée.');
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [profile, onUpdateProfile, onSaveProfile, userEmail]);

  if (!isOpen) return null;

  const handleConnectGmail = async () => {
    setOauthConnecting(true);
    setOauthError(null);

    try {
      const res = await fetch('/api/auth/google/url');
      const data = await res.json();

      if (!res.ok || !data.url) {
        if (data.error === 'MISSING_CLIENT_ID') {
          // If no client_id set on server, prompt or open auth URL with fallback
          throw new Error('Google OAuth non initialisé sur le serveur.');
        }
        throw new Error(data.message || 'Impossible de générer l\'URL Google OAuth.');
      }

      // Open OAuth provider's URL directly in popup
      const popup = window.open(data.url, 'gmail_oauth_popup', 'width=600,height=700');
      if (!popup) {
        setOauthConnecting(false);
        setOauthError('Veuillez autoriser les fenêtres surgissantes (popups) pour connecter votre compte Gmail.');
      }
    } catch (err: any) {
      console.error('Gmail OAuth connection error:', err);
      setOauthConnecting(false);
      setOauthError(err?.message || 'Erreur lors de la connexion à Gmail.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: UserProfile = {
      ...profile,
      heroName: heroName.trim() || 'Junior',
      title,
      avatar,
      soundEffectsEnabled,
      voiceVoiceEnabled,
      emailNotificationsEnabled,
      userEmail: userEmail.trim(),
      notifyOnTaskDueDate,
      notifyOnQuestCompleted,
      gmailConnected,
      gmailAccessToken,
      gmailRefreshToken,
      gmailUserEmail: gmailUserEmail.trim() || userEmail.trim(),
    };

    if (onUpdateProfile) {
      onUpdateProfile(updatedProfile);
    } else if (onSaveProfile) {
      onSaveProfile(updatedProfile);
    }
    onClose();
  };

  const handleTestVoice = () => {
    speakCongratulations(heroName || 'Junior', title || 'Mage', voiceVoiceEnabled);
  };

  const handleSendTestEmail = async () => {
    const targetEmail = userEmail.trim() || gmailUserEmail.trim() || 'hero@tachtou.app';
    const salutation = title ? `${title} ${heroName || 'Junior'}` : heroName || 'Junior';

    setTestEmailSent(false);

    await dispatchEmailNotification({
      toEmail: targetEmail,
      subject: `⚔️ Test de Notification - Félicitations ${salutation} !`,
      body: `Bonjour ${salutation},\n\nVotre compte Gmail est connecté à TACHTOU (${targetEmail}).\nVous recevrez désormais vos rappels d'échéance et vos confirmations de quêtes accomplies par e-mail !\n\nÀ l'aventure !\n- L'équipe TACHTOU`,
      type: 'test',
      profile: {
        ...profile,
        userEmail: targetEmail,
        gmailConnected,
        gmailAccessToken,
        gmailRefreshToken,
      },
    });

    setTestEmailSent(true);
    setTimeout(() => setTestEmailSent(false), 4000);
  };

  const xpPercentage = Math.min(
    100,
    Math.round((profile.xp / profile.xpToNextLevel) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-amber-50 dark:bg-slate-900 rounded-3xl border-4 border-slate-900 dark:border-amber-500 shadow-[8px_8px_0px_#000] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-amber-400 dark:bg-slate-800 border-b-4 border-slate-900 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-1 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-900">
              {avatar}
            </span>
            <div>
              <h2 className="font-pixel text-sm font-bold text-slate-900 dark:text-amber-400">
                PROFIL DU HÉROS
              </h2>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-300">
                Personnalisez votre nom et vos effets TACHTOU
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-900 text-white hover:bg-rose-600 rounded-xl transition-colors border-2 border-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Level & XP Banner */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_#000] space-y-2">
            <div className="flex items-center justify-between font-pixel text-xs">
              <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Trophy className="w-4 h-4 text-amber-500" /> NIVEAU {profile.level}
              </span>
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Coins className="w-4 h-4 text-amber-500" /> {profile.goldCoins} OR
              </span>
            </div>

            {/* XP Bar */}
            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                <span>Expérience (XP)</span>
                <span>
                  {profile.xp} / {profile.xpToNextLevel} XP ({xpPercentage}%)
                </span>
              </div>
              <div className="w-full h-3.5 bg-slate-200 dark:bg-slate-700 rounded-full border-2 border-slate-900 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Hero Name */}
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
              Nom de votre Héros / Profil <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="ex: Chevalier Alex, Arthur, Mage..."
              value={heroName}
              onChange={(e) => setHeroName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-900 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-[3px_3px_0px_#000]"
            />
          </div>

          {/* Title Picker */}
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
              Titre / Classe du Héros
            </label>
            <select
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-900 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-[3px_3px_0px_#000]"
            >
              {HERO_TITLES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Avatar Choice */}
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-2">
              Icône d'Avatar
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={`text-2xl p-2 rounded-xl border-2 transition-transform ${
                    avatar === emoji
                      ? 'bg-amber-400 border-slate-900 scale-110 shadow-[3px_3px_0px_#000]'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 opacity-80 hover:opacity-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles: Voice & Audio FX */}
          <div className="pt-2 border-t-2 border-slate-900/10 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-pixel font-bold text-slate-900 dark:text-amber-400 uppercase">
              OPTIONS SONORES TACHTOU
            </h4>

            {/* Voice synth toggle */}
            <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#000]">
              <div className="flex items-center gap-2.5">
                <Mic className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    Annonce Vocale : "Félicitations [Nom]"
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Déclamée lors de l'accomplissement d'une tâche
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVoiceVoiceEnabled(!voiceVoiceEnabled)}
                className={`px-3 py-1 rounded-lg text-xs font-pixel border-2 border-slate-900 transition-colors ${
                  voiceVoiceEnabled
                    ? 'bg-emerald-400 text-slate-950 font-bold'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}
              >
                {voiceVoiceEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Test Voice button */}
            <button
              type="button"
              onClick={handleTestVoice}
              className="w-full py-2 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-950/80 dark:hover:bg-indigo-900 text-indigo-900 dark:text-indigo-200 font-bold text-xs rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#000] flex items-center justify-center gap-2 transition-all"
            >
              <Mic className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Tester la voix ("Félicitations {title ? `${title} ` : ''}{heroName || 'Junior'} !")</span>
            </button>
          </div>

          {/* Email Notifications Section */}
          <div className="pt-2 border-t-2 border-slate-900/10 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-pixel font-bold text-slate-900 dark:text-amber-400 uppercase flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-amber-500" /> NOTIFICATIONS PAR E-MAIL
              </h4>
              <button
                type="button"
                onClick={() => setEmailNotificationsEnabled(!emailNotificationsEnabled)}
                className={`px-3 py-1 rounded-lg text-xs font-pixel border-2 border-slate-900 transition-colors ${
                  emailNotificationsEnabled
                    ? 'bg-emerald-400 text-slate-950 font-bold'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}
              >
                {emailNotificationsEnabled ? 'ACTIVÉ' : 'DÉSACTIVÉ'}
              </button>
            </div>

            {emailNotificationsEnabled && (
              <div className="space-y-3 animate-fade-in bg-white dark:bg-slate-800 p-4 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_#000]">
                {/* Gmail Connection Status Card */}
                <div className="p-3 bg-gradient-to-r from-red-500/10 via-amber-500/10 to-indigo-500/10 dark:from-slate-900 dark:to-slate-900 rounded-xl border-2 border-slate-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-red-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                        M
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          Connexion Gmail (Google Workspace)
                          {gmailConnected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500 text-white" />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {gmailConnected
                            ? `Connecté à ${gmailUserEmail || userEmail}`
                            : 'Connectez votre compte Gmail pour envoyer vos rappels en direct'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleConnectGmail}
                      disabled={oauthConnecting}
                      className={`px-3 py-1.5 font-bold text-xs rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#000] transition-all flex items-center gap-1.5 ${
                        gmailConnected
                          ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                    >
                      {oauthConnecting ? (
                        <span>Connexion...</span>
                      ) : gmailConnected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Reconnecter Gmail</span>
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Connecter Gmail</span>
                        </>
                      )}
                    </button>
                  </div>

                  {oauthError && (
                    <div className="text-[11px] text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/50 p-2 rounded-lg border border-red-300 dark:border-red-800 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{oauthError}</span>
                    </div>
                  )}
                </div>

                {/* Email Address Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1">
                    <AtSign className="w-3.5 h-3.5 text-indigo-500" /> Adresse E-mail de réception
                  </label>
                  <input
                    type="email"
                    required={emailNotificationsEnabled}
                    placeholder="votre-email@domaine.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 bg-amber-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                {/* Sub-toggles */}
                <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <label className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <span>⏰ Rappels d'échéances de quêtes</span>
                    <input
                      type="checkbox"
                      checked={notifyOnTaskDueDate}
                      onChange={(e) => setNotifyOnTaskDueDate(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-amber-500"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <span>⚔️ Confirmation de quête accomplie</span>
                    <input
                      type="checkbox"
                      checked={notifyOnQuestCompleted}
                      onChange={(e) => setNotifyOnQuestCompleted(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-amber-500"
                    />
                  </label>
                </div>

                {/* Test Email Button */}
                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  className={`w-full py-2 font-bold text-xs rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#000] flex items-center justify-center gap-2 transition-all ${
                    testEmailSent
                      ? 'bg-emerald-400 text-slate-950'
                      : 'bg-amber-300 hover:bg-amber-400 dark:bg-amber-500/80 dark:hover:bg-amber-500 text-slate-950'
                  }`}
                >
                  {testEmailSent ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>E-mail de test envoyé à {userEmail || 'hero@tachtou.app'} !</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-slate-950" />
                      <span>Envoyer un e-mail de test</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t-2 border-slate-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-pixel text-xs font-bold rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
            >
              ENREGISTRER HÉROS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

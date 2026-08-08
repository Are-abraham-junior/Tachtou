import { UserProfile } from '../types';
import { saveEmailLog } from './storage';

export interface SendEmailOptions {
  toEmail: string;
  subject: string;
  body: string;
  type: 'reminder' | 'completion' | 'test' | 'summary';
  profile?: UserProfile;
}

/**
 * Sends an email notification via the Express Gmail API endpoint or logs it locally.
 */
export async function dispatchEmailNotification(options: SendEmailOptions) {
  const { toEmail, subject, body, type, profile } = options;

  const targetEmail = toEmail?.trim() || profile?.userEmail || 'hero@tachtou.app';

  // Check if Gmail OAuth access token is available
  const accessToken = profile?.gmailAccessToken;
  const refreshToken = profile?.gmailRefreshToken;

  if (accessToken || refreshToken) {
    try {
      const response = await fetch('/api/gmail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: targetEmail,
          subject,
          body,
          accessToken,
          refreshToken,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        saveEmailLog({
          toEmail: targetEmail,
          subject,
          body: `${body}\n\n[Envoyé via l'API Gmail avec succès - ID: ${data.messageId}]`,
          type,
          status: 'sent_via_gmail',
        });
        return { success: true, viaGmail: true, messageId: data.messageId };
      } else {
        console.warn('Gmail API endpoint returned non-ok status:', data);
        saveEmailLog({
          toEmail: targetEmail,
          subject,
          body: `${body}\n\n[Erreur Gmail API: ${data.error || 'Accès non autorisé'}]`,
          type,
          status: 'failed',
        });
        return { success: false, viaGmail: false, error: data.error };
      }
    } catch (err: any) {
      console.error('Failed to communicate with /api/gmail/send:', err);
    }
  }

  // Fallback: save log locally in email history
  saveEmailLog({
    toEmail: targetEmail,
    subject,
    body,
    type,
    status: 'logged',
  });

  return { success: true, viaGmail: false };
}

import { Task } from '../types';

/**
 * Audio synthesis for gentle reminder chime using Web Audio API
 */
export function playReminderChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    // Play pleasant chord (E5 & B5)
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
    osc2.frequency.setValueAtTime(987.77, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime + 0.1);
    osc1.stop(ctx.currentTime + 0.8);
    osc2.stop(ctx.currentTime + 0.8);
  } catch (e) {
    console.warn('Could not play audio chime:', e);
  }
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported in this browser.');
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    console.error('Error requesting notification permission:', e);
    return 'denied';
  }
}

/**
 * Send a browser desktop notification
 */
export function sendBrowserNotification(title: string, body: string, icon?: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        tag: 'task-reminder',
      });
    } catch (e) {
      console.warn('Could not send browser notification:', e);
    }
  }
}

/**
 * Checks all tasks to see if any reminder time is reached
 */
export function checkPendingReminders(
  tasks: Task[],
  onReminderTriggered: (task: Task, minutesBefore: number) => void
): string[] {
  const triggeredTaskIds: string[] = [];
  const now = new Date();

  tasks.forEach((task) => {
    if (task.status === 'completed' || task.reminderSent || !task.reminderTime || !task.dueDate) {
      return;
    }

    // Parse task due date & time
    const [year, month, day] = task.dueDate.split('-').map(Number);
    let hours = 9;
    let minutes = 0;

    if (task.dueTime) {
      const [h, m] = task.dueTime.split(':').map(Number);
      hours = h;
      minutes = m;
    }

    const taskTime = new Date(year, month - 1, day, hours, minutes);
    const reminderMinutesBefore = parseInt(task.reminderTime, 10) || 0;
    const reminderTimeMs = taskTime.getTime() - reminderMinutesBefore * 60 * 1000;

    // Check if current time is equal to or passed reminder time (within 5 minutes window)
    const diffMs = now.getTime() - reminderTimeMs;

    if (diffMs >= 0 && diffMs <= 5 * 60 * 1000) {
      triggeredTaskIds.push(task.id);
      playReminderChime();

      let reminderText = `C'est l'heure : "${task.title}" !`;
      if (reminderMinutesBefore > 0) {
        reminderText = `Rappel (${reminderMinutesBefore} min) : "${task.title}" approche !`;
      }

      sendBrowserNotification('⏰ Rappel de Tâche', reminderText);
      onReminderTriggered(task, reminderMinutesBefore);
    }
  });

  return triggeredTaskIds;
}

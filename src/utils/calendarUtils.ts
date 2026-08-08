import { Task, Project } from '../types';

/**
 * Formats a Date object or YYYY-MM-DD + HH:mm string into Google Calendar ISO format (YYYYMMDDTHHmmSS)
 */
function formatToGCalDate(dateStr: string, timeStr?: string, durationMinutes: number = 60): { start: string; end: string } {
  const [year, month, day] = dateStr.split('-').map(Number);
  
  if (!timeStr) {
    // All day event: YYYYMMDD
    const startStr = `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`;
    const nextDay = new Date(year, month - 1, day + 1);
    const endStr = `${nextDay.getFullYear()}${String(nextDay.getMonth() + 1).padStart(2, '0')}${String(nextDay.getDate()).padStart(2, '0')}`;
    return { start: startStr, end: `${endStr}` };
  }

  const [hours, minutes] = timeStr.split(':').map(Number);
  const startDate = new Date(year, month - 1, day, hours, minutes);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  const formatDateTime = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dt = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}${m}${dt}T${h}${min}00`;
  };

  return {
    start: formatDateTime(startDate),
    end: formatDateTime(endDate),
  };
}

/**
 * Creates a direct 1-click Google Calendar Event Creation Web Link
 */
export function generateGoogleCalendarUrl(task: Task, project?: Project): string {
  const { start, end } = formatToGCalDate(
    task.dueDate,
    task.dueTime,
    task.estimatedMinutes || 60
  );

  let details = task.description || '';
  if (project) {
    details += `\n\n📌 Projet: ${project.name}`;
  }
  if (task.priority) {
    details += `\n⚡ Priorité: ${task.priority.toUpperCase()}`;
  }
  if (task.subtasks && task.subtasks.length > 0) {
    details += `\n\nSous-tâches:\n` + task.subtasks.map(s => `- [${s.completed ? 'x' : ' '}] ${s.title}`).join('\n');
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: task.title,
    details: details,
    dates: `${start}/${end}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates and downloads an .ics file containing one or multiple tasks
 * which can be imported straight into Google Calendar or Apple Calendar.
 */
export function exportTasksToICS(tasks: Task[], projects: Project[], filename: string = 'mes-taches-agenda.ics') {
  const projectMap = new Map(projects.map(p => [p.id, p]));
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Gestionnaire de Taches Quotidiennes//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Tâches Quotidiennes',
  ];

  tasks.forEach(task => {
    const project = projectMap.get(task.projectId);
    const { start, end } = formatToGCalDate(task.dueDate, task.dueTime, task.estimatedMinutes || 60);

    let description = (task.description || '').replace(/\n/g, '\\n');
    if (project) description += `\\n\\nProjet: ${project.name}`;

    icsContent.push('BEGIN:VEVENT');
    icsContent.push(`UID:task-${task.id}@taskapp.local`);
    icsContent.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
    if (task.dueTime) {
      icsContent.push(`DTSTART:${start}`);
      icsContent.push(`DTEND:${end}`);
    } else {
      icsContent.push(`DTSTART;VALUE=DATE:${start}`);
      icsContent.push(`DTEND;VALUE=DATE:${end}`);
    }
    icsContent.push(`SUMMARY:${task.title.replace(/[,;]/g, '\\$&')}`);
    if (description) icsContent.push(`DESCRIPTION:${description.replace(/[,;]/g, '\\$&')}`);
    icsContent.push('STATUS:CONFIRMED');
    icsContent.push('END:VEVENT');
  });

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

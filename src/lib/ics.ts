export interface ICSParams {
  title: string;
  date: string;       // ISO date "2026-04-15"
  time: string;       // "10:00"
  location: string;
  description: string;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function toICSDateUTC(dateStr: string, timeStr: string): string {
  // Parse local Iraq time (UTC+3) and convert to UTC
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  const localDate = new Date(year, month - 1, day, hours, minutes, 0);
  // Subtract 3 hours for Iraq (UTC+3) to get UTC
  const utcDate = new Date(localDate.getTime() - 3 * 60 * 60 * 1000);

  const y = utcDate.getUTCFullYear();
  const m = pad(utcDate.getUTCMonth() + 1);
  const d = pad(utcDate.getUTCDate());
  const h = pad(utcDate.getUTCHours());
  const min = pad(utcDate.getUTCMinutes());
  return `${y}${m}${d}T${h}${min}00Z`;
}

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function generateICS(params: ICSParams): string {
  const dtStart = toICSDateUTC(params.date, params.time);

  // Create 1-hour event: parse start time and add 1 hour
  const [hours, minutes] = params.time.split(':').map(Number);
  const endHours = hours + 1;
  const endTime = `${pad(endHours)}:${pad(minutes)}`;
  const dtEnd = toICSDateUTC(params.date, endTime);

  const now = new Date();
  const dtstamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const uid = `${dtstamp}-${Math.random().toString(36).substring(2, 10)}@manzel.iq`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Manzel//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICSText(params.title)}`,
    `LOCATION:${escapeICSText(params.location)}`,
    `DESCRIPTION:${escapeICSText(params.description)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.join('\r\n');
}

export function downloadICS(icsContent: string, filename: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

import type { CalendarEvent } from './useCalendar'

/**
 * Formats a Date / string to iCal UTC/date string (YYYYMMDDTHHMMSSZ or YYYYMMDD)
 */
function formatICalDate(dateStr: string, timeStr?: string): string {
  const cleanDate = dateStr.replace(/-/g, '')
  if (!timeStr) {
    return cleanDate
  }
  const cleanTime = timeStr.replace(/:/g, '') + '00'
  return `${cleanDate}T${cleanTime}`
}

/**
 * Generates and downloads an .ics file from calendar events
 */
export function exportEventsToICal(events: CalendarEvent[], filename = 'academic_schedule.ics') {
  if (events.length === 0) {
    alert('No events available to export.')
    return
  }

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Panjeree LMS//Academic Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Academic & Exam Schedule',
    'X-WR-TIMEZONE:Asia/Dhaka',
  ]

  const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  for (const ev of events) {
    const isAllDay = !ev.startTime
    const dtStart = formatICalDate(ev.date, ev.startTime)
    const dtEnd = ev.endDate
      ? formatICalDate(ev.endDate, ev.endTime)
      : ev.endTime
      ? formatICalDate(ev.date, ev.endTime)
      : dtStart

    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${ev.id}@lms.panjeree.com`)
    lines.push(`DTSTAMP:${nowStamp}`)

    if (isAllDay) {
      lines.push(`DTSTART;VALUE=DATE:${dtStart}`)
      lines.push(`DTEND;VALUE=DATE:${dtEnd}`)
    } else {
      lines.push(`DTSTART:${dtStart}`)
      lines.push(`DTEND:${dtEnd}`)
    }

    lines.push(`SUMMARY:${ev.title.replace(/,/g, '\\,')}`)
    if (ev.description) {
      lines.push(`DESCRIPTION:${ev.description.replace(/\n/g, '\\n').replace(/,/g, '\\,')}`)
    }
    if (ev.room) {
      lines.push(`LOCATION:${ev.room.replace(/,/g, '\\,')}`)
    }
    lines.push(`CATEGORIES:${ev.type}`)
    lines.push('STATUS:CONFIRMED')
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')

  const icsContent = lines.join('\r\n')
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

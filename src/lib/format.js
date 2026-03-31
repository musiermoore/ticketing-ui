function coerceDate(value) {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  if (typeof value === 'number') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }

  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()

  // Handles Laravel-style "2026-02-27 10:30:00" and standard ISO strings.
  const match = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/,
  )

  if (match) {
    const [, year, month, day, hour = '00', minute = '00', second = '00'] = match
    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
    )

    return Number.isNaN(date.getTime()) ? null : date
  }

  const fallback = new Date(trimmed)
  return Number.isNaN(fallback.getTime()) ? null : fallback
}

export function formatDateTime(value, locale, options = {}) {
  if (!value) {
    return null
  }

  const date = coerceDate(value)

  if (!date) {
    return null
  }

  const hasExplicitParts = [
    'weekday',
    'year',
    'month',
    'day',
    'hour',
    'minute',
    'second',
    'timeZoneName',
  ].some((key) => options[key] != null)

  const formatOptions = hasExplicitParts
    ? options
    : {
        dateStyle: 'medium',
        timeStyle: 'short',
        ...options,
      }

  return new Intl.DateTimeFormat(locale, formatOptions).format(date)
}

export function buildSessionDateTime(session) {
  if (!session) {
    return null
  }

  if (session.date_time) {
    return session.date_time
  }

  if (session.date && session.time) {
    return `${session.date}T${session.time}`
  }

  if (session.date) {
    return session.date
  }

  return session.time || null
}

export function formatSessionDateTime(session, locale, options = {}) {
  return formatDateTime(buildSessionDateTime(session), locale, options)
}

export function buildAddress(address) {
  if (!address) {
    return ''
  }

  return [address.country, address.region, address.city, address.street, address.apartment]
    .filter(Boolean)
    .join(', ')
}

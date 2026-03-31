const DEFAULT_AUTH_BASE_URL = 'http://localhost:8001/api'
const DEFAULT_API_BASE_URL = 'http://localhost:8002/api'
const DEFAULT_BOOKING_BASE_URL = 'http://localhost:8003'

function trimTrailingSlash(value) {
  return value?.replace(/\/+$/, '')
}

function withApiSuffix(value, fallback) {
  const normalized = trimTrailingSlash(value || fallback)
  return normalized.endsWith('/api') ? normalized : `${normalized}/api`
}

export const AUTH_BASE_URL = withApiSuffix(
  import.meta.env.VITE_AUTH_BASE_URL || import.meta.env.VITE_AUTH_URL,
  DEFAULT_AUTH_BASE_URL,
)

export const API_BASE_URL = withApiSuffix(
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL,
  DEFAULT_API_BASE_URL,
)

export const BOOKING_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_BOOKING_SERVICE_BASE_URL || import.meta.env.VITE_BOOKING_SERVICE_URL,
) || DEFAULT_BOOKING_BASE_URL

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message =
      typeof payload === 'string'
        ? payload
        : payload?.message || payload?.error || payload?.errors?.email?.[0] || 'Request failed'

    throw new Error(message)
  }

  return payload
}

async function request(url, { token, method = 'GET', body } = {}) {
  const headers = {}

  if (body) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  return parseResponse(response)
}

export function login(payload) {
  return request(`${AUTH_BASE_URL}/login`, {
    method: 'POST',
    body: payload,
  })
}

export function register(payload) {
  return request(`${AUTH_BASE_URL}/register`, {
    method: 'POST',
    body: payload,
  })
}

export function fetchMe(token) {
  return request(`${AUTH_BASE_URL}/me`, { token })
}

export function fetchApiIdentity(token) {
  return request(`${API_BASE_URL}/`, { token })
}

export async function fetchEvents(token, page = 1) {
  const payload = await request(`${API_BASE_URL}/events?page=${page}`, { token })
  const events = payload?.events

  if (Array.isArray(events)) {
    const currentPage = payload?.current_page || page
    const hasMore = Boolean(payload?.has_more)
    const nextPage = hasMore ? payload?.next_page || currentPage + 1 : null

    return {
      data: events,
      currentPage,
      lastPage: payload?.last_page || currentPage,
      total: payload?.total || events.length,
      nextPage,
      hasMore,
    }
  }

  const data = events?.data || payload?.data || []
  const currentPage = events?.current_page || payload?.current_page || page
  const lastPage = events?.last_page || payload?.last_page || currentPage
  const total = events?.total || payload?.total || data.length
  const hasMore =
    payload?.has_more != null ? Boolean(payload.has_more) : currentPage < lastPage
  const nextPage =
    payload?.next_page != null
      ? payload.next_page
      : hasMore
        ? currentPage + 1
        : null

  return {
    data,
    currentPage,
    lastPage,
    total,
    nextPage,
    hasMore,
  }
}

export async function fetchEvent(token, eventId) {
  const payload = await request(`${API_BASE_URL}/events/${eventId}`, { token })
  return payload?.data || payload
}

function normalizeBooking(booking) {
  return {
    id: booking.id ?? booking.ID,
    userId: booking.user_id ?? booking.UserID,
    eventId: booking.event_id ?? booking.EventID,
    createdAt: booking.created_at ?? booking.CreatedAt,
  }
}

export async function fetchBookings(token, page = 1) {
  const payload = await request(`${BOOKING_BASE_URL}/tickets?page=${page}`, { token })
  return Array.isArray(payload) ? payload.map(normalizeBooking) : []
}

export async function createBooking(token, eventId) {
  const payload = await request(`${BOOKING_BASE_URL}/tickets/book`, {
    token,
    method: 'POST',
    body: { event_id: Number(eventId) },
  })

  return normalizeBooking(payload)
}

export function cancelBooking(token, bookingId) {
  return request(`${BOOKING_BASE_URL}/tickets/${bookingId}/unbook`, {
    token,
    method: 'DELETE',
  })
}

export function fetchBookingHealth() {
  return request(`${BOOKING_BASE_URL}/health`)
}

export function fetchBookingAuthCheck(token) {
  return request(`${BOOKING_BASE_URL}/auth/check`, { token })
}

const FLASH_KEY = 'ticketing-flash'

export function setFlashMessage(payload) {
  if (typeof window === 'undefined') {
    return
  }

  sessionStorage.setItem(FLASH_KEY, JSON.stringify(payload))
}

export function consumeFlashMessage() {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = sessionStorage.getItem(FLASH_KEY)

  if (!raw) {
    return null
  }

  sessionStorage.removeItem(FLASH_KEY)

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

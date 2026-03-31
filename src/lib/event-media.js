const DEFAULT_EVENT_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 720'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23dd7a3f'/%3E%3Cstop offset='100%25' stop-color='%231b2430'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='720' fill='url(%23bg)'/%3E%3Ccircle cx='920' cy='180' r='140' fill='rgba(255,255,255,0.14)'/%3E%3Ccircle cx='240' cy='560' r='220' fill='rgba(255,255,255,0.08)'/%3E%3Cpath d='M160 520C290 360 425 280 568 280c137 0 252 56 346 170 42 52 77 109 126 167H160V520z' fill='rgba(255,255,255,0.16)'/%3E%3Crect x='180' y='150' width='238' height='238' rx='40' fill='rgba(255,255,255,0.18)'/%3E%3Cpath d='M260 335V205l112 65-112 65z' fill='%23fff7ef'/%3E%3Ctext x='180' y='475' fill='%23fff7ef' font-family='Arial,sans-serif' font-size='34' font-weight='700'%3ELive Event%3C/text%3E%3Ctext x='180' y='520' fill='rgba(255,247,239,0.82)' font-family='Arial,sans-serif' font-size='24'%3ESeat booking preview%3C/text%3E%3C/svg%3E"

export function getEventImageUrl(event) {
  return event?.img_url || DEFAULT_EVENT_IMAGE
}

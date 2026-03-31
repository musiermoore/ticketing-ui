import { createI18n } from 'vue-i18n'

import en from './locales/en'
import ru from './locales/ru'

const storedLocale = typeof window !== 'undefined' ? localStorage.getItem('ticketing-locale') : null
const browserLocale =
  typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en'

const i18n = createI18n({
  legacy: false,
  locale: storedLocale || browserLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    ru,
  },
})

export default i18n

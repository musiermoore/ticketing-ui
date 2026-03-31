<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

import BaseBadge from '../components/ui/BaseBadge.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import { cancelBooking, fetchBookings, fetchEvent } from '../lib/api'
import { consumeFlashMessage } from '../lib/flash'
import { formatDateTime } from '../lib/format'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const { t, locale } = useI18n()

const bookings = ref([])
const eventMap = ref({})
const page = ref(1)
const isLoading = ref(false)
const errorMessage = ref('')
const actionMessage = ref('')
const pendingBookingId = ref(null)
let toastTimeoutId = null

const bookingStats = computed(() => [
  {
    label: t('pages.bookings.statsTotal'),
    value: bookings.value.length,
  },
  {
    label: t('pages.bookings.statsUpcoming'),
    value: Object.values(eventMap.value).filter(Boolean).length,
  },
])

async function hydrateEvents(items) {
  const entries = await Promise.all(
    items.map(async (booking) => {
      try {
        const event = await fetchEvent(auth.token, booking.eventId)
        return [booking.eventId, event]
      } catch {
        return [booking.eventId, null]
      }
    }),
  )

  eventMap.value = Object.fromEntries(entries)
}

async function loadBookings() {
  if (!auth.token) {
    bookings.value = []
    errorMessage.value = t('pages.bookings.requiresAuth')
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const items = await fetchBookings(auth.token, page.value)
    bookings.value = items
    await hydrateEvents(items)
  } catch (error) {
    errorMessage.value = error.message || t('feedback.genericError')
  } finally {
    isLoading.value = false
  }
}

async function removeBooking(bookingId) {
  pendingBookingId.value = bookingId
  errorMessage.value = ''
  actionMessage.value = ''

  try {
    await cancelBooking(auth.token, bookingId)
    actionMessage.value = t('feedback.bookingCancelSuccess')
    await loadBookings()
  } catch (error) {
    errorMessage.value = error.message || t('feedback.genericError')
  } finally {
    pendingBookingId.value = null
  }
}

function formatDate(value) {
  return formatDateTime(value, locale.value) || t('common.invalidDate')
}

async function changePage(delta) {
  page.value = Math.max(1, page.value + delta)
  await loadBookings()
}

onMounted(async () => {
  const flash = consumeFlashMessage()

  if (flash?.message) {
    actionMessage.value = flash.message
    toastTimeoutId = window.setTimeout(() => {
      actionMessage.value = ''
    }, 3500)
  }

  await auth.initialize()
  await loadBookings()
})

onBeforeUnmount(() => {
  if (toastTimeoutId) {
    window.clearTimeout(toastTimeoutId)
  }
})
</script>

<template>
  <section class="page-section">
    <transition name="toast">
      <div v-if="actionMessage" class="toast toast--success" role="status" aria-live="polite">
        {{ actionMessage }}
      </div>
    </transition>

    <div class="stat-grid">
      <article v-for="item in bookingStats" :key="item.label" class="summary-card panel">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </article>
    </div>

    <section class="panel bookings-panel">
      <div class="split">
        <div class="stack-sm">
          <p class="eyebrow">{{ t('pages.bookings.listTitle') }}</p>
          <h2 class="section-title">{{ t('pages.bookings.feedTitle') }}</h2>
          <p class="section-copy">{{ t('pages.bookings.listSubtitle') }}</p>
        </div>

        <BaseButton variant="secondary" @click="loadBookings">
          {{ t('common.refresh') }}
        </BaseButton>
      </div>

      <p v-if="errorMessage" class="notice error">{{ errorMessage }}</p>

      <div v-if="isLoading" class="placeholder-box">{{ t('common.loading') }}</div>

      <div v-else-if="bookings.length" class="stack-md">
        <article v-for="booking in bookings" :key="booking.id" class="booking-card">
          <div class="booking-card__head">
            <div class="stack-sm">
              <div class="booking-card__badges">
                <BaseBadge tone="brand">#{{ booking.id }}</BaseBadge>
                <BaseBadge>{{ t('common.eventId') }} {{ booking.eventId }}</BaseBadge>
              </div>
              <h3>{{ eventMap[booking.eventId]?.title || t('pages.bookings.fallbackEvent') }}</h3>
              <p class="muted-text">{{ formatDate(booking.createdAt) }}</p>
            </div>

            <BaseButton
              variant="danger"
              :disabled="pendingBookingId === booking.id"
              @click="removeBooking(booking.id)"
            >
              {{ pendingBookingId === booking.id ? t('common.loading') : t('pages.bookings.cancel') }}
            </BaseButton>
          </div>

          <div class="booking-card__footer">
            <p class="muted-text">
              {{ eventMap[booking.eventId]?.place?.name || t('pages.bookings.venueUnknown') }}
            </p>

            <RouterLink
              v-if="eventMap[booking.eventId]"
              class="booking-open"
              :to="{ name: 'event-details', params: { id: booking.eventId } }"
            >
              {{ t('common.open') }}
            </RouterLink>
          </div>
        </article>
      </div>

      <div v-else class="placeholder-box">
        {{ t('pages.bookings.emptyText') }}
      </div>

      <footer class="pagination">
        <BaseButton variant="secondary" :disabled="page === 1" @click="changePage(-1)">
          {{ t('pages.bookings.previousPage') }}
        </BaseButton>
        <span>{{ t('pages.bookings.pageLabel') }} {{ page }}</span>
        <BaseButton variant="secondary" @click="changePage(1)">
          {{ t('pages.bookings.nextPage') }}
        </BaseButton>
      </footer>
    </section>
  </section>
</template>

<style scoped>
.summary-card,
.bookings-panel {
  padding: 22px;
}

.toast {
  position: sticky;
  top: 16px;
  z-index: 20;
  margin-left: auto;
  width: min(420px, 100%);
  padding: 14px 16px;
  border-radius: 18px;
  box-shadow: 0 18px 40px rgba(20, 27, 38, 0.12);
}

.toast--success {
  background: rgba(255, 250, 242, 0.96);
  border: 1px solid rgba(29, 122, 89, 0.18);
  color: var(--success);
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.summary-card span {
  display: block;
  margin-bottom: 8px;
  color: var(--text-muted);
}

.summary-card strong {
  color: var(--heading);
  font-size: 2rem;
}

.booking-card {
  padding: 18px;
  border-radius: 24px;
  background: var(--surface-muted);
}

.booking-card__head,
.booking-card__footer,
.pagination,
.booking-card__badges {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.booking-card__head {
  margin-bottom: 14px;
}

.booking-card h3 {
  color: var(--heading);
  font-size: 1.25rem;
}

.booking-open {
  font-weight: 700;
  color: var(--brand-strong);
}

.pagination {
  margin-top: 20px;
}

@media (max-width: 720px) {
  .booking-card__head,
  .booking-card__footer,
  .pagination,
  .booking-card__badges {
    display: grid;
    justify-content: initial;
  }
}
</style>

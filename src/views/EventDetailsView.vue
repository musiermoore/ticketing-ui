<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import BookingModal from '../components/BookingModal.vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import { fetchEvent } from '../lib/api'
import { getEventImageUrl } from '../lib/event-media'
import { buildAddress, formatSessionDateTime } from '../lib/format'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const auth = useAuthStore()
const { t, locale } = useI18n()

const event = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')
const actionMessage = ref('')
const modalOpen = ref(false)

const address = computed(() => buildAddress(event.value?.place?.address))
const eventImageUrl = computed(() => getEventImageUrl(event.value))

function formatDate(value) {
  return formatSessionDateTime(value, locale.value, {
    dateStyle: 'full',
    timeStyle: 'short',
  }) || t('common.invalidDate')
}

async function loadEvent() {
  if (!auth.token) {
    errorMessage.value = t('pages.events.authHint')
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    event.value = await fetchEvent(auth.token, route.params.id)
  } catch (error) {
    errorMessage.value = error.message || t('feedback.genericError')
  } finally {
    isLoading.value = false
  }
}

function onBooked() {
  actionMessage.value = t('feedback.bookingSuccess')
  modalOpen.value = false
}

onMounted(async () => {
  await auth.initialize()
  await loadEvent()
})
</script>

<template>
  <section class="page-section">
    <article class="panel details-card">
      <div class="split">
        <RouterLink class="back-link" :to="{ name: 'home' }">
          {{ t('pages.eventDetails.back') }}
        </RouterLink>

        <BaseButton v-if="event" :disabled="!auth.isAuthenticated" @click="modalOpen = true">
          {{ t('pages.eventDetails.book') }}
        </BaseButton>
      </div>

      <p v-if="actionMessage" class="notice success">{{ actionMessage }}</p>
      <p v-if="isLoading" class="placeholder-box">{{ t('common.loading') }}</p>
      <p v-else-if="errorMessage" class="notice error">{{ errorMessage }}</p>

      <template v-else-if="event">
        <div class="stack-md">
          <div class="details-head">
            <div class="stack-sm">
              <div class="details-image-wrap">
                <img class="details-image" :src="eventImageUrl" :alt="event.title" />
              </div>
              <div class="details-head__badges">
                <BaseBadge tone="brand">{{ event.place?.name || t('pages.events.venueTbd') }}</BaseBadge>
                <BaseBadge>{{ event.place?.timezone_id || 'UTC' }}</BaseBadge>
              </div>
              <h2>{{ event.title }}</h2>
              <p class="section-copy">{{ t('pages.eventDetails.summary') }}</p>
            </div>
          </div>

          <div class="card-grid">
            <section class="info-card">
              <span>{{ t('pages.eventDetails.location') }}</span>
              <strong>{{ address || t('common.notAvailable') }}</strong>
            </section>
            <section class="info-card">
              <span>{{ t('pages.events.contact') }}</span>
              <strong>{{ event.place?.email || event.place?.phone || t('common.notAvailable') }}</strong>
            </section>
            <section class="info-card">
              <span>{{ t('pages.events.sessionsCount') }}</span>
              <strong>{{ event.times?.length || 0 }}</strong>
            </section>
          </div>

          <section class="stack-md">
            <div class="stack-sm">
              <p class="eyebrow">{{ t('pages.eventDetails.schedule') }}</p>
              <h3 class="section-title">{{ t('pages.eventDetails.timelineTitle') }}</h3>
            </div>

            <ul class="timeline">
              <li v-for="time in event.times || []" :key="time.id" class="timeline__item">
                <div>
                  <strong>{{ formatDate(time) }}</strong>
                  <p class="muted-text">{{ t('pages.eventDetails.timelineText') }}</p>
                </div>
                <BaseBadge tone="success">
                  {{ time.ticket_count }} {{ t('pages.events.tickets') }}
                </BaseBadge>
              </li>
            </ul>
          </section>
        </div>
      </template>

      <div v-else class="placeholder-box">
        {{ t('pages.eventDetails.unavailable') }}
      </div>
    </article>

    <BookingModal :open="modalOpen" :event="event" @close="modalOpen = false" @booked="onBooked" />
  </section>
</template>

<style scoped>
.details-card {
  padding: 24px;
}

.back-link {
  color: var(--brand-strong);
  font-weight: 700;
}

.details-head h2 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(2rem, 4vw, 3.2rem);
  line-height: 0.94;
  color: var(--heading);
}

.details-image-wrap {
  overflow: hidden;
  border-radius: 24px;
  aspect-ratio: 16 / 9;
  background:
    linear-gradient(135deg, rgba(221, 122, 63, 0.14), rgba(27, 36, 48, 0.1)),
    var(--surface-muted);
}

.details-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.details-head__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.info-card {
  padding: 18px;
  border-radius: 22px;
  background: var(--surface-muted);
}

.info-card span {
  display: block;
  margin-bottom: 8px;
  color: var(--text-muted);
  font-size: 0.82rem;
}

.info-card strong {
  color: var(--heading);
}

.timeline {
  list-style: none;
  display: grid;
  gap: 12px;
}

.timeline__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(27, 36, 48, 0.08);
}

@media (max-width: 720px) {
  .timeline__item {
    display: grid;
  }
}
</style>

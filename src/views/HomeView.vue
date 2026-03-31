<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BookingModal from '../components/BookingModal.vue'
import EventCard from '../components/EventCard.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import { getEventImageUrl } from '../lib/event-media'
import { fetchEvents } from '../lib/api'
import { formatSessionDateTime } from '../lib/format'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const { t, locale } = useI18n()

const events = ref([])
const isLoading = ref(false)
const isLoadingMore = ref(false)
const errorMessage = ref('')
const actionMessage = ref('')
const activeEvent = ref(null)
const loadMoreSentinel = ref(null)
const currentPage = ref(0)
const nextPage = ref(null)
const totalEvents = ref(0)
let observer = null

const featuredEvent = computed(() => events.value[0] || null)
const visibleEvents = computed(() => events.value)
const hasMoreEvents = computed(() => Boolean(nextPage.value))
const stats = computed(() => [
  {
    label: t('pages.home.statsEvents'),
    value: totalEvents.value || events.value.length,
  },
  {
    label: t('pages.home.statsVenues'),
    value: new Set(events.value.map((event) => event.place?.name).filter(Boolean)).size,
  },
  {
    label: t('pages.home.statsSessions'),
    value: events.value.reduce((total, event) => total + (event.times?.length || 0), 0),
  },
])

function renderDate(value) {
  return formatSessionDateTime(value, locale.value, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }) || t('common.invalidDate')
}

function featuredImage(event) {
  return {
    backgroundImage: `linear-gradient(135deg, rgba(24, 31, 40, 0.12), rgba(24, 31, 40, 0.22)), url("${getEventImageUrl(event)}")`,
  }
}

function openBookingModal(event) {
  activeEvent.value = event
}

function closeBookingModal() {
  activeEvent.value = null
}

async function loadEvents() {
  await loadEventsPage(1, { reset: true })
}

async function loadEventsPage(page, { reset = false } = {}) {
  if (!auth.token) {
    events.value = []
    totalEvents.value = 0
    currentPage.value = 0
    nextPage.value = null
    errorMessage.value = t('pages.events.authHint')
    return
  }

  if (reset) {
    isLoading.value = true
  } else {
    isLoadingMore.value = true
  }

  if (reset) {
    errorMessage.value = ''
  }

  try {
    const payload = await fetchEvents(auth.token, page)
    events.value = reset ? payload.data : [...events.value, ...payload.data]
    totalEvents.value = payload.total
    currentPage.value = payload.currentPage
    nextPage.value = payload.hasMore ? payload.nextPage : null
  } catch (error) {
    errorMessage.value = error.message || t('feedback.genericError')
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
    await nextTick()
    setupInfiniteScroll()
  }
}

function loadMoreEvents() {
  if (!hasMoreEvents.value || isLoadingMore.value || isLoading.value) {
    return
  }

  loadEventsPage(nextPage.value)
}

function onBooked() {
  actionMessage.value = t('feedback.bookingSuccess')
}

function setupInfiniteScroll() {
  observer?.disconnect()

  if (!loadMoreSentinel.value || !hasMoreEvents.value) {
    return
  }

  observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      loadMoreEvents()
    }
  })

  observer.observe(loadMoreSentinel.value)
}

watch(hasMoreEvents, async () => {
  await nextTick()
  setupInfiniteScroll()
})

onMounted(async () => {
  await auth.initialize()
  await loadEvents()
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <section class="page-section">
    <section class="home-hero panel">
      <div class="stack-lg">
        <div class="stack-sm">
          <p class="eyebrow">{{ t('pages.home.collectionLabel') }}</p>
          <h2 class="section-title">{{ t('pages.home.collectionTitle') }}</h2>
          <p class="section-copy">{{ t('pages.home.collectionText') }}</p>
        </div>

        <div class="stat-grid">
          <article v-for="item in stats" :key="item.label" class="stat-card">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </article>
        </div>
      </div>

      <aside class="spotlight soft-panel">
        <div v-if="featuredEvent" class="stack-md">
          <div class="spotlight__image" :style="featuredImage(featuredEvent)" />
          <BaseBadge tone="brand">{{ t('pages.home.spotlightLabel') }}</BaseBadge>
          <div class="stack-sm">
            <h3>{{ featuredEvent.title }}</h3>
            <p class="muted-text">{{ featuredEvent.place?.name || t('pages.events.venueTbd') }}</p>
          </div>
          <div class="spotlight__meta">
            <div>
              <span>{{ t('pages.events.nextSession') }}</span>
              <strong>{{ featuredEvent.times?.[0] ? renderDate(featuredEvent.times[0]) : t('pages.events.noSessions') }}</strong>
            </div>
            <div>
              <span>{{ t('pages.events.sessionsCount') }}</span>
              <strong>{{ featuredEvent.times?.length || 0 }}</strong>
            </div>
          </div>
          <BaseButton @click="openBookingModal(featuredEvent)">
            {{ t('pages.home.spotlightCta') }}
          </BaseButton>
        </div>

        <div v-else class="placeholder-box">
          {{ t('pages.home.spotlightEmpty') }}
        </div>
      </aside>
    </section>

    <p v-if="actionMessage" class="notice success">{{ actionMessage }}</p>
    <p v-if="errorMessage" class="notice error">{{ errorMessage }}</p>

    <section class="split">
      <div class="stack-sm">
        <p class="eyebrow">{{ t('pages.events.listTitle') }}</p>
        <h2 class="section-title">{{ t('pages.home.feedTitle') }}</h2>
        <p class="section-copy">{{ t('pages.home.feedSubtitle') }}</p>
      </div>

      <BaseButton variant="secondary" :disabled="isLoading" @click="loadEvents">
        {{ t('common.refresh') }}
      </BaseButton>
    </section>

    <div v-if="isLoading" class="placeholder-box">
      {{ t('common.loading') }}
    </div>

    <div v-else-if="visibleEvents.length" class="event-feed">
      <EventCard
        v-for="event in visibleEvents"
        :key="event.id"
        :event="event"
        :disabled="!auth.isAuthenticated"
        @book="openBookingModal"
      />
    </div>

    <div v-else class="placeholder-box">
      {{ t('pages.events.emptyText') }}
    </div>

    <div v-if="hasMoreEvents" ref="loadMoreSentinel" class="load-more">
      <BaseButton variant="ghost" :disabled="isLoadingMore" @click="loadMoreEvents">
        {{ isLoadingMore ? t('common.loading') : t('pages.home.loadMore') }}
      </BaseButton>
    </div>

    <BookingModal
      :open="Boolean(activeEvent)"
      :event="activeEvent"
      @close="closeBookingModal"
      @booked="onBooked"
    />
  </section>
</template>

<style scoped>
.home-hero {
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1.5fr) minmax(300px, 0.9fr);
  padding: 24px;
}

.stat-card {
  padding: 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.66);
  border: 1px solid rgba(27, 36, 48, 0.06);
}

.stat-card span {
  display: block;
  margin-bottom: 8px;
  color: var(--text-muted);
}

.stat-card strong {
  color: var(--heading);
  font-size: 2rem;
  line-height: 1;
}

.spotlight {
  padding: 20px;
}

.spotlight__image {
  border-radius: 22px;
  aspect-ratio: 16 / 9;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.spotlight h3 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.9rem;
  color: var(--heading);
}

.spotlight__meta {
  display: grid;
  gap: 12px;
}

.spotlight__meta div {
  padding: 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.62);
}

.spotlight__meta span {
  display: block;
  margin-bottom: 6px;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.load-more {
  display: flex;
  justify-content: center;
}

@media (min-width: 1180px) {
  .event-feed {
    display: grid;
    gap: 20px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 781px) and (max-width: 1179px) {
  .event-feed {
    display: grid;
    gap: 20px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 780px) {
  .event-feed {
    display: grid;
    gap: 18px;
    grid-template-columns: 1fr;
  }
}

@media (max-width: 920px) {
  .home-hero {
    grid-template-columns: 1fr;
  }
}
</style>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { getEventImageUrl } from '../lib/event-media'
import { formatSessionDateTime } from '../lib/format'
import BaseBadge from './ui/BaseBadge.vue'
import BaseButton from './ui/BaseButton.vue'

const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['book'])
const { t, locale } = useI18n()

const sessions = computed(() => props.event.times || [])
const nextSession = computed(() => sessions.value[0] || null)
const imageUrl = computed(() => getEventImageUrl(props.event))

function formatDate(value) {
  return formatSessionDateTime(value, locale.value, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }) || t('common.invalidDate')
}
</script>

<template>
  <article class="event-card panel">
    <div class="event-card__image-wrap">
      <img class="event-card__image" :src="imageUrl" :alt="event.title" />
    </div>

    <div class="event-card__hero">
      <BaseBadge tone="brand">{{ t('pages.events.cardLiveLabel') }}</BaseBadge>
      <BaseBadge>{{ event.place?.timezone_id || 'UTC' }}</BaseBadge>
    </div>

    <div class="stack-md">
      <div class="stack-sm">
        <p class="muted-text">{{ event.place?.name || t('pages.events.venueTbd') }}</p>
        <h3 class="event-card__title">{{ event.title }}</h3>
        <p class="muted-text">{{ t('pages.events.cardSummary') }}</p>
      </div>

      <div class="event-card__meta">
        <div>
          <span>{{ t('pages.events.nextSession') }}</span>
          <strong>{{ nextSession ? formatDate(nextSession) : t('pages.events.noSessions') }}</strong>
        </div>
        <div>
          <span>{{ t('pages.events.sessionsCount') }}</span>
          <strong>{{ sessions.length }}</strong>
        </div>
        <div>
          <span>{{ t('pages.events.ticketsFrom') }}</span>
          <strong>
            {{
              nextSession?.ticket_count != null
                ? `${nextSession.ticket_count} ${t('pages.events.tickets')}`
                : t('pages.events.waitingList')
            }}
          </strong>
        </div>
      </div>
    </div>

    <div class="event-card__actions">
      <RouterLink class="event-card__link" :to="{ name: 'event-details', params: { id: event.id } }">
        {{ t('pages.events.primaryCta') }}
      </RouterLink>

      <BaseButton
        :disabled="disabled || loading"
        @click="emit('book', event)"
      >
        {{ loading ? t('common.loading') : t('pages.events.secondaryCta') }}
      </BaseButton>
    </div>
  </article>
</template>

<style scoped>
.event-card {
  padding: 22px;
  display: grid;
  gap: 22px;
}

.event-card__image-wrap {
  overflow: hidden;
  border-radius: 22px;
  aspect-ratio: 16 / 9;
  background:
    linear-gradient(135deg, rgba(221, 122, 63, 0.14), rgba(27, 36, 48, 0.1)),
    var(--surface-muted);
}

.event-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-card__hero {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.event-card__title {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.7rem;
  line-height: 1;
  color: var(--heading);
}

.event-card__meta {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.event-card__meta div {
  min-height: 84px;
  padding: 16px;
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.56)),
    var(--surface-muted);
  border: 1px solid rgba(27, 36, 48, 0.06);
  display: grid;
  align-content: space-between;
}

.event-card__meta div:first-child {
  grid-column: 1 / -1;
}

.event-card__meta span {
  display: block;
  margin-bottom: 4px;
  color: var(--text-muted);
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.event-card__meta strong {
  color: var(--heading);
  display: block;
  line-height: 1.35;
  overflow-wrap: anywhere;
  font-size: 1.02rem;
}

.event-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.event-card__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.64);
  color: var(--heading);
  font-weight: 700;
}

@media (max-width: 640px) {
  .event-card__meta {
    grid-template-columns: 1fr;
  }

  .event-card__meta div,
  .event-card__meta div:first-child {
    grid-column: auto;
    min-height: auto;
  }

  .event-card__actions,
  .event-card__link {
    width: 100%;
  }
}
</style>

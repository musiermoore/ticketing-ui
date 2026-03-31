<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import BaseBadge from '../components/ui/BaseBadge.vue'
import BaseButton from '../components/ui/BaseButton.vue'

const route = useRoute()
const { t, tm } = useI18n()

const bookingRows = computed(() => tm('pages.admin.eventTimes.showRows'))
</script>

<template>
  <section class="page-section">
    <article class="panel admin-show">
      <div class="split">
        <div class="stack-sm">
          <BaseBadge tone="brand">{{ t('pages.admin.eventTimes.showLabel') }}</BaseBadge>
          <h2 class="section-title">{{ t('pages.admin.eventTimes.showHeading', { id: route.params.id }) }}</h2>
          <p class="section-copy">{{ t('pages.admin.eventTimes.showText') }}</p>
        </div>

        <div class="show-actions">
          <BaseButton variant="danger">{{ t('pages.admin.eventTimes.cancelEventTime') }}</BaseButton>
          <BaseButton variant="secondary">{{ t('pages.admin.eventTimes.cancelBookings') }}</BaseButton>
        </div>
      </div>

      <div class="card-grid admin-show__cards">
        <article class="info-card">
          <span>{{ t('pages.admin.eventTimes.info.event') }}</span>
          <strong>Summer Terrace Session</strong>
        </article>
        <article class="info-card">
          <span>{{ t('pages.admin.eventTimes.info.status') }}</span>
          <strong>{{ t('pages.admin.filters.active') }}</strong>
        </article>
        <article class="info-card">
          <span>{{ t('pages.admin.eventTimes.info.bookings') }}</span>
          <strong>{{ bookingRows.length }}</strong>
        </article>
      </div>

      <div class="table-card">
        <div class="table-row table-row--head">
          <span>{{ t('pages.admin.eventTimes.bookingsTable.user') }}</span>
          <span>{{ t('pages.admin.eventTimes.bookingsTable.status') }}</span>
          <span>{{ t('pages.admin.eventTimes.bookingsTable.createdAt') }}</span>
          <span>{{ t('pages.admin.eventTimes.bookingsTable.actions') }}</span>
        </div>

        <div v-for="row in bookingRows" :key="row.id" class="table-row">
          <span>{{ row.user }}</span>
          <span>{{ row.status }}</span>
          <span>{{ row.createdAt }}</span>
          <span class="table-row__actions">
            <button class="table-link" type="button">{{ t('pages.admin.eventTimes.cancelBooking') }}</button>
          </span>
        </div>
      </div>
    </article>
  </section>
</template>

<style scoped>
.admin-show {
  padding: 24px;
}

.show-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.admin-show__cards {
  margin-top: 24px;
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

.table-card {
  margin-top: 24px;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid var(--line);
}

.table-row {
  display: grid;
  gap: 14px;
  grid-template-columns: 1.1fr 0.9fr 1fr 0.7fr;
  padding: 16px 18px;
  background: rgba(255, 255, 255, 0.62);
  border-top: 1px solid rgba(27, 36, 48, 0.06);
}

.table-row--head {
  background: rgba(27, 36, 48, 0.04);
  color: var(--text-muted);
  font-size: 0.86rem;
  font-weight: 700;
  border-top: 0;
}

.table-row__actions {
  display: flex;
}

.table-link {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--danger);
  font-weight: 700;
}

@media (max-width: 860px) {
  .table-row {
    grid-template-columns: 1fr;
  }
}
</style>

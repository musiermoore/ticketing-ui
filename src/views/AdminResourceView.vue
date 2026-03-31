<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

import BaseButton from '../components/ui/BaseButton.vue'
import BaseSelect from '../components/ui/BaseSelect.vue'

const props = defineProps({
  resource: {
    type: String,
    required: true,
  },
})

const { t, tm } = useI18n()
const selectedStatus = ref('all')

const config = computed(() => tm(`pages.admin.${props.resource}`))
const columns = computed(() => config.value.columns || [])
const rows = computed(() => config.value.rows || [])
const statusOptions = computed(() => [
  { label: t('pages.admin.filters.all'), value: 'all' },
  { label: t('pages.admin.filters.active'), value: 'active' },
  { label: t('pages.admin.filters.archived'), value: 'archived' },
])
</script>

<template>
  <section class="page-section">
    <article class="panel admin-page">
      <div class="split">
        <div class="stack-sm">
          <p class="eyebrow">{{ config.kicker }}</p>
          <h2 class="section-title">{{ config.heading }}</h2>
          <p class="section-copy">{{ config.description }}</p>
        </div>

        <div class="admin-actions">
          <BaseSelect
            v-model="selectedStatus"
            :label="t('pages.admin.filters.label')"
            :options="statusOptions"
          />
          <BaseButton>{{ config.createCta }}</BaseButton>
        </div>
      </div>

      <div class="table-card">
        <div class="table-row table-row--head">
          <span v-for="column in columns" :key="column">{{ column }}</span>
        </div>

        <div v-for="row in rows" :key="row.id" class="table-row">
          <span>{{ row.primary }}</span>
          <span>{{ row.secondary }}</span>
          <span>{{ row.status }}</span>
          <span class="table-row__actions">
            <RouterLink
              v-if="resource === 'eventTimes'"
              class="table-link"
              :to="{ name: 'admin-event-times-show', params: { id: row.id } }"
            >
              {{ t('common.open') }}
            </RouterLink>
            <button class="table-link" type="button">{{ t('pages.admin.actions.edit') }}</button>
          </span>
        </div>
      </div>
    </article>
  </section>
</template>

<style scoped>
.admin-page {
  padding: 24px;
}

.admin-actions {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(180px, 220px) auto;
  align-items: end;
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
  grid-template-columns: 1.2fr 1fr 0.8fr 0.7fr;
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
  flex-wrap: wrap;
  gap: 12px;
}

.table-link {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--brand-strong);
  font-weight: 700;
}

@media (max-width: 860px) {
  .admin-actions,
  .table-row {
    grid-template-columns: 1fr;
  }
}
</style>

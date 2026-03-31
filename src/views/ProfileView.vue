<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import BaseBadge from '../components/ui/BaseBadge.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const { t } = useI18n()

const profileRows = computed(() => [
  { label: 'ID', value: auth.user?.id || '—' },
  { label: t('pages.auth.name'), value: auth.user?.name || t('common.notAvailable') },
  { label: t('pages.auth.email'), value: auth.user?.email || t('common.notAvailable') },
])

async function goToLogin() {
  await router.push({ name: 'login' })
}

onMounted(async () => {
  await auth.initialize()
})
</script>

<template>
  <section class="page-section">
    <article class="panel profile-page">
      <div class="split">
        <div class="stack-sm">
          <BaseBadge tone="brand">
            {{ auth.isAuthenticated ? t('pages.profile.memberLabel') : t('pages.profile.guestLabel') }}
          </BaseBadge>
          <h2 class="section-title">{{ t('pages.profile.cardTitle') }}</h2>
          <p class="section-copy">{{ t('pages.profile.cardText') }}</p>
        </div>

        <BaseButton v-if="!auth.isAuthenticated" @click="goToLogin">
          {{ t('nav.signIn') }}
        </BaseButton>
      </div>

      <div v-if="auth.user" class="profile-grid">
        <article v-for="row in profileRows" :key="row.label" class="profile-grid__item">
          <span>{{ row.label }}</span>
          <strong>{{ row.value }}</strong>
        </article>
      </div>

      <div v-else class="placeholder-box">
        {{ t('pages.profile.emptyText') }}
      </div>
    </article>
  </section>
</template>

<style scoped>
.profile-page {
  padding: 24px;
}

.profile-grid {
  margin-top: 24px;
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.profile-grid__item {
  padding: 20px;
  border-radius: 22px;
  background: var(--surface-muted);
}

.profile-grid__item span {
  display: block;
  margin-bottom: 8px;
  color: var(--text-muted);
}

.profile-grid__item strong {
  color: var(--heading);
}
</style>

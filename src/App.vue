<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import BaseButton from './components/ui/BaseButton.vue'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const auth = useAuthStore()
const { t, locale } = useI18n()

const navItems = computed(() => [
  { to: { name: 'home' }, label: t('nav.home') },
  { to: { name: 'bookings' }, label: t('nav.bookings') },
  ...(auth.isAuthenticated ? [{ to: { name: 'profile' }, label: t('nav.profile') }] : []),
])

const adminItems = computed(() => [
  { to: { name: 'admin-venues' }, label: t('nav.adminVenues') },
  { to: { name: 'admin-events' }, label: t('nav.adminEvents') },
  { to: { name: 'admin-event-times' }, label: t('nav.adminEventTimes') },
  { to: { name: 'admin-users' }, label: t('nav.adminUsers') },
])

const showAdminLinks = computed(() => auth.isAuthenticated && auth.isAdmin)

function switchLocale(nextLocale) {
  locale.value = nextLocale
  localStorage.setItem('ticketing-locale', nextLocale)
}

function logout() {
  auth.logout()
}

onMounted(() => {
  auth.initialize()
})
</script>

<template>
  <div class="shell">
    <header class="site-header container">
      <RouterLink class="brand" :to="{ name: 'home' }">
        <div class="brand__mark">SF</div>
        <div class="stack-sm">
          <strong>{{ t('app.name') }}</strong>
          <span>{{ t('app.tagline') }}</span>
        </div>
      </RouterLink>

      <nav class="primary-nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.label"
          class="nav-link"
          :to="item.to"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="header-actions">
        <div class="locale-toggle" :aria-label="t('app.language')">
          <button
            class="locale-toggle__button"
            :class="{ active: locale === 'en' }"
            type="button"
            @click="switchLocale('en')"
          >
            EN
          </button>
          <button
            class="locale-toggle__button"
            :class="{ active: locale === 'ru' }"
            type="button"
            @click="switchLocale('ru')"
          >
            RU
          </button>
        </div>

        <RouterLink v-if="!auth.isAuthenticated" :to="{ name: 'login' }">
          <BaseButton variant="secondary" size="sm">{{ t('nav.signIn') }}</BaseButton>
        </RouterLink>
        <BaseButton v-else variant="ghost" size="sm" @click="logout">
          {{ t('auth.logout') }}
        </BaseButton>
      </div>
    </header>

    <main class="container main-area">
      <section class="hero panel">
        <div class="hero__content">
          <p class="eyebrow">{{ t('app.platform') }}</p>
          <h1 class="display-title">{{ t(route.meta.titleKey || 'pages.home.title') }}</h1>
          <p class="section-copy hero__copy">
            {{ t(route.meta.descriptionKey || 'pages.home.subtitle') }}
          </p>
        </div>

        <div class="hero__aside soft-panel">
          <div class="stack-sm">
            <span class="pill">{{ auth.isAuthenticated ? t('app.readyToBook') : t('app.guestMode') }}</span>
            <h2>{{ t('app.heroCardTitle') }}</h2>
            <p class="muted-text">{{ t('app.heroCardText') }}</p>
          </div>

          <div v-if="showAdminLinks" class="hero__admin">
            <p class="eyebrow">{{ t('nav.admin') }}</p>
            <div class="hero__admin-links">
              <RouterLink
                v-for="item in adminItems"
                :key="item.label"
                class="admin-link"
                :to="item.to"
              >
                {{ item.label }}
              </RouterLink>
            </div>
          </div>
        </div>
      </section>

      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.shell {
  min-height: 100vh;
  padding: 16px 0 48px;
}

.site-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 14px;
}

.brand__mark {
  width: 50px;
  height: 50px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--brand), var(--brand-strong));
  color: #fff9f1;
  font-weight: 800;
  box-shadow: 0 16px 30px rgba(165, 72, 31, 0.2);
}

.brand strong {
  color: var(--heading);
  letter-spacing: 0.04em;
}

.brand span {
  color: var(--text-muted);
  font-size: 0.92rem;
}

.primary-nav,
.header-actions,
.hero__admin-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.nav-link,
.admin-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(27, 36, 48, 0.08);
  background: rgba(255, 255, 255, 0.58);
  color: var(--text-muted);
  font-weight: 600;
}

.nav-link.router-link-active,
.admin-link.router-link-active {
  background: rgba(216, 116, 59, 0.14);
  border-color: rgba(216, 116, 59, 0.16);
  color: var(--brand-strong);
}

.locale-toggle {
  display: inline-flex;
  padding: 4px;
  border-radius: 999px;
  background: rgba(27, 36, 48, 0.06);
}

.locale-toggle__button {
  min-height: 36px;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--text-muted);
}

.locale-toggle__button.active {
  background: rgba(255, 255, 255, 0.85);
  color: var(--heading);
  box-shadow: 0 10px 20px rgba(17, 24, 33, 0.08);
}

.main-area {
  display: grid;
  gap: 24px;
}

.hero {
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1.5fr) minmax(300px, 0.9fr);
  padding: 24px;
  overflow: hidden;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.76), transparent 34%),
    linear-gradient(135deg, rgba(216, 116, 59, 0.18), rgba(74, 107, 145, 0.1)),
    var(--surface);
}

.hero__content {
  display: grid;
  gap: 16px;
}

.hero__copy {
  max-width: 56ch;
  font-size: 1.04rem;
}

.hero__aside {
  padding: 20px;
  display: grid;
  gap: 20px;
  align-content: start;
}

.hero__aside h2 {
  color: var(--heading);
  font-size: 1.25rem;
}

.hero__admin {
  display: grid;
  gap: 12px;
}

@media (max-width: 920px) {
  .hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .shell {
    padding-top: 10px;
  }
}
</style>

<script setup>
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import BaseButton from '../components/ui/BaseButton.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  mode: {
    type: String,
    default: 'login',
  },
})

const auth = useAuthStore()
const router = useRouter()
const { t } = useI18n()

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const isRegister = computed(() => props.mode === 'register')
const perks = computed(() => [
  t('pages.auth.perkFastCheckout'),
  t('pages.auth.perkHistory'),
  t('pages.auth.perkAlerts'),
])

async function submit() {
  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    if (isRegister.value) {
      await auth.registerUser(form)
      successMessage.value = t('auth.successRegister')
    } else {
      await auth.loginUser({
        email: form.email,
        password: form.password,
      })
      successMessage.value = t('auth.successLogin')
    }

    await router.push({ name: 'home' })
  } catch (error) {
    errorMessage.value = error.message || t('feedback.genericError')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="auth-layout">
    <article class="panel auth-card">
      <div class="auth-tabs">
        <RouterLink class="auth-tabs__link" :class="{ active: !isRegister }" :to="{ name: 'login' }">
          {{ t('pages.auth.loginTab') }}
        </RouterLink>
        <RouterLink class="auth-tabs__link" :class="{ active: isRegister }" :to="{ name: 'register' }">
          {{ t('pages.auth.registerTab') }}
        </RouterLink>
      </div>

      <form class="stack-md" @submit.prevent="submit">
        <BaseInput
          v-if="isRegister"
          v-model="form.name"
          :label="t('pages.auth.name')"
          :placeholder="t('pages.auth.namePlaceholder')"
          autocomplete="name"
          required
        />

        <BaseInput
          v-model="form.email"
          :label="t('pages.auth.email')"
          :placeholder="t('pages.auth.emailPlaceholder')"
          type="email"
          autocomplete="email"
          required
        />

        <BaseInput
          v-model="form.password"
          :label="t('pages.auth.password')"
          :placeholder="t('pages.auth.passwordPlaceholder')"
          type="password"
          :autocomplete="isRegister ? 'new-password' : 'current-password'"
          required
        />

        <BaseInput
          v-if="isRegister"
          v-model="form.password_confirmation"
          :label="t('pages.auth.passwordConfirmation')"
          :placeholder="t('pages.auth.passwordConfirmationPlaceholder')"
          type="password"
          autocomplete="new-password"
          required
        />

        <p v-if="errorMessage" class="notice error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="notice success">{{ successMessage }}</p>

        <BaseButton type="submit" block :disabled="isSubmitting">
          {{
            isSubmitting
              ? t('common.loading')
              : isRegister
                ? t('pages.auth.submitRegister')
                : t('pages.auth.submitLogin')
          }}
        </BaseButton>
      </form>
    </article>

    <aside class="panel auth-aside">
      <div class="stack-md">
        <div class="stack-sm">
          <p class="eyebrow">{{ t('pages.auth.sideLabel') }}</p>
          <h2 class="section-title">{{ t('pages.auth.sideTitle') }}</h2>
          <p class="section-copy">{{ t('pages.auth.sideText') }}</p>
        </div>

        <ul class="perk-list">
          <li v-for="perk in perks" :key="perk">{{ perk }}</li>
        </ul>

        <div class="profile-card">
          <h3>{{ t('pages.auth.meTitle') }}</h3>
          <p v-if="auth.user" class="muted-text">{{ auth.user.name || auth.user.email }}</p>
          <p v-if="auth.user" class="muted-text">{{ auth.user.email }}</p>
          <p v-else class="muted-text">{{ t('pages.auth.meEmpty') }}</p>
        </div>
      </div>
    </aside>
  </section>
</template>

<style scoped>
.auth-layout {
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1.05fr) minmax(300px, 0.95fr);
}

.auth-card,
.auth-aside {
  padding: 24px;
}

.auth-tabs {
  display: inline-flex;
  padding: 4px;
  margin-bottom: 24px;
  border-radius: 999px;
  background: rgba(27, 36, 48, 0.06);
}

.auth-tabs__link {
  min-height: 42px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: var(--text-muted);
  font-weight: 700;
}

.auth-tabs__link.active {
  background: rgba(255, 255, 255, 0.82);
  color: var(--heading);
}

.perk-list {
  list-style: none;
  display: grid;
  gap: 10px;
}

.perk-list li,
.profile-card {
  padding: 16px;
  border-radius: 20px;
  background: var(--surface-muted);
}

.profile-card {
  display: grid;
  gap: 8px;
}

@media (max-width: 920px) {
  .auth-layout {
    grid-template-columns: 1fr;
  }
}
</style>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { createBooking } from '../lib/api'
import { setFlashMessage } from '../lib/flash'
import { formatSessionDateTime } from '../lib/format'
import { useAuthStore } from '../stores/auth'
import BaseBadge from './ui/BaseBadge.vue'
import BaseButton from './ui/BaseButton.vue'
import BaseModal from './ui/BaseModal.vue'
import BaseSelect from './ui/BaseSelect.vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  event: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'booked'])

const auth = useAuthStore()
const router = useRouter()
const { t, locale } = useI18n()

const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const selectedTimeId = ref('')

const eventTimes = computed(() => props.event?.times || [])
const selectedTime = computed(
  () => eventTimes.value.find((item) => String(item.id) === String(selectedTimeId.value)) || eventTimes.value[0],
)
const sessionOptions = computed(() =>
  eventTimes.value.map((item) => ({
    value: String(item.id),
    label: `${formatDate(item)} · ${item.ticket_count} ${t('pages.events.tickets')}`,
  })),
)

watch(
  () => props.event,
  (nextEvent) => {
    selectedTimeId.value = nextEvent?.times?.[0]?.id ? String(nextEvent.times[0].id) : ''
    errorMessage.value = ''
    successMessage.value = ''
  },
  { immediate: true },
)

function formatDate(value) {
  return formatSessionDateTime(value, locale.value, {
    dateStyle: 'full',
    timeStyle: 'short',
  }) || t('common.invalidDate')
}

async function submitBooking() {
  if (!auth.isAuthenticated) {
    emit('close')
    router.push({ name: 'login' })
    return
  }

  if (!props.event?.id) {
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const booking = await createBooking(auth.token, props.event.id)
    setFlashMessage({
      type: 'success',
      message: t('feedback.bookingSuccess'),
    })
    emit('booked', booking)
    emit('close')
    await router.push({ name: 'bookings' })
  } catch (error) {
    errorMessage.value = error.message || t('feedback.genericError')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <BaseModal :open="open" :title="event?.title || t('pages.events.secondaryCta')" @close="emit('close')">
    <div class="stack-md">
      <div class="booking-summary">
        <div class="stack-sm">
          <p class="muted-text">{{ event?.place?.name || t('pages.events.venueTbd') }}</p>
          <p>{{ t('pages.bookingModal.summaryText') }}</p>
        </div>
        <BaseBadge tone="brand">
          {{
            selectedTime?.ticket_count != null
              ? `${selectedTime.ticket_count} ${t('pages.events.tickets')}`
              : t('pages.events.waitingList')
          }}
        </BaseBadge>
      </div>

      <div v-if="selectedTime" class="session-card">
        <p class="eyebrow">{{ t('pages.bookingModal.selectedSession') }}</p>
        <strong>{{ formatDate(selectedTime) }}</strong>
      </div>

      <BaseSelect
        v-if="sessionOptions.length > 1"
        v-model="selectedTimeId"
        :label="t('pages.events.eventTimes')"
        :options="sessionOptions"
      />

      <div class="stack-sm">
        <h4>{{ t('pages.bookingModal.whatYouGetTitle') }}</h4>
        <ul class="feature-list">
          <li>{{ t('pages.bookingModal.featureSeat') }}</li>
          <li>{{ t('pages.bookingModal.featureReminder') }}</li>
          <li>{{ t('pages.bookingModal.featureManage') }}</li>
        </ul>
      </div>

      <p v-if="!auth.isAuthenticated" class="notice warning">
        {{ t('pages.bookingModal.authRequired') }}
      </p>
      <p v-if="errorMessage" class="notice error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="notice success">{{ successMessage }}</p>

      <div class="modal-actions">
        <BaseButton variant="secondary" @click="emit('close')">
          {{ t('common.cancel') }}
        </BaseButton>
        <BaseButton :disabled="isSubmitting" @click="submitBooking">
          {{ isSubmitting ? t('common.loading') : t('pages.bookingModal.confirm') }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.booking-summary,
.modal-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.session-card {
  padding: 18px;
  border-radius: 22px;
  background:
    linear-gradient(135deg, rgba(216, 116, 59, 0.12), rgba(74, 107, 145, 0.08)),
    var(--surface-muted);
}

.session-card strong {
  font-size: 1.08rem;
  color: var(--heading);
}

.feature-list {
  list-style: none;
  display: grid;
  gap: 10px;
}

.feature-list li {
  padding: 12px 14px;
  border-radius: 16px;
  background: var(--surface-muted);
}

@media (max-width: 720px) {
  .booking-summary,
  .modal-actions {
    display: grid;
  }
}
</style>

<script setup>
import { onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close'])

function onKeydown(event) {
  if (event.key === 'Escape') {
    emit('close')
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (typeof window === 'undefined') {
      return
    }

    if (isOpen) {
      window.addEventListener('keydown', onKeydown)
      document.body.style.overflow = 'hidden'
      return
    }

    window.removeEventListener('keydown', onKeydown)
    document.body.style.overflow = ''
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', onKeydown)
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <teleport to="body">
    <div v-if="open" class="modal-root" @click.self="emit('close')">
      <div class="modal-card panel">
        <div class="modal-head">
          <div class="stack-sm">
            <p class="eyebrow">Booking</p>
            <h3 class="section-title">{{ title }}</h3>
          </div>

          <button class="close-button" type="button" @click="emit('close')">×</button>
        </div>

        <slot />
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.modal-root {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(19, 24, 31, 0.5);
  backdrop-filter: blur(12px);
  z-index: 30;
}

.modal-card {
  width: min(620px, 100%);
  padding: 24px;
}

.modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 20px;
}

.close-button {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.7);
  color: var(--heading);
  font-size: 1.4rem;
  line-height: 1;
}
</style>

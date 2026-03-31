<script setup>
defineProps({
  tone: {
    type: String,
    default: 'default',
  },
})
</script>

<template>
  <span :class="['badge', `badge--${tone}`]">
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 11px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.badge--default {
  background: rgba(255, 255, 255, 0.7);
  color: var(--heading);
}

.badge--brand {
  background: var(--brand-soft);
  color: var(--brand-strong);
}

.badge--success {
  background: var(--success-soft);
  color: var(--success);
}

.badge--danger {
  background: var(--danger-soft);
  color: var(--danger);
}
</style>

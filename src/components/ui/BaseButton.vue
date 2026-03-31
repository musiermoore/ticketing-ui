<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'button',
  },
  variant: {
    type: String,
    default: 'primary',
  },
  size: {
    type: String,
    default: 'md',
  },
  block: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const classes = computed(() => [
  'base-button',
  `base-button--${props.variant}`,
  `base-button--${props.size}`,
  props.block ? 'base-button--block' : '',
])
</script>

<template>
  <button :type="type" :disabled="disabled" :class="classes">
    <slot />
  </button>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 999px;
  border: 1px solid transparent;
  font-weight: 700;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease;
}

.base-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.base-button:disabled {
  opacity: 0.6;
  cursor: wait;
  transform: none;
}

.base-button--block {
  width: 100%;
}

.base-button--sm {
  min-height: 40px;
  padding: 0 14px;
  font-size: 0.92rem;
}

.base-button--md {
  min-height: 48px;
  padding: 0 18px;
}

.base-button--lg {
  min-height: 54px;
  padding: 0 22px;
  font-size: 1rem;
}

.base-button--primary {
  background: linear-gradient(135deg, var(--brand), var(--brand-strong));
  color: #fff9f1;
  box-shadow: 0 16px 28px rgba(165, 72, 31, 0.22);
}

.base-button--secondary {
  background: rgba(255, 255, 255, 0.7);
  border-color: var(--line);
  color: var(--heading);
}

.base-button--ghost {
  background: transparent;
  border-color: rgba(27, 36, 48, 0.08);
  color: var(--heading);
}

.base-button--danger {
  background: var(--danger-soft);
  border-color: rgba(173, 77, 79, 0.14);
  color: var(--danger);
}
</style>

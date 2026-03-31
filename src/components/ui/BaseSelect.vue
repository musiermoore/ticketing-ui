<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <label class="field">
    <span v-if="label" class="field__label">{{ label }}</span>
    <select
      :value="modelValue"
      class="field__control"
      @change="emit('update:modelValue', $event.target.value)"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </label>
</template>

<style scoped>
.field {
  display: grid;
  gap: 8px;
}

.field__label {
  color: var(--heading);
  font-size: 0.94rem;
  font-weight: 700;
}

.field__control {
  width: 100%;
  min-height: 52px;
  padding: 0 16px;
  border-radius: 18px;
  border: 1px solid rgba(27, 36, 48, 0.12);
  background: rgba(255, 255, 255, 0.88);
  color: var(--heading);
  outline: none;
}

.field__control:focus {
  border-color: rgba(216, 116, 59, 0.45);
  box-shadow: 0 0 0 4px rgba(216, 116, 59, 0.14);
}
</style>

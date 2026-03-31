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
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  autocomplete: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <label class="field">
    <span v-if="label" class="field__label">{{ label }}</span>
    <input
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :required="required"
      class="field__control"
      @input="emit('update:modelValue', $event.target.value)"
    />
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
  border-radius: 18px;
  border: 1px solid rgba(27, 36, 48, 0.12);
  background: rgba(255, 255, 255, 0.88);
  color: var(--heading);
  padding: 0 16px;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease;
}

.field__control:focus {
  outline: none;
  border-color: rgba(216, 116, 59, 0.45);
  box-shadow: 0 0 0 4px rgba(216, 116, 59, 0.14);
}

.field__control::placeholder {
  color: #97a2af;
}
</style>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'

import UserInfoPickerDialog from './UserInfoPickerDialog.vue'

interface Emits {
  (e: 'update:modelValue', value: string | number | undefined): void
  (e: 'change', value: string | number | undefined, user?: any): void
}

const props = withDefaults(defineProps<{
  modelValue?: string | number
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  appendButtonIcon?: string
}>(), {
  clearable: true,
  disabled: false,
  placeholder: '请选择用户',
  appendButtonIcon: 'ep:search',
})

const emit = defineEmits<Emits>()

const pickerRef = ref<InstanceType<typeof UserInfoPickerDialog> | null>(null)
const internalValue = ref<string | number | undefined>(props.modelValue)
const selectedUser = ref<any>(null)

watch(() => props.modelValue, (val) => {
  internalValue.value = val
})

const displayValue = computed(() => {
  if (selectedUser.value?.nickname) return selectedUser.value.nickname
  return internalValue.value ?? ''
})

function handleInput(value: string) {
  internalValue.value = value
  selectedUser.value = null
  emit('update:modelValue', value)
  emit('change', value)
}

function handleClear() {
  internalValue.value = undefined
  selectedUser.value = null
  emit('update:modelValue', undefined)
  emit('change', undefined)
}

function handleOpen() {
  pickerRef.value?.open(internalValue.value as number | undefined)
}

function handleConfirm(user: any) {
  selectedUser.value = user
  internalValue.value = user?.id
  emit('update:modelValue', user?.id)
  emit('change', user?.id, user)
}
</script>

<template>
  <div class="user-select-input">
    <el-input
      :model-value="displayValue"
      :placeholder="placeholder"
      :clearable="clearable"
      :disabled="disabled"
      @input="handleInput"
      @clear="handleClear"
    >
      <template #append>
        <el-button :icon="Search" @click="handleOpen" />
      </template>
    </el-input>
    <UserInfoPickerDialog ref="pickerRef" @confirm="handleConfirm" />
  </div>
</template>

<style scoped>
.user-select-input {
  width: 100%;
}
</style>

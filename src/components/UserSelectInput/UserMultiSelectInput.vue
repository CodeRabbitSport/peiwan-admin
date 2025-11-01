<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'

import UserInfoMultiPickerDialog from './UserInfoMultiPickerDialog.vue'

interface Emits {
  (e: 'update:modelValue', value: Array<string | number>): void
  (e: 'change', value: Array<string | number>, users?: any[]): void
}

const props = withDefaults(defineProps<{
  modelValue?: Array<string | number>
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

const pickerRef = ref<InstanceType<typeof UserInfoMultiPickerDialog> | null>(null)
const internalValue = ref<Array<string | number>>(props.modelValue || [])
const selectedUsers = ref<any[]>([])
const displayTagValues = ref<string[]>([])

watch(() => props.modelValue, (val) => {
  internalValue.value = val || []
  // 外部变更时，清空名称展示，等待用户重新选择
  if (!selectedUsers.value.length) displayTagValues.value = (internalValue.value || []).map(v => String(v))
})

// tags values for input-tag (string[] only) -> 显示昵称
const tagValues = computed(() => displayTagValues.value)

// input-tag 直接维护 modelValue，无需手动解析输入

function handleClear() {
  internalValue.value = []
  selectedUsers.value = []
  displayTagValues.value = []
  emit('update:modelValue', [])
  emit('change', [])
}

function handleOpen() {
  const preIds = internalValue.value.map(v => Number(v)).filter(v => !Number.isNaN(v))
  pickerRef.value?.open(preIds as number[])
}

function handleConfirm(users: any[]) {
  selectedUsers.value = users
  const ids = users.map(u => u.id)
  internalValue.value = ids
  displayTagValues.value = users.map(u => u.nickname || String(u.id))
  emit('update:modelValue', ids)
  emit('change', ids, users)
}

function handleTagUpdate(val: string[]) {
  // 仅支持删除tag，不支持新增（通过弹窗选择）
  if (val.length > displayTagValues.value.length) {
    // 恢复为原有的，忽略新增
    displayTagValues.value = [...displayTagValues.value]
    return
  }
  // 根据保留的名称过滤选中用户与ID
  const keepNameSet = new Set(val)
  const keptUsers = selectedUsers.value.filter(u => keepNameSet.has(u.nickname || String(u.id)))
  selectedUsers.value = keptUsers
  internalValue.value = keptUsers.map(u => u.id)
  displayTagValues.value = keptUsers.map(u => u.nickname || String(u.id))
  emit('update:modelValue', internalValue.value)
  emit('change', internalValue.value, selectedUsers.value)
}
</script>

<template>
  <div class="user-select-input">
    <el-input-tag
      :model-value="tagValues"
      :placeholder="placeholder"
      :disabled="disabled"
      class="!w-full"
      @update:model-value="handleTagUpdate"
    />
    <div class="mt-[6px]">
      <el-button :icon="Search" @click="handleOpen">
        选择用户
      </el-button>
      <el-button v-if="clearable" @click="handleClear">
        清空
      </el-button>
    </div>
    <UserInfoMultiPickerDialog ref="pickerRef" @confirm="handleConfirm" />
  </div>
</template>

<style scoped>
.user-select-input {
  width: 100%;
}
</style>

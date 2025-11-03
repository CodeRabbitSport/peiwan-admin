<script setup lang="ts">
import { CloseBold, Search } from '@element-plus/icons-vue'

import UserInfoMultiPickerDialog from './UserInfoMultiPickerDialog.vue'

interface Emits {
  (e: 'update:modelValue', value: Array<string | number> | string | number | undefined): void
  (e: 'change', value: Array<string | number> | string | number | undefined, users?: any[] | any): void
}

const props = withDefaults(defineProps<{
  modelValue?: Array<string | number> | string | number
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  appendButtonIcon?: string
  multiple?: boolean // 是否多选，默认true
}>(), {
  clearable: true,
  disabled: false,
  placeholder: '请选择用户',
  appendButtonIcon: 'ep:search',
  multiple: true,
})

const emit = defineEmits<Emits>()

const pickerRef = ref<InstanceType<typeof UserInfoMultiPickerDialog> | null>(null)
const internalValue = ref<Array<string | number>>([])
const selectedUsers = ref<any[]>([])
const displayTagValues = ref<string[]>([])

// 初始化值
function initInternalValue() {
  if (props.multiple) {
    internalValue.value = (Array.isArray(props.modelValue) ? props.modelValue : (props.modelValue ? [props.modelValue] : [])) as Array<string | number>
  }
  else {
    internalValue.value = (props.modelValue ? [props.modelValue as string | number] : []) as Array<string | number>
  }
}
initInternalValue()

watch(() => props.modelValue, (val) => {
  if (props.multiple) {
    internalValue.value = (Array.isArray(val) ? val : (val ? [val] : [])) as Array<string | number>
  }
  else {
    internalValue.value = (val ? [val as string | number] : []) as Array<string | number>
  }
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
  const emitValue = props.multiple ? [] : undefined
  emit('update:modelValue', emitValue)
  emit('change', emitValue)
}

function handleOpen() {
  const preIds = internalValue.value.map(v => Number(v)).filter(v => !Number.isNaN(v))
  pickerRef.value?.open(preIds as number[], props.multiple)
}

function handleConfirm(users: any[]) {
  if (!props.multiple) {
    // 单选模式：只取第一个
    const user = users[0]
    if (user) {
      selectedUsers.value = [user]
      internalValue.value = [user.id]
      displayTagValues.value = [user.nickname || String(user.id)]
      emit('update:modelValue', user.id)
      emit('change', user.id, user)
    }
    else {
      handleClear()
    }
  }
  else {
    // 多选模式
    selectedUsers.value = users
    const ids = users.map(u => u.id)
    internalValue.value = ids
    displayTagValues.value = users.map(u => u.nickname || String(u.id))
    emit('update:modelValue', ids)
    emit('change', ids, users)
  }
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
  
  if (!props.multiple) {
    // 单选模式
    const emitValue = keptUsers.length > 0 ? keptUsers[0].id : undefined
    const emitUser = keptUsers.length > 0 ? keptUsers[0] : undefined
    emit('update:modelValue', emitValue)
    emit('change', emitValue, emitUser)
  }
  else {
    // 多选模式
    emit('update:modelValue', internalValue.value)
    emit('change', internalValue.value, selectedUsers.value)
  }
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
    >
      <template #suffix>
        <el-button :icon="Search" link @click="handleOpen" />
        <el-button :icon="CloseBold" link @click="handleClear" />
      </template>
    </el-input-tag>
    <UserInfoMultiPickerDialog ref="pickerRef" :multiple="multiple" @confirm="handleConfirm" />
  </div>
</template>

<style scoped>
.user-select-input {
  width: 100%;
}
</style>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue'

defineOptions({ name: 'PromptDialog' })

const props = defineProps({
  title: { type: String, default: '' },
  content: { type: String, default: '' },
  confirmButtonText: { type: String, default: '确定' },
  cancelButtonText: { type: String, default: '取消' },
  inputPattern: { type: RegExp, default: undefined },
  inputErrorMessage: { type: String, default: '' },
  inputPlaceholder: { type: String, default: '' },
  defaultValue: { type: String, default: '' }
})

const emit = defineEmits<{
  (e: 'confirm', value: string): void
  (e: 'cancel'): void
  (e: 'closed'): void
}>()

const visible = ref(true)
const inputValue = ref(props.defaultValue || '')
const errorMsg = ref('')

function validate(): boolean {
  if (props.inputPattern && !props.inputPattern.test(inputValue.value)) {
    errorMsg.value = props.inputErrorMessage || '输入不合法'
    return false
  }
  errorMsg.value = ''
  return true
}

function onConfirm() {
  if (!validate()) return
  emit('confirm', inputValue.value)
  visible.value = false
}

function onCancel() {
  emit('cancel')
  visible.value = false
}

watchEffect(() => {
  if (!visible.value) {
    // next tick after animation end, but use ElDialog event instead
  }
})
</script>

<template>
  <ElDialog v-model="visible" :title="title" width="420px" @closed="$emit('closed')">
    <div class="mb-[10px] whitespace-pre-line">{{ content }}</div>
    <ElInput
      v-model="inputValue"
      :placeholder="inputPlaceholder"
    />
    <div v-if="errorMsg" class="mt-[6px] text-[var(--el-color-danger)] text-[12px]">{{ errorMsg }}</div>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="onCancel">{{ cancelButtonText }}</ElButton>
        <ElButton type="primary" @click="onConfirm">{{ confirmButtonText }}</ElButton>
      </div>
    </template>
  </ElDialog>
  
</template>

<style scoped>
.dialog-footer { display: flex; justify-content: flex-end; gap: 8px; }
</style>



<script setup lang="ts">
import LevelConfigForm from '@/components/LevelConfig/LevelConfigForm.vue'

/** 陪玩等级配置表单包装器 */
defineOptions({ name: 'CompanionLevelConfigForm' })

const emit = defineEmits(['success'])
const formRef = ref()

function open(type: string, id?: number) {
  formRef.value?.open(type, id)
}

defineExpose({ open })
</script>

<template>
  <LevelConfigForm
    ref="formRef"
    :category-type="1"
    category-label="陪玩"
    category-tag-type="success"
    @success="emit('success')"
  />
</template>

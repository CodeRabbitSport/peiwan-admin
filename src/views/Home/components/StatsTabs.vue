<script lang="ts" setup>
import { computed } from 'vue'

defineOptions({ name: 'StatsTabs' })

interface OptionItem {
  label: string
  value: number | string
}

const props = defineProps<{ options: OptionItem[]; modelValue: number | string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: number | string): void }>()

const value = computed({
  get() {
    return props.modelValue
  },
  set(v: number | string) {
    emit('update:modelValue', v)
  },
})
</script>

<template>
  <el-radio-group v-model="value" size="small">
    <el-radio-button v-for="op in props.options" :key="op.value" :label="op.value">
      {{ op.label }}
    </el-radio-button>
  </el-radio-group>
  
</template>

<style scoped>
</style>


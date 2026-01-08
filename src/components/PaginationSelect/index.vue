<script setup lang="ts">
import PaginationSelect from './src/PaginationSelect.vue'

defineOptions({ name: 'PaginationSelectWrapper' })

// 使用 defineProps 来传递所有属性，包括必需的 api
const props = defineProps<{
  modelValue?: number | string | number[] | string[] | null
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  multiple?: boolean
  api: (params: { pageNo: number, pageSize: number, [key: string]: any }) => Promise<{ list: any[], total: number }>
  labelKey?: string
  valueKey?: string
  pageSize?: number
  extraParams?: Record<string, any>
  width?: string
}>()
</script>

<template>
  <PaginationSelect v-bind="props" />
</template>

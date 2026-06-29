<script setup lang="ts">
import { ProductCategoryApi } from '@/api/gamer/productcategory'
import PaginationSelect from '@/components/PaginationSelect/index.vue'

/** 商品分类选择器 */
defineOptions({ name: 'CategorySelect' })

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  placeholder: '请选择商品分类',
  clearable: true,
  disabled: false,
  multiple: false,
})

const emit = defineEmits(['update:modelValue', 'change'])

interface Props {
  modelValue?: number | null
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  multiple?: boolean
}

const paginationSelectRef = ref()

// 计算属性：用于 v-model 绑定
const selectedValue = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
    emit('change', val)
  },
})

// 暴露刷新方法，允许外部手动刷新
defineExpose({
  refresh: () => {
    paginationSelectRef.value?.refresh()
  },
})
</script>

<template>
  <PaginationSelect
    ref="paginationSelectRef" v-model="selectedValue" :placeholder="placeholder" :clearable="clearable"
    :disabled="disabled" :multiple="multiple" :api="ProductCategoryApi.getProductCategoryPage" label-key="categoryName"
    search-key="categoryName" value-key="id" :page-size="10" class="w-full"
  />
</template>

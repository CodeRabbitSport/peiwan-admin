<script setup lang="ts">
import { ProductCategoryApi } from '@/api/gamer/productcategory'

/** 商品分类选择器 */
defineOptions({ name: 'CategorySelect' })

interface Props {
  modelValue?: number | null
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  multiple?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  placeholder: '请选择商品分类',
  clearable: true,
  disabled: false,
  multiple: false,
})

const emit = defineEmits(['update:modelValue', 'change'])

const categoryOptions = ref<any[]>([])
const loading = ref(false)

// 加载分类选项
async function loadCategoryOptions() {
  loading.value = true
  try {
    const data = await ProductCategoryApi.getProductCategoryPage()
    categoryOptions.value = data.list || []
  }
  catch (error) {
    console.error('加载分类选项失败:', error)
    categoryOptions.value = []
  }
  finally {
    loading.value = false
  }
}

// 计算属性：用于 v-model 绑定
const selectedValue = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
    emit('change', val)
  },
})

// 组件挂载时加载数据
onMounted(() => {
  loadCategoryOptions()
})

// 暴露刷新方法，允许外部手动刷新
defineExpose({
  refresh: loadCategoryOptions,
})
</script>

<template>
  <el-select
    v-model="selectedValue"
    :placeholder="placeholder"
    :clearable="clearable"
    :disabled="disabled"
    :multiple="multiple"
    :loading="loading"
    class="w-full"
  >
    <el-option
      v-for="category in categoryOptions"
      :key="category.id"
      :label="category.categoryName"
      :value="category.id"
    />
  </el-select>
</template>

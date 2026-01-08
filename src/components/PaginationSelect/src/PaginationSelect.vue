<script setup lang="ts">
import type { ScrollbarDirection } from 'element-plus'

import { ArrowDown, Close } from '@element-plus/icons-vue'

/** 分页下拉选择器 */
defineOptions({ name: 'PaginationSelect' })

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  placeholder: '请选择',
  clearable: true,
  disabled: false,
  multiple: false,
  labelKey: 'name',
  valueKey: 'id',
  pageSize: 20,
  extraParams: () => ({}),
  width: '240px',
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: number | string | number[] | string[] | null): void
  (e: 'change', val: number | string | number[] | string[] | null): void
}>()

interface Props {
  modelValue?: number | string | number[] | string[] | null
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  multiple?: boolean
  // API 请求函数，需要返回 { list: any[], total: number }
  api: (params: { pageNo: number, pageSize: number, [key: string]: any }) => Promise<{ list: any[], total: number }>
  // 选项的 label 字段名
  labelKey?: string
  // 选项的 value 字段名
  valueKey?: string
  // 每页数量
  pageSize?: number
  // 额外的查询参数
  extraParams?: Record<string, any>
  // 下拉框宽度
  width?: string
}

const options = ref<any[]>([])
const loading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const total = ref(0)
const visible = ref(false)

// 计算属性：用于 v-model 绑定
const selectedValue = computed({
  get: () => props.modelValue ?? null,
  set: (val) => {
    const value = val ?? null
    emit('update:modelValue', value)
    emit('change', value)
  },
})

// 获取选中项的显示文本
const selectedLabel = computed(() => {
  if (props.multiple) {
    if (Array.isArray(selectedValue.value) && selectedValue.value.length > 0) {
      return selectedValue.value
        .map((val) => {
          const option = options.value.find(opt => opt[props.valueKey] === val)
          return option ? option[props.labelKey] : val
        })
        .join(', ')
    }
    return ''
  }
  else {
    const option = options.value.find(opt => opt[props.valueKey] === selectedValue.value)
    return option ? option[props.labelKey] : ''
  }
})

// 加载数据
async function loadData(reset = false) {
  if (loading.value || (!hasMore.value && !reset)) {
    return
  }

  loading.value = true
  try {
    currentPage.value++
    const params = {
      pageNo: reset ? 1 : currentPage.value,
      pageSize: props.pageSize,
      ...props.extraParams,
    }
    const data = await props.api(params)
    const newList = data.list || []
    total.value = data.total || 0

    if (reset) {
      options.value = newList
      currentPage.value = 1
    }
    else {
      options.value = [...options.value, ...newList]
    }

    // 判断是否还有更多数据
    hasMore.value = options.value.length < total.value
  }
  catch (error) {
    console.error('加载选项失败:', error)
    if (reset) {
      options.value = []
    }
  }
  finally {
    loading.value = false
  }
}

// 滚动到底部时加载更多
function handleEndReached(direction: ScrollbarDirection) {
  if (direction === 'bottom' && hasMore.value && !loading.value) {
    loadData(false)
  }
}

// 选择选项
function handleSelect(option: any) {
  if (props.multiple) {
    const currentValue = Array.isArray(selectedValue.value) ? [...selectedValue.value] : []
    const optionValue = option[props.valueKey]
    const index = currentValue.indexOf(optionValue)
    if (index > -1) {
      currentValue.splice(index, 1)
    }
    else {
      currentValue.push(optionValue)
    }
    selectedValue.value = currentValue as number[] | string[]
  }
  else {
    selectedValue.value = option[props.valueKey] as number | string
    visible.value = false
  }
}

// 判断选项是否被选中
function isSelected(option: any) {
  if (props.multiple) {
    const currentValue = Array.isArray(selectedValue.value) ? selectedValue.value : ([] as (number | string)[])
    return currentValue.includes(option[props.valueKey] as number | string)
  }
  else {
    return selectedValue.value === option[props.valueKey]
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadData(true)
})

// 监听 extraParams 变化，重新加载数据
watch(
  () => props.extraParams,
  () => {
    loadData(true)
  },
  { deep: true },
)

// 监听下拉框打开，重新加载数据
watch(visible, (val) => {
  if (val) {
    loadData(true)
  }
})

// 暴露刷新方法，允许外部手动刷新
defineExpose({
  refresh: () => loadData(true),
  loadMore: () => loadData(false),
})
</script>

<template>
  <div :style="{ width }" class="pagination-select-wrapper">
    <el-popover
      v-model:visible="visible"
      :width="width"
      placement="bottom-start"
      trigger="click"
      popper-class="pagination-select-popover">
      <template #reference>
        <div
          ref="selectRef"
          class="pagination-select-input"
          :class="{ 'is-disabled': disabled, 'is-multiple': multiple }">
          <div v-if="multiple" class="pagination-select-tags">
            <el-tag
              v-for="(val, index) in (Array.isArray(selectedValue) ? selectedValue : [])"
              :key="index"
              closable
              size="small"
              @close="handleSelect({ [valueKey]: val } as any)">
              {{options.find(opt => opt[valueKey] === val)?.[labelKey] || val}}
            </el-tag>
            <span v-if="!selectedValue || (Array.isArray(selectedValue) && selectedValue.length === 0)"
              class="pagination-select-placeholder">
              {{ placeholder }}
            </span>
          </div>
          <div v-else class="pagination-select-single">
            <span v-if="selectedLabel" class="pagination-select-text">{{ selectedLabel }}</span>
            <span v-else class="pagination-select-placeholder">{{ placeholder }}</span>
          </div>
          <span class="pagination-select-suffix">
            <el-icon v-if="clearable && selectedValue" class="pagination-select-clear"
              @click.stop="selectedValue = (multiple ? [] : null) as any">
              <Close />
            </el-icon>
            <el-icon class="pagination-select-arrow" :class="{ 'is-reverse': visible }">
              <ArrowDown />
            </el-icon>
          </span>
        </div>
      </template>
      <el-scrollbar height="300px" @end-reached="handleEndReached">
        <div class="pagination-select-options">
          <div v-for="option in options" :key="option[valueKey]" class="pagination-select-option"
            :class="{ 'is-selected': isSelected(option), 'is-multiple': multiple }" @click="handleSelect(option)">
            <el-checkbox v-if="multiple" :model-value="isSelected(option)" @click.stop />
            <span class="pagination-select-option-label">{{ option[labelKey] }}</span>
          </div>
          <div v-if="loading && options.length > 0" class="pagination-select-loading">
            加载中...
          </div>
          <div v-if="!hasMore && options.length > 0" class="pagination-select-no-more">
            没有更多数据了
          </div>
          <div v-if="!loading && options.length === 0" class="pagination-select-empty">
            暂无数据
          </div>
        </div>
      </el-scrollbar>
    </el-popover>
  </div>
</template>

<style scoped>
.pagination-select-wrapper {
  position: relative;
}

.pagination-select-input {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 32px;
  padding: 0 30px 0 11px;
  background-color: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  cursor: pointer;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.pagination-select-input:hover:not(.is-disabled) {
  border-color: var(--el-border-color-hover);
}

.pagination-select-input.is-disabled {
  background-color: var(--el-disabled-bg-color);
  border-color: var(--el-disabled-border-color);
  cursor: not-allowed;
  color: var(--el-disabled-text-color);
}

.pagination-select-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  width: 100%;
  padding: 2px 0;
}

.pagination-select-single {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination-select-text {
  color: var(--el-text-color-regular);
}

.pagination-select-placeholder {
  color: var(--el-text-color-placeholder);
}

.pagination-select-suffix {
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-select-clear {
  cursor: pointer;
  color: var(--el-text-color-placeholder);
  transition: color 0.2s;
}

.pagination-select-clear:hover {
  color: var(--el-text-color-regular);
}

.pagination-select-arrow {
  transition: transform 0.3s;
  color: var(--el-text-color-placeholder);
}

.pagination-select-arrow.is-reverse {
  transform: rotate(180deg);
}

.pagination-select-options {
  padding: 4px 0;
}

.pagination-select-option {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.pagination-select-option:hover {
  background-color: var(--el-fill-color-light);
}

.pagination-select-option.is-selected {
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.pagination-select-option.is-multiple {
  gap: 8px;
}

.pagination-select-option-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination-select-loading,
.pagination-select-no-more,
.pagination-select-empty {
  padding: 12px;
  text-align: center;
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}
</style>

<style>
.pagination-select-popover {
  padding: 4px 0 !important;
}
</style>

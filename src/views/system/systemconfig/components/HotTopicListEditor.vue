<template>
  <div class="hot-topic-editor">
    <div class="mb-2 flex items-center justify-between">
      <div class="text-gray-500 text-sm"></div>
      <el-button type="primary" link @click="addItem">
        <Icon icon="ep:plus" class="mr-1" /> 添加条目
      </el-button>
    </div>

    <el-table :data="localList" size="small" border>
      <el-table-column label="排序" width="60" align="center">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="220">
        <template #default="{ row }">
          <el-input v-model="row.name" placeholder="请输入名称" @change="emitChange" />
        </template>
      </el-table-column>
      <el-table-column label="颜色" width="180" align="center">
        <template #default="{ row }">
          <el-color-picker v-model="row.color" @change="emitChange" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center">
        <template #default="{ $index }">
          <el-button link type="primary" @click="moveUp($index)" :disabled="$index === 0">上移</el-button>
          <el-button link type="primary" @click="moveDown($index)" :disabled="$index === localList.length - 1">下移</el-button>
          <el-button link type="danger" @click="removeItem($index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="mt-2 text-gray-400 text-xs">
      提示：排序值越小越靠前；颜色支持 16 进制或预置选择。
    </div>
  </div>
</template>

<script setup lang="ts">
interface HotTopicItem {
  name: string
  color: string
}

const props = defineProps<{
  modelValue: HotTopicItem[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: HotTopicItem[]): void
  (e: 'change', val: HotTopicItem[]): void
}>()

const localList = ref<HotTopicItem[]>([])

watch(
  () => props.modelValue,
  (val) => {
    // 深拷贝，避免直接修改父值
    localList.value = (val || []).map((i) => ({ ...i }))
  },
  { immediate: true, deep: true }
)

const emitChange = () => {
  const normalized = [...localList.value]
    .map((i) => ({ name: i.name || '', color: i.color || '#409EFF' }))
  emit('update:modelValue', normalized)
  emit('change', normalized)
}

const addItem = () => {
  localList.value.push({ name: '', color: '#409EFF' })
  emitChange()
}

const removeItem = (index: number) => {
  localList.value.splice(index, 1)
  emitChange()
}

const moveUp = (index: number) => {
  if (index <= 0) return
  const arr = localList.value
  ;[arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]
  emitChange()
}

const moveDown = (index: number) => {
  const arr = localList.value
  if (index >= arr.length - 1) return
  ;[arr[index + 1], arr[index]] = [arr[index], arr[index + 1]]
  emitChange()
}
</script>

<style scoped>
.hot-topic-editor :deep(.el-table) {
  width: 100%;
}
</style>

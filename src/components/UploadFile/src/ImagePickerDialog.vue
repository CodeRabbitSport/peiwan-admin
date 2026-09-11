<script lang="ts" setup>
import type { UploadRawFile } from 'element-plus'

import { createImageViewer } from '@/components/ImageViewer'
import { useUpload } from '@/components/UploadFile/src/useUpload'
import * as FileApi from '@/api/infra/file'
import { getTenantId } from '@/utils/auth'

defineOptions({ name: 'ImagePickerDialog' })

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    multiple?: boolean
    limit?: number
    directory?: string
    fileSize?: number
    fileType?: string[]
    selectedUrls?: string[]
    tenantId?: number
  }>(),
  {
    multiple: false,
    limit: 1,
    fileSize: 50,
    fileType: () => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    selectedUrls: () => [],
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', urls: string[]): void
}>()

const message = useMessage()

function resolveTenantId() {
  if (props.tenantId != null) return props.tenantId
  const current = getTenantId()
  return current != null && current !== '' ? Number(current) : undefined
}

const { httpRequest } = useUpload(props.directory, props.tenantId)

const loading = ref(false)
const uploading = ref(false)
const list = ref<FileApi.FileRespVO[]>([])
const total = ref(0)
const selected = ref<string[]>([])
const fileInputRef = ref<HTMLInputElement>()
const queryParams = reactive({
  pageNo: 1,
  pageSize: 20,
  path: undefined as string | undefined,
  type: 'image',
  tenantId: undefined as number | undefined,
})

watch(
  () => props.modelValue,
  (visible) => {
    if (!visible) return
    selected.value = [...props.selectedUrls]
    queryParams.pageNo = 1
    queryParams.path = undefined
    queryParams.tenantId = resolveTenantId()
    getList()
  },
)

async function getList() {
  loading.value = true
  try {
    const data = await FileApi.getFilePage(queryParams)
    list.value = (data.list || []).filter((item: FileApi.FileRespVO) =>
      !item.type || item.type.includes('image'),
    )
    total.value = data.total
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  queryParams.pageNo = 1
  getList()
}

function close() {
  emit('update:modelValue', false)
}

function confirm() {
  if (!selected.value.length) {
    message.warning('请选择图片')
    return
  }
  emit('confirm', [...selected.value])
  close()
}

function toggleSelect(item: FileApi.FileRespVO) {
  const i = selected.value.indexOf(item.url)
  if (i >= 0) {
    selected.value.splice(i, 1)
    return
  }
  if (!props.multiple) {
    selected.value = [item.url]
    return
  }
  if (selected.value.length >= props.limit) {
    message.warning(`最多选择 ${props.limit} 张图片`)
    return
  }
  selected.value.push(item.url)
}

function handleDblclick(item: FileApi.FileRespVO) {
  if (props.multiple) {
    toggleSelect(item)
    return
  }
  selected.value = [item.url]
  confirm()
}

function preview(url: string) {
  createImageViewer({
    zIndex: 9999999,
    urlList: [url],
  })
}

async function handleDelete(id: number, url: string) {
  try {
    await message.delConfirm()
    await FileApi.deleteFile(id)
    message.success('删除成功')
    selected.value = selected.value.filter(item => item !== url)
    await getList()
  } catch {}
}

function triggerUpload() {
  fileInputRef.value?.click()
}

function isValidFile(file: File) {
  const imgSize = file.size / 1024 / 1024 < props.fileSize
  const imgType = props.fileType.includes(file.type)
  if (!imgType) message.warning('上传图片不符合所需的格式！')
  if (!imgSize) message.warning(`上传图片大小不能超过 ${props.fileSize}M！`)
  return imgType && imgSize
}

async function handleUploadChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  input.value = ''
  if (!files.length) return

  const valid = files.filter(isValidFile)
  if (!valid.length) return

  uploading.value = true
  try {
    for (const file of valid) {
      const res: any = await httpRequest({ file: file as UploadRawFile } as any)
      const url = res?.data
      if (url) {
        if (!props.multiple) {
          selected.value = [url]
        } else if (!selected.value.includes(url) && selected.value.length < props.limit) {
          selected.value.push(url)
        }
      }
    }
    message.success('上传成功')
    queryParams.pageNo = 1
    await getList()
  } catch {
    message.error('图片上传失败，请您重新上传！')
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="文件管理器"
    width="920px"
    append-to-body
    destroy-on-close
    class="image-picker-dialog"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="toolbar">
      <el-input
        v-model="queryParams.path"
        placeholder="搜索文件名/路径"
        clearable
        class="!w-240px"
        @keyup.enter="handleQuery"
      />
      <el-button @click="handleQuery">搜索</el-button>
      <el-button type="primary" :loading="uploading" @click="triggerUpload">上传图片</el-button>
      <input
        ref="fileInputRef"
        type="file"
        hidden
        :accept="fileType.join(',')"
        :multiple="multiple"
        @change="handleUploadChange"
      >
    </div>

    <div v-loading="loading || uploading" class="body">
      <el-empty v-if="!loading && !list.length" description="暂无图片" />
      <div v-else class="grid">
        <div
          v-for="item in list"
          :key="item.id"
          class="card"
          :class="{ selected: selected.includes(item.url) }"
          @click="toggleSelect(item)"
          @dblclick="handleDblclick(item)"
        >
          <img :src="item.url" class="thumb">
          <div class="name" :title="item.name || item.path">{{ item.name || item.path }}</div>
          <div class="card-actions" @click.stop>
            <el-button link type="primary" @click="preview(item.url)">预览</el-button>
            <el-button link type="danger" @click="handleDelete(item.id, item.url)">删除</el-button>
          </div>
        </div>
      </div>
    </div>

    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <template #footer>
      <span class="mr-12px text-13px text-[var(--el-text-color-secondary)]">已选 {{ selected.length }} 张</span>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" :disabled="!selected.length" @click="confirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.body {
  min-height: 360px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  max-height: 480px;
  overflow: auto;
}

.card {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;

  &.selected {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 1px var(--el-color-primary);
  }

  .thumb {
    width: 100%;
    height: 120px;
    object-fit: contain;
    background: var(--el-fill-color-light);
  }

  .name {
    padding: 4px 8px 0;
    overflow: hidden;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-actions {
    display: flex;
    justify-content: center;
    padding: 0 4px 4px;
  }
}
</style>

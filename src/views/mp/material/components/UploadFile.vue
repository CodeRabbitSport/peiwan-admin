<template>
  <div v-loading="uploading">
    <el-upload
      :action="UPLOAD_URL"
      :headers="HEADERS"
      multiple
      :limit="1"
      :file-list="fileList"
      :data="uploadData"
      :on-error="onUploadError"
      :before-upload="localBeforeUpload"
      :on-success="onUploadSuccess"
      :on-progress="onProgress"
    >
      <el-button type="primary" plain> 点击上传 </el-button>
      <template #tip>
        <span class="el-upload__tip" style="margin-left: 5px">
          <slot></slot>
        </span>
      </template>
    </el-upload>
  </div>
  </template>
<script lang="ts" setup>
import type { UploadProps, UploadUserFile } from 'element-plus'
import {
  HEADERS,
  UPLOAD_URL,
  UploadData,
  UploadType,
  beforeImageUpload,
  beforeVoiceUpload
} from './upload'

const message = useMessage()

const props = defineProps<{ type: UploadType }>()

const accountId = inject<number>('accountId')

const fileList = ref<UploadUserFile[]>([])
const emit = defineEmits<{
  (e: 'uploaded', v: void)
}>()

const uploadData: UploadData = reactive({
  type: UploadType.Image,
  title: '',
  introduction: '',
  accountId: accountId!
})

/** 上传前检查 */
const uploading = ref(false)
const onBeforeUpload = props.type === UploadType.Image ? beforeImageUpload : beforeVoiceUpload
const localBeforeUpload: UploadProps['beforeUpload'] = (file) => {
  const ok = onBeforeUpload(file)
  if (ok !== false) uploading.value = true
  return ok
}

/** 上传成功处理 */
const onUploadSuccess: UploadProps['onSuccess'] = (res: any) => {
  uploading.value = false
  if (res.code !== 0) {
    message.alertError('上传出错：' + res.msg)
    return false
  }

  // 清空上传时的各种数据
  fileList.value = []
  uploadData.title = ''
  uploadData.introduction = ''

  message.notifySuccess('上传成功')
  emit('uploaded')
}

/** 上传失败处理 */
const onUploadError = (err: Error) => {
  uploading.value = false
  message.error('上传失败: ' + err.message)
}

const onProgress: UploadProps['onProgress'] = () => {
  uploading.value = true
}
</script>

<style lang="scss" scoped>
.el-upload__tip {
  margin-left: 5px;
}
</style>

<script lang="ts" setup>
import type { UploadFile, UploadRawFile, UploadRequestOptions } from 'element-plus'

import { UploadFilled } from '@element-plus/icons-vue'

import * as SocialClientApi from '@/api/system/social/client'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

// 消息弹窗

/** 提交表单 */
const emit = defineEmits(['success']); const { t } = useI18n() // 国际化
const message = useMessage() // 定义 success 事件，用于操作成功后的回调

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  name: undefined,
  socialType: undefined,
  userType: undefined,
  clientId: undefined,
  clientSecret: undefined,
  agentId: undefined,
  status: 0,
})

// 授权文件上传相关
const uploadRef = ref()
const authFileList = ref<UploadFile[]>([])
const uploadLoading = ref(false)
const currentFile = ref<File | null>(null)
const formRules = reactive({
  name: [{ required: true, message: '应用名不能为空', trigger: 'blur' }],
  socialType: [{ required: true, message: '社交平台不能为空', trigger: 'blur' }],
  userType: [{ required: true, message: '用户类型不能为空', trigger: 'blur' }],
  clientId: [{ required: true, message: '客户端编号不能为空', trigger: 'blur' }],
  clientSecret: [{ required: true, message: '客户端密钥不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

/** 重置表单 */
function resetForm() {
  formData.value = {
    id: undefined,
    name: undefined,
    socialType: undefined,
    userType: undefined,
    clientId: undefined,
    clientSecret: undefined,
    agentId: undefined,
    status: 0,
  }
  formRef.value?.resetFields()
  // 重置文件上传
  authFileList.value = []
  currentFile.value = null
  uploadLoading.value = false
}

/** 文件上传前的校验 */
function beforeUpload(file: UploadRawFile) {
  const isTxt = file.type === 'text/plain' || file.name.endsWith('.txt')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isTxt) {
    message.error('只能上传 txt 格式的文件!')
    return false
  }
  if (!isLt5M) {
    message.error('文件大小不能超过 5MB!')
    return false
  }
  uploadLoading.value = true
  message.success('正在上传文件，请稍候...')
  return true
}

/** 自定义上传方法 */
async function httpRequest(options: UploadRequestOptions) {
  return new Promise((resolve, reject) => {
    // 传递文件对象，service.ts 会自动转换为 FormData
    SocialClientApi.uploadAuthFile({ file: options.file as File })
      .then((res) => {
        resolve(res)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

/** 文件上传成功 */
function handleUploadSuccess(response: any) {
  uploadLoading.value = false
  message.success('授权文件上传成功')
  // 清空文件列表
  authFileList.value = []
  currentFile.value = null
  console.log('上传结果:', response)
}

/** 文件上传失败 */
function handleUploadError() {
  uploadLoading.value = false
  message.error('授权文件上传失败，请重试')
}

/** 文件移除 */
function handleFileRemove() {
  currentFile.value = null
  authFileList.value = []
}

/** 打开弹窗 */
async function open(type: string, id?: number) {
  dialogVisible.value = true
  dialogTitle.value = t(`action.${type}`)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await SocialClientApi.getSocialClient(id)
    }
    finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 定义 success 事件，用于操作成功后的回调
async function submitForm() {
  // 校验表单
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as SocialClientApi.SocialClientVO
    if (formType.value === 'create') {
      await SocialClientApi.createSocialClient(data)
      message.success(t('common.createSuccess'))
    }
    else {
      await SocialClientApi.updateSocialClient(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  }
  finally {
    formLoading.value = false
  }
}
</script>

<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-form-item label="应用名" prop="name">
        <el-input v-model="formData.name" placeholder="请输入应用名" />
      </el-form-item>
      <el-form-item label="社交平台" prop="socialType">
        <el-radio-group v-model="formData.socialType">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_SOCIAL_TYPE)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="用户类型" prop="userType">
        <el-radio-group v-model="formData.userType">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.USER_TYPE)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="客户端编号" prop="clientId">
        <el-input v-model="formData.clientId" placeholder="请输入客户端编号,对应各平台的appKey" />
      </el-form-item>
      <el-form-item label="客户端密钥" prop="clientSecret">
        <el-input
          v-model="formData.clientSecret"
          placeholder="请输入客户端密钥,对应各平台的appSecret"
        />
      </el-form-item>
      <!-- 授权文件 -->
      <el-form-item v-if="formData!.socialType === 31" label="授权文件">
        <el-upload
          ref="uploadRef"
          :auto-upload="true"
          :limit="1"
          :on-remove="handleFileRemove"
          :before-upload="beforeUpload"
          :http-request="httpRequest"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :disabled="uploadLoading"
          :show-file-list="true"
          accept=".txt"
          :file-list="authFileList"
        >
          <el-button type="primary" :icon="UploadFilled" :loading="uploadLoading">
            {{ uploadLoading ? '上传中...' : '选择 txt 文件' }}
          </el-button>
          <template #tip>
            <div class="el-upload__tip">
              仅支持上传 .txt 格式的授权文件（选择后自动上传）
            </div>
          </template>
        </el-upload>
      </el-form-item>
      <el-form-item v-if="formData!.socialType === 30" label="agentId" prop="agentId">
        <el-input v-model="formData.agentId" placeholder="授权方的网页应用 ID，有则填" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">
        确 定
      </el-button>
      <el-button @click="dialogVisible = false">
        取 消
      </el-button>
    </template>
  </Dialog>
</template>

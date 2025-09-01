<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading">
      <el-form-item label="配置键名" prop="configKey">
        <el-input v-model="formData.configKey" placeholder="请输入配置键名" />
      </el-form-item>
      <el-form-item label="配置类型" prop="configType">
        <el-radio-group v-model="formData.configType">
          <el-radio value="text">文字</el-radio>
          <el-radio value="image">图片</el-radio>
          <el-radio value="richtext">富文本</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="配置值" prop="configValue">
        <!-- 文字类型 -->
        <el-input
          v-if="formData.configType === 'text'"
          v-model="formData.configValue"
          placeholder="请输入配置值(支持长文本)" />
        <!-- 图片类型 -->
        <UploadImg
          v-else-if="formData.configType === 'image'"
          v-model="formData.configValue"
          :height="'200px'"
          :width="'200px'" />
        <!-- 富文本类型 -->
        <Editor
          v-else-if="formData.configType === 'richtext'"
          v-model="formData.configValue"
          :height="'300px'"
          class="w-full" />
      </el-form-item>
      <el-form-item label="配置标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入配置标题" />
      </el-form-item>
      <el-form-item label="配置描述" prop="description">
        <el-input v-model="formData.description" placeholder="请输入配置描述" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { SystemConfigApi, SystemConfig } from '@/api/gamer/systemconfig'
import UploadImg from '@/components/UploadFile/src/UploadImg.vue'
import Editor from '@/components/Editor/src/Editor.vue'

/** 系统配置 表单 */
defineOptions({ name: 'SystemConfigForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  configKey: undefined,
  configValue: undefined,
  configType: 'text',
  title: undefined,
  description: undefined
})
const formRules = reactive({
  configKey: [{ required: true, message: '配置键名不能为空', trigger: 'blur' }],
  title: [{ required: true, message: '配置标题不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await SystemConfigApi.getSystemConfig(id)
      // 根据配置值自动判断配置类型
      if (formData.value.configValue) {
        if (isImageUrl(formData.value.configValue)) {
          formData.value.configType = 'image'
        } else if (isRichText(formData.value.configValue)) {
          formData.value.configType = 'richtext'
        } else {
          formData.value.configType = 'text'
        }
      } else {
        formData.value.configType = 'text'
      }
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as SystemConfig
    if (formType.value === 'create') {
      await SystemConfigApi.createSystemConfig(data)
      message.success(t('common.createSuccess'))
    } else {
      await SystemConfigApi.updateSystemConfig(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

// 判断是否为图片URL
const isImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowerUrl.endsWith(ext));
}

// 判断是否为富文本
const isRichText = (content: string): boolean => {
  if (!content || typeof content !== 'string') return false;
  // 检查是否包含HTML标签
  const htmlTagRegex = /<\/?[a-z][\s\S]*>/i;
  return htmlTagRegex.test(content);
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    configKey: undefined,
    configValue: undefined,
    configType: 'text',
    title: undefined,
    description: undefined
  }
  formRef.value?.resetFields()
}
</script>

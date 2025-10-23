<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="会话ID" prop="conversationId">
        <el-input v-model="formData.conversationId" placeholder="请输入会话ID" />
      </el-form-item>
      <el-form-item label="发送人ID" prop="senderId">
        <el-input v-model="formData.senderId" placeholder="请输入发送人ID" />
      </el-form-item>
      <el-form-item label="发送人类型(1-系统,2-用户)" prop="senderType">
        <el-radio-group v-model="formData.senderType">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="1=text, 2=image, 3=file, 4=audio, 5=video" prop="messageType">
        <el-select v-model="formData.messageType" placeholder="请选择1=text, 2=image, 3=file, 4=audio, 5=video">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="消息内容" prop="messageContent">
        <Editor v-model="formData.messageContent" height="150px" />
      </el-form-item>
      <el-form-item label="附件链接" prop="fileUrl">
        <el-input v-model="formData.fileUrl" placeholder="请输入附件链接" />
      </el-form-item>
      <el-form-item label="原始文件名" prop="fileName">
        <el-input v-model="formData.fileName" placeholder="请输入原始文件名" />
      </el-form-item>
      <el-form-item label="文件大小(字节)" prop="fileSize">
        <el-input v-model="formData.fileSize" placeholder="请输入文件大小(字节)" />
      </el-form-item>
      <el-form-item label="文件MIME类型" prop="mimeType">
        <el-select v-model="formData.mimeType" placeholder="请选择文件MIME类型">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否已读" prop="isRead">
        <el-radio-group v-model="formData.isRead">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="已读时间" prop="readAt">
        <el-date-picker
          v-model="formData.readAt"
          type="date"
          value-format="x"
          placeholder="选择已读时间"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { ConversationMessageApi, ConversationMessage } from '@/api/gamer/conversationmessage'

/** 会话消息 表单 */
defineOptions({ name: 'ConversationMessageForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  conversationId: undefined,
  senderId: undefined,
  senderType: undefined,
  messageType: undefined,
  messageContent: undefined,
  fileUrl: undefined,
  fileName: undefined,
  fileSize: undefined,
  mimeType: undefined,
  isRead: undefined,
  readAt: undefined
})
const formRules = reactive({
  conversationId: [{ required: true, message: '会话ID不能为空', trigger: 'blur' }],
  senderId: [{ required: true, message: '发送人ID不能为空', trigger: 'blur' }],
  senderType: [{ required: true, message: '发送人类型(1-系统,2-用户)不能为空', trigger: 'blur' }],
  messageType: [{ required: true, message: '1=text, 2=image, 3=file, 4=audio, 5=video不能为空', trigger: 'change' }]
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
      formData.value = await ConversationMessageApi.getConversationMessage(id)
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
    const data = formData.value as unknown as ConversationMessage
    if (formType.value === 'create') {
      await ConversationMessageApi.createConversationMessage(data)
      message.success(t('common.createSuccess'))
    } else {
      await ConversationMessageApi.updateConversationMessage(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    conversationId: undefined,
    senderId: undefined,
    senderType: undefined,
    messageType: undefined,
    messageContent: undefined,
    fileUrl: undefined,
    fileName: undefined,
    fileSize: undefined,
    mimeType: undefined,
    isRead: undefined,
    readAt: undefined
  }
  formRef.value?.resetFields()
}
</script>
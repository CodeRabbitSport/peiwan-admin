<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="订单ID" prop="orderId">
        <el-input v-model="formData.orderId" placeholder="请输入订单ID" />
      </el-form-item>
      <el-form-item label="客户ID" prop="customerId">
        <el-input v-model="formData.customerId" placeholder="请输入客户ID" />
      </el-form-item>
      <el-form-item label="接单人ID" prop="sellerId">
        <el-input v-model="formData.sellerId" placeholder="请输入接单人ID" />
      </el-form-item>
      <el-form-item label="最新消息ID" prop="lastMessageId">
        <el-input v-model="formData.lastMessageId" placeholder="请输入最新消息ID" />
      </el-form-item>
      <el-form-item label="最新消息时间" prop="lastMessageAt">
        <el-date-picker
          v-model="formData.lastMessageAt"
          type="date"
          value-format="x"
          placeholder="选择最新消息时间"
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
import { AccOrderConversationApi, AccOrderConversation } from '@/api/gamer/accorderconversation'

/** 陪玩订单会话 表单 */
defineOptions({ name: 'AccOrderConversationForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  orderId: undefined,
  customerId: undefined,
  sellerId: undefined,
  lastMessageId: undefined,
  lastMessageAt: undefined
})
const formRules = reactive({
  orderId: [{ required: true, message: '订单ID不能为空', trigger: 'blur' }],
  customerId: [{ required: true, message: '客户ID不能为空', trigger: 'blur' }],
  sellerId: [{ required: true, message: '接单人ID不能为空', trigger: 'blur' }]
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
      formData.value = await AccOrderConversationApi.getAccOrderConversation(id)
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
    const data = formData.value as unknown as AccOrderConversation
    if (formType.value === 'create') {
      await AccOrderConversationApi.createAccOrderConversation(data)
      message.success(t('common.createSuccess'))
    } else {
      await AccOrderConversationApi.updateAccOrderConversation(data)
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
    orderId: undefined,
    customerId: undefined,
    sellerId: undefined,
    lastMessageId: undefined,
    lastMessageAt: undefined
  }
  formRef.value?.resetFields()
}
</script>
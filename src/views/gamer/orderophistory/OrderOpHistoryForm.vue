<script setup lang="ts">
import type { OrderOpHistory } from '@/api/gamer/orderophistory'
import { OrderOpHistoryApi } from '@/api/gamer/orderophistory'

/** 订单操作历史记录 表单 */
defineOptions({ name: 'OrderOpHistoryForm' })

// 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']); const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  orderId: undefined,
  orderType: undefined,
  operateTime: undefined,
  operateContent: undefined,
  operatorId: undefined,
  operatorType: undefined,
  operatorName: undefined,
})
const formRules = reactive({
  orderId: [{ required: true, message: '订单ID不能为空', trigger: 'blur' }],
  orderType: [{ required: true, message: '订单类型: 1=陪玩订单, 2=打手订单不能为空', trigger: 'change' }],
  operateTime: [{ required: true, message: '操作时间不能为空', trigger: 'blur' }],
  operateContent: [{ required: true, message: '操作内容不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

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
      formData.value = await OrderOpHistoryApi.getOrderOpHistory(id)
    }
    finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 定义 success 事件，用于操作成功后的回调
async function submitForm() {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as OrderOpHistory
    if (formType.value === 'create') {
      await OrderOpHistoryApi.createOrderOpHistory(data)
      message.success(t('common.createSuccess'))
    }
    else {
      await OrderOpHistoryApi.updateOrderOpHistory(data)
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

/** 重置表单 */
function resetForm() {
  formData.value = {
    id: undefined,
    orderId: undefined,
    orderType: undefined,
    operateTime: undefined,
    operateContent: undefined,
    operatorId: undefined,
    operatorType: undefined,
    operatorName: undefined,
  }
  formRef.value?.resetFields()
}
</script>

<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="订单ID" prop="orderId">
        <el-input v-model="formData.orderId" placeholder="请输入订单ID" />
      </el-form-item>
      <el-form-item label="订单类型: 1=陪玩订单, 2=打手订单" prop="orderType">
        <el-select v-model="formData.orderType" placeholder="请选择订单类型: 1=陪玩订单, 2=打手订单">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作时间" prop="operateTime">
        <el-date-picker
          v-model="formData.operateTime"
          type="date"
          value-format="x"
          placeholder="选择操作时间"
        />
      </el-form-item>
      <el-form-item label="操作内容" prop="operateContent">
        <Editor v-model="formData.operateContent" height="150px" />
      </el-form-item>
      <el-form-item label="操作人ID" prop="operatorId">
        <el-input v-model="formData.operatorId" placeholder="请输入操作人ID" />
      </el-form-item>
      <el-form-item label="操作人类型: 1=customer, 2=acceptor, 3=admin, 4=system" prop="operatorType">
        <el-select v-model="formData.operatorType" placeholder="请选择操作人类型: 1=customer, 2=acceptor, 3=admin, 4=system">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作人名称" prop="operatorName">
        <el-input v-model="formData.operatorName" placeholder="请输入操作人名称" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" :disabled="formLoading" @click="submitForm">
        确 定
      </el-button>
      <el-button @click="dialogVisible = false">
        取 消
      </el-button>
    </template>
  </Dialog>
</template>

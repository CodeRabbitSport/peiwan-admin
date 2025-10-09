<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="流水号" prop="transactionNo">
        <el-input v-model="formData.transactionNo" placeholder="请输入流水号" />
      </el-form-item>
      <el-form-item label="用户ID" prop="userId">
        <el-input v-model="formData.userId" placeholder="请输入用户ID" />
      </el-form-item>
      <el-form-item label="实际退款时间" prop="transferredAt">
        <el-date-picker
          v-model="formData.transferredAt"
          type="date"
          value-format="x"
          placeholder="选择实际退款时间"
        />
      </el-form-item>
      <el-form-item label="退款保证金金额(分)" prop="transactionAmount">
        <el-input v-model="formData.transactionAmount" placeholder="请输入退款保证金金额(分)" />
      </el-form-item>
      <el-form-item label="预计自动退款时间 = 审核通过时间 + wait_days" prop="autoTransferredAt">
        <el-date-picker
          v-model="formData.autoTransferredAt"
          type="date"
          value-format="x"
          placeholder="选择预计自动退款时间 = 审核通过时间 + wait_days"
        />
      </el-form-item>
      <el-form-item label="是否人工提前退款 0否 1是" prop="isManualTransferred">
        <el-radio-group v-model="formData.isManualTransferred">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="退款状态(0-待审核,1-已通过,2-已拒绝)" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="审核通过时间" prop="approvedAt">
        <el-date-picker
          v-model="formData.approvedAt"
          type="date"
          value-format="x"
          placeholder="选择审核通过时间"
        />
      </el-form-item>
      <el-form-item label="退款等待天数(冗余保存配置，如33)" prop="waitDays">
        <el-input v-model="formData.waitDays" placeholder="请输入退款等待天数(冗余保存配置，如33)" />
      </el-form-item>
      <el-form-item label="转账状态(0-未转账,1-已转账)" prop="transferStatus">
        <el-radio-group v-model="formData.transferStatus">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { DepositTransferApi, DepositTransfer } from '@/api/gamer/deposittransfer'

/** 保证金转入余额订单 表单 */
defineOptions({ name: 'DepositTransferForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  transactionNo: undefined,
  userId: undefined,
  transferredAt: undefined,
  transactionAmount: undefined,
  autoTransferredAt: undefined,
  isManualTransferred: undefined,
  status: undefined,
  approvedAt: undefined,
  waitDays: undefined,
  transferStatus: undefined,
  remark: undefined
})
const formRules = reactive({
  transactionNo: [{ required: true, message: '流水号不能为空', trigger: 'blur' }],
  userId: [{ required: true, message: '用户ID不能为空', trigger: 'blur' }],
  transactionAmount: [{ required: true, message: '退款保证金金额(分)不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '退款状态(0-待审核,1-已通过,2-已拒绝)不能为空', trigger: 'blur' }]
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
      formData.value = await DepositTransferApi.getDepositTransfer(id)
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
    const data = formData.value as unknown as DepositTransfer
    if (formType.value === 'create') {
      await DepositTransferApi.createDepositTransfer(data)
      message.success(t('common.createSuccess'))
    } else {
      await DepositTransferApi.updateDepositTransfer(data)
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
    transactionNo: undefined,
    userId: undefined,
    transferredAt: undefined,
    transactionAmount: undefined,
    autoTransferredAt: undefined,
    isManualTransferred: undefined,
    status: undefined,
    approvedAt: undefined,
    waitDays: undefined,
    transferStatus: undefined,
    remark: undefined
  }
  formRef.value?.resetFields()
}
</script>
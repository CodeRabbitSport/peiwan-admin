<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="提现订单号" prop="no">
        <el-input v-model="formData.no" placeholder="请输入提现订单号" />
      </el-form-item>
      <el-form-item label="用户ID" prop="userId">
        <el-input v-model="formData.userId" placeholder="请输入用户ID" />
      </el-form-item>
      <el-form-item label="提现渠道(1微信收款 2支付宝收款 3银行卡收款 4支付宝账号收款)" prop="channel">
        <el-input v-model="formData.channel" placeholder="请输入提现渠道(1微信收款 2支付宝收款 3银行卡收款 4支付宝账号收款)" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="真实姓名" prop="realName">
        <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
      </el-form-item>
      <el-form-item label="账号(银行卡号/支付宝账号)" prop="accountNo">
        <el-input v-model="formData.accountNo" placeholder="请输入账号(银行卡号/支付宝账号)" />
      </el-form-item>
      <el-form-item label="银行名称(仅银行卡)" prop="bankName">
        <el-input v-model="formData.bankName" placeholder="请输入银行名称(仅银行卡)" />
      </el-form-item>
      <el-form-item label="收款二维码URL" prop="qrCodeUrl">
        <UploadImg v-model="formData.qrCodeUrl" />
      </el-form-item>
      <el-form-item label="微信用户openid（仅微信极速到账需要）" prop="openid">
        <el-input v-model="formData.openid" placeholder="请输入微信用户openid（仅微信极速到账需要）" />
      </el-form-item>
      <el-form-item label="提现金额" prop="amount">
        <el-input v-model="formData.amount" placeholder="请输入提现金额" />
      </el-form-item>
      <el-form-item label="手续费比例(%)" prop="feeRate">
        <el-input v-model="formData.feeRate" placeholder="请输入手续费比例(%)" />
      </el-form-item>
      <el-form-item label="手续费金额" prop="feeAmount">
        <el-input v-model="formData.feeAmount" placeholder="请输入手续费金额" />
      </el-form-item>
      <el-form-item label="实际到账金额" prop="actualAmount">
        <el-input v-model="formData.actualAmount" placeholder="请输入实际到账金额" />
      </el-form-item>
      <el-form-item label="到账类型(1急速到账 2普通到账)" prop="withdrawType">
        <el-radio-group v-model="formData.withdrawType">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="提现状态(0待审核 1审核通过(已打款) 2审核拒绝 3打款失败)" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="提现备注" prop="withdrawRemark">
        <el-input v-model="formData.withdrawRemark" placeholder="请输入提现备注" />
      </el-form-item>
      <el-form-item label="审核拒绝原因" prop="rejectReason">
        <el-input v-model="formData.rejectReason" placeholder="请输入审核拒绝原因" />
      </el-form-item>
      <el-form-item label="转账单编号" prop="payTransferId">
        <el-input v-model="formData.payTransferId" placeholder="请输入转账单编号" />
      </el-form-item>
      <el-form-item label="转账渠道" prop="transferChannelCode">
        <el-input v-model="formData.transferChannelCode" placeholder="请输入转账渠道" />
      </el-form-item>
      <el-form-item label="交易时间" prop="transactionTime">
        <el-date-picker
          v-model="formData.transactionTime"
          type="date"
          value-format="x"
          placeholder="选择交易时间"
        />
      </el-form-item>
      <el-form-item label="转账错误提示" prop="transactionErrorMsg">
        <el-input v-model="formData.transactionErrorMsg" type="textarea" placeholder="请输入转账错误提示" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { WithdrawOrderApi, WithdrawOrder } from '@/api/gamer/withdraworder'

/** 提现订单 表单 */
defineOptions({ name: 'WithdrawOrderForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  no: undefined,
  userId: undefined,
  channel: undefined,
  phone: undefined,
  realName: undefined,
  accountNo: undefined,
  bankName: undefined,
  qrCodeUrl: undefined,
  openid: undefined,
  amount: undefined,
  feeRate: undefined,
  feeAmount: undefined,
  actualAmount: undefined,
  withdrawType: undefined,
  status: undefined,
  withdrawRemark: undefined,
  rejectReason: undefined,
  payTransferId: undefined,
  transferChannelCode: undefined,
  transactionTime: undefined,
  transactionErrorMsg: undefined
})
const formRules = reactive({
  no: [{ required: true, message: '提现订单号不能为空', trigger: 'blur' }],
  userId: [{ required: true, message: '用户ID不能为空', trigger: 'blur' }],
  channel: [{ required: true, message: '提现渠道(1微信收款 2支付宝收款 3银行卡收款 4支付宝账号收款)不能为空', trigger: 'blur' }],
  amount: [{ required: true, message: '提现金额不能为空', trigger: 'blur' }],
  actualAmount: [{ required: true, message: '实际到账金额不能为空', trigger: 'blur' }],
  withdrawType: [{ required: true, message: '到账类型(1急速到账 2普通到账)不能为空', trigger: 'blur' }],
  payTransferId: [{ required: true, message: '转账单编号不能为空', trigger: 'blur' }],
  transferChannelCode: [{ required: true, message: '转账渠道不能为空', trigger: 'blur' }]
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
      formData.value = await WithdrawOrderApi.getWithdrawOrder(id)
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
    const data = formData.value as unknown as WithdrawOrder
    if (formType.value === 'create') {
      await WithdrawOrderApi.createWithdrawOrder(data)
      message.success(t('common.createSuccess'))
    } else {
      await WithdrawOrderApi.updateWithdrawOrder(data)
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
    no: undefined,
    userId: undefined,
    channel: undefined,
    phone: undefined,
    realName: undefined,
    accountNo: undefined,
    bankName: undefined,
    qrCodeUrl: undefined,
    openid: undefined,
    amount: undefined,
    feeRate: undefined,
    feeAmount: undefined,
    actualAmount: undefined,
    withdrawType: undefined,
    status: undefined,
    withdrawRemark: undefined,
    rejectReason: undefined,
    payTransferId: undefined,
    transferChannelCode: undefined,
    transactionTime: undefined,
    transactionErrorMsg: undefined
  }
  formRef.value?.resetFields()
}
</script>
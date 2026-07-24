<script setup lang="ts">
import type { VirtualPaymentRecord } from '@/api/gamer/virtualpayment'
import { VirtualPaymentApi } from '@/api/gamer/virtualpayment'

defineOptions({ name: 'VirtualPaymentForm' })

type FormType = 'create' | 'update' | 'detail'

const emit = defineEmits(['success'])
const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref<FormType>('create')
const formRef = ref()

const defaultFormData = (): VirtualPaymentRecord => ({
  id: undefined,
  userId: undefined,
  openid: undefined,
  type: undefined,
  bizOrderNo: undefined,
  relatedOrderNo: undefined,
  amount: undefined,
  balanceAfter: undefined,
  status: undefined,
  wxOrderId: undefined,
  wxRefundId: undefined,
  requestData: undefined,
  responseData: undefined,
  errorMessage: undefined,
  remark: undefined,
})

const formData = ref<VirtualPaymentRecord>(defaultFormData())
const formRules = reactive({
  userId: [{ required: true, message: '用户 ID 不能为空', trigger: 'blur' }],
  type: [{ required: true, message: '业务类型不能为空', trigger: 'blur' }],
  bizOrderNo: [{ required: true, message: '业务单号不能为空', trigger: 'blur' }],
  amount: [{ required: true, message: '变动金额不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
})

async function open(type: FormType, id?: number) {
  dialogVisible.value = true
  formType.value = type
  dialogTitle.value = type === 'detail' ? '虚拟支付详情' : t(`action.${type}`)
  resetForm()
  if (id != null) {
    formLoading.value = true
    try {
      formData.value = await VirtualPaymentApi.getVirtualPayment(id)
    }
    finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open })

async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate()
  try {
    await message.confirm('确认保存该虚拟支付记录吗？')
    formLoading.value = true
    if (formType.value === 'create') {
      await VirtualPaymentApi.createVirtualPayment(formData.value)
      message.success(t('common.createSuccess'))
    }
    else {
      await VirtualPaymentApi.updateVirtualPayment(formData.value)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  }
  catch {}
  finally {
    formLoading.value = false
  }
}

function resetForm() {
  formData.value = defaultFormData()
  formRef.value?.resetFields()
}
</script>

<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="820px">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      :disabled="formType === 'detail'"
      label-width="120px"
    >
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="用户 ID" prop="userId">
            <el-input-number v-model="formData.userId" :min="1" class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="OpenID" prop="openid">
            <el-input v-model="formData.openid" placeholder="请输入小程序 OpenID" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="业务类型" prop="type">
            <el-select v-model="formData.type" placeholder="请选择业务类型" class="!w-full">
              <el-option label="充值" value="RECHARGE" />
              <el-option label="代币支付" value="CURRENCY_PAY" />
              <el-option label="取消支付" value="CURRENCY_CANCEL" />
              <el-option label="赠送" value="PRESENT" />
              <el-option label="退款" value="REFUND" />
              <el-option label="后台增加" value="ADMIN_ADJUST_IN" />
              <el-option label="后台扣减" value="ADMIN_ADJUST_OUT" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="formData.status" placeholder="请选择状态" class="!w-full">
              <el-option label="待处理" value="PENDING" />
              <el-option label="成功" value="SUCCESS" />
              <el-option label="失败" value="FAILED" />
              <el-option label="已关闭" value="CLOSED" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="业务单号" prop="bizOrderNo">
            <el-input v-model="formData.bizOrderNo" placeholder="请输入业务单号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="关联单号" prop="relatedOrderNo">
            <el-input v-model="formData.relatedOrderNo" placeholder="请输入关联单号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="变动金额(分)" prop="amount">
            <el-input-number v-model="formData.amount" class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="变动后余额(分)" prop="balanceAfter">
            <el-input-number v-model="formData.balanceAfter" class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="微信订单号" prop="wxOrderId">
            <el-input v-model="formData.wxOrderId" placeholder="请输入微信订单号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="微信退款单号" prop="wxRefundId">
            <el-input v-model="formData.wxRefundId" placeholder="请输入微信退款单号" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="错误信息" prop="errorMessage">
            <el-input v-model="formData.errorMessage" type="textarea" :rows="2" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="请求数据" prop="requestData">
            <el-input v-model="formData.requestData" type="textarea" :rows="3" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="响应数据" prop="responseData">
            <el-input v-model="formData.responseData" type="textarea" :rows="3" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="formData.remark" type="textarea" :rows="2" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button
        v-if="formType !== 'detail'"
        type="primary"
        :disabled="formLoading"
        @click="submitForm"
      >
        确 定
      </el-button>
      <el-button @click="dialogVisible = false">
        关 闭
      </el-button>
    </template>
  </Dialog>
</template>

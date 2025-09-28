<script setup lang="ts">
import type { DepositRecharge } from '@/api/gamer/depositrecharge'
import { DepositRechargeApi } from '@/api/gamer/depositrecharge'

/** 会员保证金充值 表单 */
defineOptions({ name: 'DepositRechargeForm' })

// 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success'])
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
  totalPrice: undefined,
  payPrice: undefined,
  bonusPrice: undefined,
  packageId: undefined,
  payStatus: undefined,
  payOrderId: undefined,
  payChannelCode: undefined,
  payTime: undefined,
  payRefundId: undefined,
  refundTotalPrice: undefined,
  refundPayPrice: undefined,
  refundBonusPrice: undefined,
  refundTime: undefined,
  refundStatus: undefined,
})
const formRules = reactive({
  no: [{ required: true, message: '流水号不能为空', trigger: 'blur' }],
  userId: [{ required: true, message: '用户编号不能为空', trigger: 'blur' }],
  totalPrice: [{ required: true, message: '用户实际到账余额，例如充 100 送 20，则该值是 120不能为空', trigger: 'blur' }],
  payPrice: [{ required: true, message: '实际支付金额不能为空', trigger: 'blur' }],
  bonusPrice: [{ required: true, message: '钱包赠送金额不能为空', trigger: 'blur' }],
  payStatus: [{ required: true, message: '是否已支付：[0:未支付 1:已经支付过]不能为空', trigger: 'blur' }],
  refundTotalPrice: [{ required: true, message: '退款金额，包含赠送金额不能为空', trigger: 'blur' }],
  refundPayPrice: [{ required: true, message: '退款支付金额不能为空', trigger: 'blur' }],
  refundBonusPrice: [{ required: true, message: '退款钱包赠送金额不能为空', trigger: 'blur' }],
  refundStatus: [{ required: true, message: '退款状态不能为空', trigger: 'blur' }],
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
      formData.value = await DepositRechargeApi.getDepositRecharge(id)
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
    const data = formData.value as unknown as DepositRecharge
    if (formType.value === 'create') {
      await DepositRechargeApi.createDepositRecharge(data)
      message.success(t('common.createSuccess'))
    }
    else {
      await DepositRechargeApi.updateDepositRecharge(data)
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
    no: undefined,
    userId: undefined,
    totalPrice: undefined,
    payPrice: undefined,
    bonusPrice: undefined,
    packageId: undefined,
    payStatus: undefined,
    payOrderId: undefined,
    payChannelCode: undefined,
    payTime: undefined,
    payRefundId: undefined,
    refundTotalPrice: undefined,
    refundPayPrice: undefined,
    refundBonusPrice: undefined,
    refundTime: undefined,
    refundStatus: undefined,
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
      label-width="120px"
    >
      <el-form-item label="流水号" prop="no">
        <el-input v-model="formData.no" placeholder="请输入流水号" />
      </el-form-item>
      <el-form-item label="用户编号" prop="userId">
        <el-input v-model="formData.userId" placeholder="请输入用户编号" />
      </el-form-item>
      <el-divider>金额信息</el-divider>
      <el-row :gutter="12">
        <el-col :span="8">
          <el-form-item label="到账金额" prop="totalPrice">
            <el-input v-model="formData.totalPrice" placeholder="请输入到账金额" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="实付金额" prop="payPrice">
            <el-input v-model="formData.payPrice" placeholder="请输入实付金额" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="赠送金额" prop="bonusPrice">
            <el-input v-model="formData.bonusPrice" placeholder="请输入赠送金额" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="充值套餐编号" prop="packageId">
        <el-input v-model="formData.packageId" placeholder="请输入充值套餐编号" />
      </el-form-item>
      <el-divider>支付信息</el-divider>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="支付状态" prop="payStatus">
            <el-radio-group v-model="formData.payStatus">
              <el-radio :value="1">
                已支付
              </el-radio>
              <el-radio :value="0">
                未支付
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="支付渠道" prop="payChannelCode">
            <el-input v-model="formData.payChannelCode" placeholder="请输入支付渠道" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="订单编号" prop="payOrderId">
            <el-input v-model="formData.payOrderId" placeholder="请输入订单编号" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="时间(支付/退款)">
            <div class="w-full flex items-center gap-2">
              <el-date-picker
                v-model="formData.payTime"
                type="date"
                value-format="x"
                placeholder="选择支付时间"
                class="w-1/2"
              />
              <el-date-picker
                v-model="formData.refundTime"
                type="date"
                value-format="x"
                placeholder="选择退款时间"
                class="w-1/2"
              />
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-divider>退款信息</el-divider>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="退款单号" prop="payRefundId">
            <el-input v-model="formData.payRefundId" placeholder="请输入退款单号" />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="退款金额(总/实付/赠送)" prop="refundTotalPrice">
            <el-input
              v-model="formData.refundTotalPrice"
              placeholder="请输入总退款金额"
              class="mr-2 w-1/3"
            />
            <el-input
              v-model="formData.refundPayPrice"
              placeholder="请输入退款实付金额"
              class="mr-2 w-1/3"
            />
            <el-input
              v-model="formData.refundBonusPrice"
              placeholder="请输入退款赠送金额"
              class="w-1/3"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="退款状态" prop="refundStatus">
            <el-radio-group v-model="formData.refundStatus">
              <el-radio :value="1">
                成功
              </el-radio>
              <el-radio :value="0">
                未退款
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
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

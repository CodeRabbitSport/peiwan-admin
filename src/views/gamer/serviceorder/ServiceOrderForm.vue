<script setup lang="ts">
import type { ServiceOrder } from '@/api/gamer/serviceorder'
import { ServiceOrderApi } from '@/api/gamer/serviceorder'

/** 用户订单 表单 */
defineOptions({ name: 'ServiceOrderForm' })

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
  orderNo: undefined,
  userId: undefined,
  acceptorId: undefined,
  acceptTime: undefined,
  orderRemark: undefined,
  productId: undefined,
  productName: undefined,
  productPicUrl: undefined,
  productPrice: undefined,
  orderStatus: undefined,
  totalAmount: undefined,
  discountAmount: undefined,
  couponAmount: undefined,
  actualAmount: undefined,
  platformFee: undefined,
  acceptorAmount: undefined,
  userCouponId: undefined,
  couponId: undefined,
  deadlineTime: undefined,
  startTime: undefined,
  completeTime: undefined,
  confirmTime: undefined,
  payStatus: undefined,
  payTime: undefined,
  payChannelCode: undefined,
  payOrderId: undefined,
  cancelReason: undefined,
  cancelTime: undefined,
  cancelUserId: undefined,
  refundApplyReason: undefined,
  refundApplyTime: undefined,
  refundAuditStatus: undefined,
  refundAuditReason: undefined,
  refundAuditTime: undefined,
  refundAuditUserId: undefined,
  refundAmount: undefined,
  refundTime: undefined,
  payRefundId: undefined,
})
const formRules = reactive({
  // orderNo: [{ required: true, message: '订单号不能为空', trigger: 'blur' }],
  // userId: [{ required: true, message: '请选择用户', trigger: 'change' }],
  // productId: [{ required: true, message: '商品ID不能为空', trigger: 'blur' }],
  // productName: [{ required: true, message: '商品名称不能为空', trigger: 'blur' }],
  // productPrice: [{ required: true, message: '商品价格不能为空', trigger: 'blur' }],
  // orderStatus: [{ required: true, message: '请选择订单状态', trigger: 'change' }],
  // totalAmount: [{ required: true, message: '总金额不能为空', trigger: 'blur' }],
  // actualAmount: [{ required: true, message: '实付金额不能为空', trigger: 'blur' }],
  // platformFee: [{ required: true, message: '平台手续费不能为空', trigger: 'blur' }],
  // acceptorAmount: [{ required: true, message: '接单金额不能为空', trigger: 'blur' }],
  // payStatus: [{ required: true, message: '请选择支付状态', trigger: 'change' }],
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
      formData.value = await ServiceOrderApi.getServiceOrder(id)
    }
    finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 定义 success 事件，用于操作成功后的回调
async function submitForm() {
  dialogVisible.value = false

  return
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as ServiceOrder
    if (formType.value === 'create') {
      await ServiceOrderApi.createServiceOrder(data)
      message.success(t('common.createSuccess'))
    }
    else {
      await ServiceOrderApi.updateServiceOrder(data)
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
    orderNo: undefined,
    userId: undefined,
    acceptorId: undefined,
    acceptTime: undefined,
    orderRemark: undefined,
    productId: undefined,
    productName: undefined,
    productPicUrl: undefined,
    productPrice: undefined,
    orderStatus: undefined,
    totalAmount: undefined,
    discountAmount: undefined,
    couponAmount: undefined,
    actualAmount: undefined,
    platformFee: undefined,
    acceptorAmount: undefined,
    userCouponId: undefined,
    couponId: undefined,
    deadlineTime: undefined,
    startTime: undefined,
    completeTime: undefined,
    confirmTime: undefined,
    payStatus: undefined,
    payTime: undefined,
    payChannelCode: undefined,
    payOrderId: undefined,
    cancelReason: undefined,
    cancelTime: undefined,
    cancelUserId: undefined,
    refundApplyReason: undefined,
    refundApplyTime: undefined,
    refundAuditStatus: undefined,
    refundAuditReason: undefined,
    refundAuditTime: undefined,
    refundAuditUserId: undefined,
    refundAmount: undefined,
    refundTime: undefined,
    payRefundId: undefined,
  }
  formRef.value?.resetFields()
}
</script>

<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" align-center>
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="84px"
    >
      <el-form-item label="订单号" prop="orderNo">
        <el-input v-model="formData.orderNo" disabled placeholder="请输入订单号" />
      </el-form-item>

      <!-- <el-form-item label="接单人" prop="acceptorId">
        <UserSelectInput v-model="formData.acceptorId" readonly placeholder="请选择接单人" />
      </el-form-item> -->
      <el-form-item label="商品" prop="productName">
        <el-input v-model="formData.productName" disabled placeholder="请输入商品名称" />
      </el-form-item>
      <el-form-item label="价格" prop="productPrice">
        <el-input v-model="formData.productPrice" disabled placeholder="请输入商品价格" />
      </el-form-item>
      <el-form-item label="订单状态" prop="orderStatus">
        <el-select v-model="formData.orderStatus" disabled placeholder="请选择订单状态" clearable class="!w-[240px]">
          <el-option label="待支付" :value="0" />
          <el-option label="进行中" :value="1" />
          <el-option label="已完成" :value="2" />
          <el-option label="已取消" :value="3" />
          <el-option label="退款中" :value="4" />
          <el-option label="已退款" :value="5" />
        </el-select>
      </el-form-item>
      <el-form-item label="支付状态" prop="payStatus">
        <el-select v-model="formData.payStatus" disabled placeholder="请选择支付状态" clearable class="!w-[240px]">
          <el-option label="未支付" :value="0" />
          <el-option label="已支付" :value="1" />
          <el-option label="已退款" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="订单备注" prop="orderRemark">
        <el-input v-model="formData.orderRemark" disabled type="textarea" placeholder="请输入取消原因" />
      </el-form-item>
      <el-form-item label="退款原因" prop="refundApplyReason">
        <el-input v-model="formData.refundApplyReason" disabled type="textarea" placeholder="请输入取消原因" />
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

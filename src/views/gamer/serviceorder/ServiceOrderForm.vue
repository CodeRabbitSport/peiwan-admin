<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="订单号" prop="orderNo">
        <el-input v-model="formData.orderNo" placeholder="请输入订单号" />
      </el-form-item>
      <el-form-item label="下单用户ID" prop="userId">
        <el-input v-model="formData.userId" placeholder="请输入下单用户ID" />
      </el-form-item>
      <el-form-item label="接单人用户ID" prop="acceptorId">
        <el-input v-model="formData.acceptorId" placeholder="请输入接单人用户ID" />
      </el-form-item>
      <el-form-item label="接单时间" prop="acceptTime">
        <el-date-picker
          v-model="formData.acceptTime"
          type="date"
          value-format="x"
          placeholder="选择接单时间"
        />
      </el-form-item>
      <el-form-item label="商品ID" prop="productId">
        <el-input v-model="formData.productId" placeholder="请输入商品ID" />
      </el-form-item>
      <el-form-item label="商品名称" prop="productName">
        <el-input v-model="formData.productName" placeholder="请输入商品名称" />
      </el-form-item>
      <el-form-item label="商品图片URL" prop="productPicUrl">
        <UploadImg v-model="formData.productPicUrl" />
      </el-form-item>
      <el-form-item label="商品价格" prop="productPrice">
        <el-input v-model="formData.productPrice" placeholder="请输入商品价格" />
      </el-form-item>
      <el-form-item label="订单状态：0-待支付 1-已支付待接单 2-进行中 3-已完成 4-已取消 5-退款中 6-已退款" prop="orderStatus">
        <el-radio-group v-model="formData.orderStatus">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="订单总金额" prop="totalAmount">
        <el-input v-model="formData.totalAmount" placeholder="请输入订单总金额" />
      </el-form-item>
      <el-form-item label="优惠金额" prop="discountAmount">
        <el-input v-model="formData.discountAmount" placeholder="请输入优惠金额" />
      </el-form-item>
      <el-form-item label="优惠券优惠金额" prop="couponAmount">
        <el-input v-model="formData.couponAmount" placeholder="请输入优惠券优惠金额" />
      </el-form-item>
      <el-form-item label="实际支付金额" prop="actualAmount">
        <el-input v-model="formData.actualAmount" placeholder="请输入实际支付金额" />
      </el-form-item>
      <el-form-item label="平台手续费" prop="platformFee">
        <el-input v-model="formData.platformFee" placeholder="请输入平台手续费" />
      </el-form-item>
      <el-form-item label="接单人获得金额" prop="acceptorAmount">
        <el-input v-model="formData.acceptorAmount" placeholder="请输入接单人获得金额" />
      </el-form-item>
      <el-form-item label="使用的用户优惠券ID" prop="userCouponId">
        <el-input v-model="formData.userCouponId" placeholder="请输入使用的用户优惠券ID" />
      </el-form-item>
      <el-form-item label="优惠券ID" prop="couponId">
        <el-input v-model="formData.couponId" placeholder="请输入优惠券ID" />
      </el-form-item>
      <el-form-item label="订单截止时间(预留字段)" prop="deadlineTime">
        <el-date-picker
          v-model="formData.deadlineTime"
          type="date"
          value-format="x"
          placeholder="选择订单截止时间(预留字段)"
        />
      </el-form-item>
      <el-form-item label="订单开始执行时间" prop="startTime">
        <el-date-picker
          v-model="formData.startTime"
          type="date"
          value-format="x"
          placeholder="选择订单开始执行时间"
        />
      </el-form-item>
      <el-form-item label="接单人完成时间(状态变为3时记录)" prop="completeTime">
        <el-date-picker
          v-model="formData.completeTime"
          type="date"
          value-format="x"
          placeholder="选择接单人完成时间(状态变为3时记录)"
        />
      </el-form-item>
      <el-form-item label="用户确认完成时间(状态变为4时记录)" prop="confirmTime">
        <el-date-picker
          v-model="formData.confirmTime"
          type="date"
          value-format="x"
          placeholder="选择用户确认完成时间(状态变为4时记录)"
        />
      </el-form-item>
      <el-form-item label="支付状态：0-未支付 1-已支付 2-已退款" prop="payStatus">
        <el-radio-group v-model="formData.payStatus">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="支付时间" prop="payTime">
        <el-date-picker
          v-model="formData.payTime"
          type="date"
          value-format="x"
          placeholder="选择支付时间"
        />
      </el-form-item>
      <el-form-item label="支付渠道编码" prop="payChannelCode">
        <el-input v-model="formData.payChannelCode" placeholder="请输入支付渠道编码" />
      </el-form-item>
      <el-form-item label="支付订单ID" prop="payOrderId">
        <el-input v-model="formData.payOrderId" placeholder="请输入支付订单ID" />
      </el-form-item>
      <el-form-item label="取消原因" prop="cancelReason">
        <el-input v-model="formData.cancelReason" placeholder="请输入取消原因" />
      </el-form-item>
      <el-form-item label="取消时间" prop="cancelTime">
        <el-date-picker
          v-model="formData.cancelTime"
          type="date"
          value-format="x"
          placeholder="选择取消时间"
        />
      </el-form-item>
      <el-form-item label="取消操作人ID" prop="cancelUserId">
        <el-input v-model="formData.cancelUserId" placeholder="请输入取消操作人ID" />
      </el-form-item>
      <el-form-item label="退款申请原因" prop="refundApplyReason">
        <el-input v-model="formData.refundApplyReason" placeholder="请输入退款申请原因" />
      </el-form-item>
      <el-form-item label="退款申请时间" prop="refundApplyTime">
        <el-date-picker
          v-model="formData.refundApplyTime"
          type="date"
          value-format="x"
          placeholder="选择退款申请时间"
        />
      </el-form-item>
      <el-form-item label="退款审核状态：1-审核通过 2-审核拒绝" prop="refundAuditStatus">
        <el-radio-group v-model="formData.refundAuditStatus">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="退款审核原因(拒绝时填写)" prop="refundAuditReason">
        <el-input v-model="formData.refundAuditReason" placeholder="请输入退款审核原因(拒绝时填写)" />
      </el-form-item>
      <el-form-item label="退款审核时间" prop="refundAuditTime">
        <el-date-picker
          v-model="formData.refundAuditTime"
          type="date"
          value-format="x"
          placeholder="选择退款审核时间"
        />
      </el-form-item>
      <el-form-item label="退款审核人ID" prop="refundAuditUserId">
        <el-input v-model="formData.refundAuditUserId" placeholder="请输入退款审核人ID" />
      </el-form-item>
      <el-form-item label="退款金额" prop="refundAmount">
        <el-input v-model="formData.refundAmount" placeholder="请输入退款金额" />
      </el-form-item>
      <el-form-item label="退款时间" prop="refundTime">
        <el-date-picker
          v-model="formData.refundTime"
          type="date"
          value-format="x"
          placeholder="选择退款时间"
        />
      </el-form-item>
      <el-form-item label="退款订单ID" prop="payRefundId">
        <el-input v-model="formData.payRefundId" placeholder="请输入退款订单ID" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { ServiceOrderApi, ServiceOrder } from '@/api/gamer/serviceorder'

/** 用户订单 表单 */
defineOptions({ name: 'ServiceOrderForm' })

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
  payRefundId: undefined
})
const formRules = reactive({
  orderNo: [{ required: true, message: '订单号不能为空', trigger: 'blur' }],
  userId: [{ required: true, message: '下单用户ID不能为空', trigger: 'blur' }],
  productId: [{ required: true, message: '商品ID不能为空', trigger: 'blur' }],
  productName: [{ required: true, message: '商品名称不能为空', trigger: 'blur' }],
  productPrice: [{ required: true, message: '商品价格不能为空', trigger: 'blur' }],
  orderStatus: [{ required: true, message: '订单状态：0-待支付 1-已支付待接单 2-进行中 3-已完成 4-已取消 5-退款中 6-已退款不能为空', trigger: 'blur' }],
  totalAmount: [{ required: true, message: '订单总金额不能为空', trigger: 'blur' }],
  discountAmount: [{ required: true, message: '优惠金额不能为空', trigger: 'blur' }],
  couponAmount: [{ required: true, message: '优惠券优惠金额不能为空', trigger: 'blur' }],
  actualAmount: [{ required: true, message: '实际支付金额不能为空', trigger: 'blur' }],
  platformFee: [{ required: true, message: '平台手续费不能为空', trigger: 'blur' }],
  acceptorAmount: [{ required: true, message: '接单人获得金额不能为空', trigger: 'blur' }],
  payStatus: [{ required: true, message: '支付状态：0-未支付 1-已支付 2-已退款不能为空', trigger: 'blur' }]
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
      formData.value = await ServiceOrderApi.getServiceOrder(id)
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
    const data = formData.value as unknown as ServiceOrder
    if (formType.value === 'create') {
      await ServiceOrderApi.createServiceOrder(data)
      message.success(t('common.createSuccess'))
    } else {
      await ServiceOrderApi.updateServiceOrder(data)
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
    orderNo: undefined,
    userId: undefined,
    acceptorId: undefined,
    acceptTime: undefined,
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
    payRefundId: undefined
  }
  formRef.value?.resetFields()
}
</script>

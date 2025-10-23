<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="订单编号" prop="orderNo">
        <el-input v-model="formData.orderNo" placeholder="请输入订单编号" />
      </el-form-item>
      <el-form-item label="赠送人ID" prop="senderId">
        <el-input v-model="formData.senderId" placeholder="请输入赠送人ID" />
      </el-form-item>
      <el-form-item label="被赠送人ID" prop="receiverId">
        <el-input v-model="formData.receiverId" placeholder="请输入被赠送人ID" />
      </el-form-item>
      <el-form-item label="礼物ID" prop="giftId">
        <el-input v-model="formData.giftId" placeholder="请输入礼物ID" />
      </el-form-item>
      <el-form-item label="礼物名称" prop="giftName">
        <el-input v-model="formData.giftName" placeholder="请输入礼物名称" />
      </el-form-item>
      <el-form-item label="礼物图片URL" prop="giftImage">
        <UploadImg v-model="formData.giftImage" />
      </el-form-item>
      <el-form-item label="平台抽成比例" prop="giftRate">
        <el-input v-model="formData.giftRate" placeholder="请输入平台抽成比例" />
      </el-form-item>
      <el-form-item label="数量" prop="quantity">
        <el-input v-model="formData.quantity" placeholder="请输入数量" />
      </el-form-item>
      <el-form-item label="订单总金额，单位：分" prop="totalAmount">
        <el-input v-model="formData.totalAmount" placeholder="请输入订单总金额，单位：分" />
      </el-form-item>
      <el-form-item label="优惠券优惠金额，单位：分" prop="couponAmount">
        <el-input v-model="formData.couponAmount" placeholder="请输入优惠券优惠金额，单位：分" />
      </el-form-item>
      <el-form-item label="实际支付金额，单位：分" prop="actualAmount">
        <el-input v-model="formData.actualAmount" placeholder="请输入实际支付金额，单位：分" />
      </el-form-item>
      <el-form-item label="平台抽成费用，单位：分" prop="platformFee">
        <el-input v-model="formData.platformFee" placeholder="请输入平台抽成费用，单位：分" />
      </el-form-item>
      <el-form-item label="订单过期时间" prop="expireTime">
        <el-date-picker
          v-model="formData.expireTime"
          type="date"
          value-format="x"
          placeholder="选择订单过期时间"
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
      <el-form-item label="退款状态" prop="refundStatus">
        <el-radio-group v-model="formData.refundStatus">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
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
      <el-form-item label="退款金额，单位：分" prop="refundAmount">
        <el-input v-model="formData.refundAmount" placeholder="请输入退款金额，单位：分" />
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
      <el-form-item label="关联业务ID" prop="bizId">
        <el-input v-model="formData.bizId" placeholder="请输入关联业务ID" />
      </el-form-item>
      <el-form-item label="业务来源类型(10-打手主页,20-服务订单,30-服务订单私聊,40-私聊)" prop="bizType">
        <el-select v-model="formData.bizType" placeholder="请选择业务来源类型(10-打手主页,20-服务订单,30-服务订单私聊,40-私聊)">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { GiftOrderApi, GiftOrder } from '@/api/gamer/giftorder'

/** 礼物赠送订单 表单 */
defineOptions({ name: 'GiftOrderForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  orderNo: undefined,
  senderId: undefined,
  receiverId: undefined,
  giftId: undefined,
  giftName: undefined,
  giftImage: undefined,
  giftRate: undefined,
  quantity: undefined,
  totalAmount: undefined,
  couponAmount: undefined,
  actualAmount: undefined,
  platformFee: undefined,
  expireTime: undefined,
  payStatus: undefined,
  payTime: undefined,
  payChannelCode: undefined,
  payOrderId: undefined,
  refundStatus: undefined,
  refundApplyReason: undefined,
  refundApplyTime: undefined,
  refundAmount: undefined,
  refundTime: undefined,
  payRefundId: undefined,
  bizId: undefined,
  bizType: undefined
})
const formRules = reactive({
  orderNo: [{ required: true, message: '订单编号不能为空', trigger: 'blur' }],
  senderId: [{ required: true, message: '赠送人ID不能为空', trigger: 'blur' }],
  receiverId: [{ required: true, message: '被赠送人ID不能为空', trigger: 'blur' }],
  giftId: [{ required: true, message: '礼物ID不能为空', trigger: 'blur' }],
  giftName: [{ required: true, message: '礼物名称不能为空', trigger: 'blur' }],
  giftRate: [{ required: true, message: '平台抽成比例不能为空', trigger: 'blur' }],
  totalAmount: [{ required: true, message: '订单总金额，单位：分不能为空', trigger: 'blur' }],
  couponAmount: [{ required: true, message: '优惠券优惠金额，单位：分不能为空', trigger: 'blur' }],
  actualAmount: [{ required: true, message: '实际支付金额，单位：分不能为空', trigger: 'blur' }],
  platformFee: [{ required: true, message: '平台抽成费用，单位：分不能为空', trigger: 'blur' }],
  expireTime: [{ required: true, message: '订单过期时间不能为空', trigger: 'blur' }],
  payStatus: [{ required: true, message: '支付状态：0-未支付 1-已支付 2-已退款不能为空', trigger: 'blur' }],
  bizType: [{ required: true, message: '业务来源类型(10-打手主页,20-服务订单,30-服务订单私聊,40-私聊)不能为空', trigger: 'change' }]
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
      formData.value = await GiftOrderApi.getGiftOrder(id)
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
    const data = formData.value as unknown as GiftOrder
    if (formType.value === 'create') {
      await GiftOrderApi.createGiftOrder(data)
      message.success(t('common.createSuccess'))
    } else {
      await GiftOrderApi.updateGiftOrder(data)
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
    senderId: undefined,
    receiverId: undefined,
    giftId: undefined,
    giftName: undefined,
    giftImage: undefined,
    giftRate: undefined,
    quantity: undefined,
    totalAmount: undefined,
    couponAmount: undefined,
    actualAmount: undefined,
    platformFee: undefined,
    expireTime: undefined,
    payStatus: undefined,
    payTime: undefined,
    payChannelCode: undefined,
    payOrderId: undefined,
    refundStatus: undefined,
    refundApplyReason: undefined,
    refundApplyTime: undefined,
    refundAmount: undefined,
    refundTime: undefined,
    payRefundId: undefined,
    bizId: undefined,
    bizType: undefined
  }
  formRef.value?.resetFields()
}
</script>
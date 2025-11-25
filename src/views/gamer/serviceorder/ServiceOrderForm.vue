<script setup lang="ts">
import type { OrderOpHistory } from '@/api/gamer/orderophistory'
import { OrderOpHistoryApi } from '@/api/gamer/orderophistory'
import type { ServiceOrder } from '@/api/gamer/serviceorder'
import { ServiceOrderApi } from '@/api/gamer/serviceorder'
import { fenToYuan } from '@/utils'
import { dateFormatter } from '@/utils/formatTime'

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
const orderOpHistoryList = ref<OrderOpHistory[]>([]) // 订单操作历史列表
const orderOpHistoryLoading = ref(false) // 订单操作历史加载中
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

/** 获取订单操作历史 */
async function getOrderOpHistory(orderId: number) {
  orderOpHistoryLoading.value = true
  try {
    const data = await OrderOpHistoryApi.getOrderOpHistoryList({
      orderId,
    })
    orderOpHistoryList.value = data.list || []
  }
  catch {
    orderOpHistoryList.value = []
  }
  finally {
    orderOpHistoryLoading.value = false
  }
}

/** 格式化订单类型 */
function formatOrderType(orderType: number) {
  switch (orderType) {
    case 1:
      return { text: '陪玩订单', type: 'success' }
    case 2:
      return { text: '打手订单', type: 'primary' }
    default:
      return { text: '未知', type: 'info' }
  }
}

/** 格式化操作人类型 */
function formatOperatorType(operatorType: number) {
  switch (operatorType) {
    case 1:
      return { text: '用户', type: 'info' }
    case 2:
      return { text: '接单人', type: 'warning' }
    case 3:
      return { text: '管理员', type: 'danger' }
    case 4:
      return { text: '系统', type: 'success' }
    default:
      return { text: '未知', type: 'info' }
  }
}

/** 格式化订单状态 */
function formatOrderStatus(orderStatus: number) {
  switch (orderStatus) {
    case 0:
      return { text: '待支付', type: 'info' }
    case 1:
      return { text: '进行中', type: 'primary' }
    case 2:
      return { text: '已完成', type: 'success' }
    case 3:
      return { text: '已取消', type: 'info' }
    case 4:
      return { text: '退款中', type: 'danger' }
    case 5:
      return { text: '已退款', type: 'warning' }
    default:
      return { text: '未知', type: 'info' }
  }
}

/** 打开弹窗 */
async function open(type: string, id?: number) {
  dialogVisible.value = true
  dialogTitle.value = '订单详情'
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await ServiceOrderApi.getServiceOrder(id)
      // 获取订单操作历史
      await getOrderOpHistory(id)
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
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="90%" align-center>
    <div v-loading="formLoading" class="flex flex-col gap-6">
      <!-- 商品信息 -->
      <div>
        <h3 class="mb-4 text-lg font-semibold">
          商品信息
        </h3>
        <el-table :data="formData.id ? [formData] : []" border>
          <el-table-column label="商品ID" align="center" prop="productId" width="100" />
          <el-table-column label="名称" align="center" prop="productName" min-width="200" />
          <el-table-column label="图片" align="center" width="100">
            <template #default="scope">
              <el-image
                v-if="scope.row.productPicUrl"
                :src="scope.row.productPicUrl"
                fit="cover"
                style="width: 60px; height: 60px"
              />
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="数量" align="center" width="80">
            <template #default>
              1
            </template>
          </el-table-column>
          <el-table-column label="实际价" align="center" width="120">
            <template #default="scope">
              {{ scope.row.actualAmount != null ? fenToYuan(scope.row.actualAmount) : '-' }}
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" width="100">
            <template #default="scope">
              <el-tag
                v-if="scope.row.orderStatus === 5 || scope.row.payStatus === 2"
                type="warning"
              >
                已退款
              </el-tag>
              <el-tag
                v-else
                :type="formatOrderStatus(scope.row.orderStatus || 0).type"
              >
                {{ formatOrderStatus(scope.row.orderStatus || 0).text }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 订单操作日志 -->
      <div>
        <h3 class="mb-4 text-lg font-semibold">
          订单操作日志
        </h3>
        <el-table
          v-loading="orderOpHistoryLoading"
          :data="orderOpHistoryList"
          border
        >
          <el-table-column label="记录ID" align="center" prop="id" width="80" />
          <el-table-column label="操作人" align="center" width="150">
            <template #default="scope">
              <div class="flex flex-col items-center gap-1">
                <el-tag :type="formatOperatorType(scope.row.operatorType || 0).type">
                  {{ formatOperatorType(scope.row.operatorType || 0).text }}
                </el-tag>
                <!-- <span v-if="scope.row.operatorName">{{ scope.row.operatorName }}</span> -->
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作记录" align="center" prop="operateContent" min-width="300" />
          <el-table-column
            label="操作时间"
            align="center"
            prop="operateTime"
            :formatter="dateFormatter"
            width="180"
          />
        </el-table>
      </div>
    </div>
    <template #footer>
      <el-button @click="dialogVisible = false">
        关 闭
      </el-button>
    </template>
  </Dialog>
</template>

<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-[15px]"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px">
      <el-form-item label="订单号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-[240px]" />
      </el-form-item>
      <el-form-item label="用户ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户ID"
          clearable
          @keyup.enter="handleQuery"
          class="!w-[240px]" />
      </el-form-item>
      <el-form-item label="接单人ID" prop="acceptorId">
        <el-input
          v-model="queryParams.acceptorId"
          placeholder="请输入接单人ID"
          clearable
          @keyup.enter="handleQuery"
          class="!w-[240px]" />
      </el-form-item>
      <el-form-item label="接单时间" prop="acceptTime">
        <el-date-picker
          v-model="queryParams.acceptTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-[220px]" />
      </el-form-item>
      <el-form-item label="商品名称" prop="productName">
        <el-input
          v-model="queryParams.productName"
          placeholder="请输入商品名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-[240px]" />
      </el-form-item>
      <el-form-item label="订单状态" prop="orderStatus">
        <el-select
          v-model="queryParams.orderStatus"
          placeholder="请选择订单状态"
          clearable
          class="!w-[240px]">
          <el-option label="待支付" :value="0" />
          <el-option label="待接单" :value="1" />
          <el-option label="进行中" :value="2" />
          <el-option label="已完成" :value="3" />
          <el-option label="已取消" :value="4" />
          <el-option label="退款中" :value="5" />
          <el-option label="已退款" :value="6" />
        </el-select>
      </el-form-item>
      <el-form-item label="支付状态" prop="payStatus">
        <el-select
          v-model="queryParams.payStatus"
          placeholder="请选择支付状态"
          clearable
          class="!w-[240px]">
          <el-option label="未支付" :value="0" />
          <el-option label="已支付" :value="1" />
          <el-option label="已退款" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="退款状态" prop="refundAuditStatus">
        <el-select
          v-model="queryParams.refundAuditStatus"
          placeholder="请选择退款审核状态"
          clearable
          class="!w-[240px]">
          <el-option label="审核通过" :value="1" />
          <el-option label="审核拒绝" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-[220px]" />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" class="mr-[5px]" /> 搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-[5px]" /> 重置
        </el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['gamer:service-order:create']">
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['gamer:service-order:export']">
          <Icon icon="ep:download" class="mr-[5px]" /> 导出
        </el-button>
        <el-button
          type="danger"
          plain
          :disabled="isEmpty(checkedIds)"
          @click="handleDeleteBatch"
          v-hasPermi="['gamer:service-order:delete']">
          <Icon icon="ep:delete" class="mr-[5px]" /> 批量删除
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      row-key="id"
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
      @selection-change="handleRowCheckboxChange">
      <el-table-column type="selection" width="55" />
      <!-- <el-table-column label="订单ID" align="center" prop="id" /> -->
      <el-table-column label="订单号" align="center" prop="orderNo" width="180" />
      <el-table-column label="用户ID" align="center" prop="userId" />
      <el-table-column label="接单人ID" align="center" prop="acceptorId" />
      <el-table-column label="时间" align="center" width="250">
        <template #default="scope">
          <div class="text-left">
            <div v-if="scope.row.acceptTime">接单时间：{{ formatDate(scope.row.acceptTime) || '-' }}</div>
            <div v-if="scope.row.startTime">开始执行：{{ formatDate(scope.row.startTime) || '-' }}</div>
            <div v-if="scope.row.completeTime">完成时间：{{ formatDate(scope.row.completeTime) || '-' }}</div>
            <div v-if="scope.row.confirmTime">确认完成：{{ formatDate(scope.row.confirmTime) || '-' }}</div>
            <div v-if="scope.row.payTime">支付时间：{{ formatDate(scope.row.payTime) || '-' }}</div>
            <div v-if="scope.row.cancelTime">取消时间：{{ formatDate(scope.row.cancelTime) || '-' }}</div>
            <div v-if="scope.row.refundApplyTime">退款申请：{{ formatDate(scope.row.refundApplyTime) || '-' }}</div>
            <div v-if="scope.row.refundTime">退款时间：{{ formatDate(scope.row.refundTime) || '-' }}</div>
            <div v-if="scope.row.createTime">创建时间：{{ formatDate(scope.row.createTime) || '-' }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="商品名称" align="center" prop="productName" />
      <el-table-column label="金额" align="center" width="180">
        <template #default="scope">
          <div class="text-left">
            <div>价格：{{ scope.row.productPrice != null ? (scope.row.productPrice / 100) : '-' }}</div>
            <div>订单总金额：{{ scope.row.totalAmount != null ? (scope.row.totalAmount / 100) : '-' }}</div>
            <div>实际支付金额：{{ scope.row.actualAmount != null ? (scope.row.actualAmount / 100) : '-' }}</div>
            <div>平台手续费：{{ scope.row.platformFee != null ? (scope.row.platformFee / 100) : '-' }}</div>
            <div>接单人获得金额：{{ scope.row.acceptorAmount != null ? (scope.row.acceptorAmount / 100) : '-' }}</div>
            <div v-if="scope.row.refundAmount > 0">退款金额：{{ scope.row.refundAmount != null ? scope.row.refundAmount : '-' }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="订单状态" align="center" prop="orderStatus">
        <template #default="scope">
          <el-tag
            :type="formatOrderStatus(scope.row.orderStatus).color"
            effect="plain">
            {{ formatOrderStatus(scope.row.orderStatus).text }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- 金额明细已合并到“金额”列 -->
      <!-- <el-table-column label="使用的用户优惠券ID" align="center" prop="userCouponId" />
      <el-table-column label="优惠券ID" align="center" prop="couponId" /> -->
      <!-- 时间明细已合并到“时间”列 -->
      <el-table-column label="支付状态" align="center" prop="payStatus">
        <template #default="scope">
          <el-tag
            :type="formatPayStatus(scope.row.payStatus).color"
            effect="plain">
            {{ formatPayStatus(scope.row.payStatus).text }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- 支付时间 已合并到“时间”列 -->
      <el-table-column label="支付渠道" align="center" prop="payChannelCode" />
      <el-table-column label="取消原因" align="center" prop="cancelReason" />
      <!-- 取消时间 已合并到“时间”列 -->
      <el-table-column label="退款原因" align="center" prop="refundApplyReason" />
      <!-- 退款申请时间 已合并到“时间”列 -->
      <el-table-column label="退款状态" align="center" prop="refundAuditStatus">
        <template #default="scope">
          <el-tag
            v-if="scope.row.refundAuditStatus != 0"
            :type="formatRefundAuditStatus(scope.row.refundAuditStatus)?.color"
            effect="plain">
            {{ formatRefundAuditStatus(scope.row.refundAuditStatus)?.text }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- <el-table-column label="退款审核原因" align="center" prop="refundAuditReason" /> -->
      <!-- 退款金额 已合并到“金额”列 -->
      <!-- 退款时间、创建时间 已合并到“时间”列 -->
      <el-table-column label="操作" align="center" fixed="right" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['gamer:service-order:update']">
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['gamer:service-order:delete']">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination :total="total" v-model:page="queryParams.pageNo" v-model:limit="queryParams.pageSize"
      @pagination="getList" />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <ServiceOrderForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { dateFormatter, formatDate } from '@/utils/formatTime'
import download from '@/utils/download'
import { ServiceOrderApi, ServiceOrder } from '@/api/gamer/serviceorder'
import ServiceOrderForm from './ServiceOrderForm.vue'

/** 用户订单 列表 */
defineOptions({ name: 'ServiceOrder' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<ServiceOrder[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  orderNo: undefined,
  userId: undefined,
  acceptorId: undefined,
  acceptTime: [],
  productId: undefined,
  productName: undefined,
  orderStatus: undefined,
  deadlineTime: [],
  startTime: [],
  completeTime: [],
  confirmTime: [],
  payStatus: undefined,
  payTime: [],
  payChannelCode: undefined,
  payOrderId: undefined,
  cancelTime: [],
  cancelUserId: undefined,
  refundApplyTime: [],
  refundAuditStatus: undefined,
  refundAuditTime: [],
  refundAuditUserId: undefined,
  refundTime: [],
  payRefundId: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await ServiceOrderApi.getServiceOrderPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await ServiceOrderApi.deleteServiceOrder(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch { }
}

/** 批量删除用户订单 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await ServiceOrderApi.deleteServiceOrderList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch { }
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: ServiceOrder[]) => {
  checkedIds.value = records.map((item) => item.id);
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await ServiceOrderApi.exportServiceOrder(queryParams)
    download.excel(data, '用户订单.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

function formatRefundAuditStatus(value: number): any {
  switch (value) {
    case 1:
      return { text: '审核通过', color: 'success' }
    case 2:
      return { text: '审核拒绝', color: 'danger' }
    default:
      return { text: '', color: 'primary' }
  }
}

function formatPayStatus(value: number): any {
  switch (value) {
    case 0:
      return { text: '未支付', color: 'primary' }
    case 1:
      return { text: '已支付', color: 'success' }
    case 2:
      return { text: '已退款', color: 'danger' }
  }
}

function formatOrderStatus(value: number): any {
  switch (value) {
    case 0:
      return { text: '待支付', color: 'primary' }
    case 1:
      return { text: '待接单', color: 'warning' }
    case 2:
      return { text: '进行中', color: 'info' }
    case 3:
      return { text: '已完成', color: 'success' }
    case 4:
      return { text: '已取消', color: 'danger' }
    case 5:
      return { text: '退款中', color: 'warning' }
    case 6:
      return { text: '已退款', color: 'success' }
    default:
      return { text: '未知状态', color: 'primary' }
  }
}
/** 初始化 **/
onMounted(() => {
  getList()
})
</script>

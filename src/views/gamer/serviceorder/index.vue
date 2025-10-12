<script setup lang="ts">
import { ProductApi } from '@/api/gamer/product'
import type { ServiceOrder } from '@/api/gamer/serviceorder'
import { acceptOrder, ServiceOrderApi } from '@/api/gamer/serviceorder'
import UserSelectInput from '@/components/UserSelectInput/index.vue'
import UserInfoPickerDialog from '@/components/UserSelectInput/UserInfoPickerDialog.vue'
import download from '@/utils/download'
import { formatDate } from '@/utils/formatTime'
import { isEmpty } from '@/utils/is'

import ServiceOrderForm from './ServiceOrderForm.vue'

/** 用户订单 列表 */
defineOptions({ name: 'ServiceOrder' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<ServiceOrder[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive<any>({
  pageNo: 1,
  pageSize: 10,
  orderNo: undefined,
  userId: undefined,
  acceptorId: undefined,
  acceptTime: [],
  productId: undefined,
  productName: undefined,
  orderStatus: undefined,
  acceptorStatus: undefined,
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
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中
const productOptions = ref<{ label: string, value: string }[]>([])
const selectedOrderStatus = ref<string | number | undefined>(undefined)

const refundDialogVisible = ref(false)
const refundFormLoading = ref(false)
const refundForm = reactive<{ orderId?: number, auditStatus?: 1 | 2, auditReason?: string }>({})

function openRefundDialog(row: any) {
  refundForm.orderId = row.id
  refundForm.auditStatus = undefined
  refundForm.auditReason = ''
  refundDialogVisible.value = true
}

async function submitRefundAudit() {
  if (!refundForm.orderId || !refundForm.auditStatus) return
  if (refundForm.auditStatus === 2 && !refundForm.auditReason) {
    return message.warning('请填写拒绝原因')
  }
  refundFormLoading.value = true
  try {
    await ServiceOrderApi.auditRefund({
      orderId: refundForm.orderId,
      auditStatus: refundForm.auditStatus,
      auditReason: refundForm.auditStatus === 2 ? refundForm.auditReason : undefined,
    })
    message.success('审核成功')
    refundDialogVisible.value = false
    await getList()
  }
  finally {
    refundFormLoading.value = false
  }
}

/** 查询列表 */
async function getList() {
  loading.value = true
  try {
    const data = await ServiceOrderApi.getServiceOrderPage(queryParams)
    list.value = data.list
    total.value = data.total
  }
  finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  queryFormRef.value.resetFields()
  selectedOrderStatus.value = undefined
  queryParams.acceptorStatus = undefined
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
function openForm(type: string, id?: number) {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
async function handleDelete(id: number) {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await ServiceOrderApi.deleteServiceOrder(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  }
  catch { }
}
const checkedIds = ref<number[]>([])

/** 批量删除用户订单 */
async function handleDeleteBatch() {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await ServiceOrderApi.deleteServiceOrderList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  }
  catch { }
}

function handleRowCheckboxChange(records: ServiceOrder[]) {
  checkedIds.value = records.map(item => item.id)
}

async function loadProductOptions() {
  try {
    const { list = [] } = await ProductApi.getProductPage()
    productOptions.value = list
      .filter((item: any) => item?.productTitle)
      .map((item: any) => ({ label: item.productTitle, value: item.productTitle }))
  }
  catch { }
}

function handleOrderStatusFilterChange(value: string | number | undefined) {
  selectedOrderStatus.value = value
  if (value === 'dispatching') {
    queryParams.orderStatus = 1
    queryParams.acceptorStatus = 0
  }
  else if (value === 'inProgress') {
    queryParams.orderStatus = 1
    queryParams.acceptorStatus = 1
  }
  else {
    queryParams.orderStatus = value as number | undefined
    queryParams.acceptorStatus = undefined
  }
}

/** 导出按钮操作 */
async function handleExport() {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await ServiceOrderApi.exportServiceOrder(queryParams)
    download.excel(data, '用户订单.xls')
  }
  catch {
  }
  finally {
    exportLoading.value = false
  }
}

// function formatRefundAuditStatus(value: number): any {
//   switch (value) {
//     case 1:
//       return { text: '审核通过', color: 'success' }
//     case 2:
//       return { text: '审核拒绝', color: 'danger' }
//     default:
//       return { text: '', color: 'primary' }
//   }
// }

const acceptorStatusMap: Record<number, { text: string, color: string }> = {
  0: { text: '派单中', color: 'warning' },
  1: { text: '已确认接单', color: 'success' },
}

function getOrderStatusTag(row: ServiceOrder): any {
  const { orderStatus, acceptorStatus } = row as any
  if (orderStatus === 1 && acceptorStatus !== undefined && acceptorStatus !== null) {
    return acceptorStatusMap[acceptorStatus] || { text: '进行中', color: 'primary' }
  }

  switch (orderStatus) {
    case 0:
      return { text: '待支付', color: 'info' }
    case 1:
      return { text: '进行中', color: 'primary' }
    case 2:
      return { text: '已完成', color: 'success' }
    case 3:
      return { text: '已取消', color: 'info' }
    case 4:
      return { text: '退款中', color: 'danger' }
    case 5:
      return { text: '已退款', color: 'warning' }
    default:
      return { text: '未知状态', color: 'primary' }
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

function parseJsonEntries(json: any): Array<{ key: string, value: any }> {
  try {
    const obj = typeof json === 'string' ? JSON.parse(json) : json
    if (obj && typeof obj === 'object') {
      return Object.entries(obj).map(([key, value]) => ({ key, value }))
    }
    return []
  }
  catch {
    return []
  }
}

function normalizeJackpot(info: any): { prizeTitle?: string, prizeCover?: string } | null {
  try {
    const obj = typeof info === 'string' ? JSON.parse(info) : info
    if (obj && typeof obj === 'object') {
      return { prizeTitle: (obj as any).prizeTitle, prizeCover: (obj as any).prizeCover }
    }
    return null
  }
  catch {
    return null
  }
}

/** 初始化 */
onMounted(() => {
  loadProductOptions()
  getList()
})

// 指定接单人
const assignPickerRef = ref<InstanceType<typeof UserInfoPickerDialog> | null>(null)
const currentAssignOrderId = ref<number | null>(null)

function openAssignPicker(row: ServiceOrder) {
  currentAssignOrderId.value = row.id
  assignPickerRef.value?.open(undefined, row.categoryType, row.categoryId)
}

async function handleAssignConfirm(user: any) {
  if (!currentAssignOrderId.value) return
  try {
    await acceptOrder({
      captchaVerification: undefined,
      orderId: currentAssignOrderId.value,
      teamId: undefined,
      remark: '指定接单人',
      userId: user.id,
    })
    message.success('指定接单人成功')
    await getList()
  }
  catch {
    message.error('指定接单人失败')
  }
  finally {
    currentAssignOrderId.value = null
  }
}

// 结单证明预览
const voucherPreviewVisible = ref(false)
const voucherPreviewUrl = ref('')
function openVoucherPreview(row: any) {
  const url = row?.completeVoucher
  if (!url) {
    return message.warning('暂无结单证明')
  }
  voucherPreviewUrl.value = url
  voucherPreviewVisible.value = true
}
</script>

<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryFormRef"
      class="-mb-[15px]"
      :model="queryParams"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="订单号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单号"
          clearable
          class="!w-[240px]"
          
        />
      </el-form-item>
      <el-form-item label="用户ID" prop="userId">
        <UserSelectInput
          v-model="queryParams.userId"
          placeholder="请选择用户"
          @change="handleQuery"
        />
      </el-form-item>
      <el-form-item label="接单人ID" prop="acceptorId">
        <UserSelectInput
          v-model="queryParams.acceptorId"
          placeholder="请选择接单人"
          @change="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="接单时间" prop="acceptTime">
        <el-date-picker
          v-model="queryParams.acceptTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-[220px]"
        />
      </el-form-item> -->
      <el-form-item label="商品名称" prop="productName">
        <el-select
          v-model="queryParams.productName"
          placeholder="请选择商品名称"
          filterable
          clearable
          class="!w-[240px]"
          @change="handleQuery"
        >
          <el-option
            v-for="item in productOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="订单状态" prop="orderStatus">
        <el-select
          v-model="selectedOrderStatus"
          placeholder="请选择订单状态"
          clearable
          class="!w-[240px]"
          @change="(val) => { handleOrderStatusFilterChange(val); handleQuery() }"
        >
          <el-option label="待支付" :value="0" />
          <el-option label="派单中" value="dispatching" />
          <el-option label="进行中" value="inProgress" />
          <el-option label="已完成" :value="2" />
          <el-option label="已取消" :value="3" />
          <el-option label="退款中" :value="4" />
          <el-option label="已退款" :value="5" />
        </el-select>
      </el-form-item>
      <el-form-item label="支付状态" prop="payStatus">
        <el-select
          v-model="queryParams.payStatus"
          placeholder="请选择支付状态"
          clearable
          class="!w-[240px]"
        >
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
          class="!w-[240px]"
        >
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
          class="!w-[220px]"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" class="mr-[5px]" /> 搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-[5px]" /> 重置
        </el-button>
        <el-button
          v-hasPermi="['gamer:service-order:create']"
          type="primary"
          plain
          @click="openForm('create')"
        >
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button>
        <el-button
          v-hasPermi="['gamer:service-order:export']"
          type="success"
          plain
          :loading="exportLoading"
          @click="handleExport"
        >
          <Icon icon="ep:download" class="mr-[5px]" /> 导出
        </el-button>
        <el-button
          v-hasPermi="['gamer:service-order:delete']"
          type="danger"
          plain
          :disabled="isEmpty(checkedIds)"
          @click="handleDeleteBatch"
        >
          <Icon icon="ep:delete" class="mr-[5px]" /> 批量删除
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      v-loading="loading"
      row-key="id"
      :data="list"
      :stripe="true"
      @selection-change="handleRowCheckboxChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="订单信息" align="center" width="200px" class-name="col-order-info">
        <template #default="scope">
          <div class="flex flex-col gap-1 text-left">
            <div>
              订单号：{{ scope.row.orderNo || '无' }}
            </div>
            <div>
              订单类型：
              <el-tag
                :type="scope.row.categoryType === 1 ? 'success' : scope.row.categoryType === 2 ? 'primary' : 'info'"
              >
                {{ scope.row.categoryType === 1 ? '陪玩' : scope.row.categoryType === 2 ? '打手' : '未知' }}
              </el-tag>
            </div>
            <div v-if="scope.row.gameCard">
              <div v-for="item in parseJsonEntries(scope.row.gameCard)" :key="item.key">
                {{ item.key }}：{{ item.value }}
              </div>
            </div>
            <div v-if="normalizeJackpot(scope.row.jackpotPrizeInfo)">
              <div class="font-semibold">
                盲盒信息
              </div>
              <div>
                奖品：{{ normalizeJackpot(scope.row.jackpotPrizeInfo)?.prizeTitle || '无' }}
              </div>
              <el-image
                v-if="normalizeJackpot(scope.row.jackpotPrizeInfo)?.prizeCover"
                :src="normalizeJackpot(scope.row.jackpotPrizeInfo)?.prizeCover"
                fit="cover"
                style="width: 60px; height: 60px"
              />
            </div>
            <div>订单金额：{{ scope.row.totalAmount != null ? (scope.row.totalAmount / 100) : '无' }}</div>
            <div>支付金额：{{ scope.row.actualAmount != null ? (scope.row.actualAmount / 100) : '无' }}</div>

            <div v-if="scope.row.refundAmount > 0">
              退款金额：{{ scope.row.refundAmount != null ? scope.row.refundAmount : '无' }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="商品名称" align="center" prop="productName" width="180">
        <template #default="scope">
          <div class="flex flex-col items-center">
            <el-image :src="scope.row.productPicUrl" fit="cover" style="width: 60px; height: 60px" />
            <p class="break-all">
              {{ scope.row.productName || '无' }}
            </p>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="订单时间" align="center" width="250">
        <template #default="scope">
          <div class="text-left">
            <div>
              创建时间：{{ formatDate(scope.row.createTime) || '无' }}
            </div>
            <div>
              支付时间：{{ formatDate(scope.row.payTime) || '无' }}
            </div>
            <div>
              取消时间：{{ formatDate(scope.row.cancelTime) || '无' }}
            </div>
            <div>
              退款申请：{{ formatDate(scope.row.refundApplyTime) || '无' }}
            </div>
            <div>
              退款时间：{{ formatDate(scope.row.refundTime) || '无' }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="订单状态" align="center" prop="orderStatus" width="100px" class-name="col-order-info">
        <template #default="scope">
          <div class="flex flex-col items-center gap-1">
            <el-tag
              :type="getOrderStatusTag(scope.row).color"
              effect="plain"
            >
              {{ getOrderStatusTag(scope.row).text }}
            </el-tag>
            <el-tag
              :type="formatPayStatus(scope.row.payStatus).color"
              effect="plain"
            >
              {{ formatPayStatus(scope.row.payStatus).text }}
            </el-tag>
            <p v-if="scope.row.refundApplyReason">
              退款原因：{{ scope.row.refundApplyReason }}
            </p>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="用户信息" align="center" prop="userId" width="150">
        <template #default="scope">
          <div class="flex flex-col items-center">
            <el-avatar :src="scope.row.avatar" size="small" />
            <span>{{ scope.row.nickname || '无' }}</span>
            <span>{{ scope.row.mobile || '无' }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="下单信息" align="center" width="200px" class-name="col-order-info">
        <template #default="scope">
          <div class="flex flex-col gap-1 text-left">
            <div>游戏区服：{{ scope.row.gameRegion || '无' }}</div>
            <div>订单备注：{{ scope.row.orderRemark || '无' }}</div>
            <div v-if="scope.row.gameCard">
              <div v-for="item in parseJsonEntries(scope.row.gameCard)" :key="item.key">
                {{ item.key }}：{{ item.value }}
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="接单信息" align="center" width="250px">
        <template #default="scope">
          <div
            v-if="Array.isArray(scope.row.acceptorList) && scope.row.acceptorList.length"
            class="flex flex-col items-start gap-2"
          >
            <div v-for="acceptor in scope.row.acceptorList" :key="acceptor.id" class="flex flex-col items-center">
              <el-avatar :src="acceptor.avatar" size="small" />
              <span>{{ acceptor.nickname || '无' }}</span>
              <span>接单时间：{{ acceptor.confirmTime ? formatDate(acceptor.confirmTime) : '无' }}</span>

              <span>
                接单人完成时间：{{ formatDate(scope.row.completeTime) || '无' }}
              </span>
              <span>
                用户确认完成：{{ formatDate(scope.row.confirmTime) || '无' }}
              </span>

              <div>接单人获得金额：{{ scope.row.acceptorAmount != null ? (scope.row.acceptorAmount / 100) : '无' }}</div>
            </div>
          </div>
          <div v-else class="flex items-center justify-center">
            <el-button
              v-hasPermi="['gamer:service-order:update']"
              link
              type="primary"
              @click="openAssignPicker(scope.row)"
            >
              指定接单人
            </el-button>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" fixed="right" width="160px">
        <template #default="scope">
          <el-dropdown trigger="click">
            <el-button link type="primary">
              订单操作
              <Icon icon="ep:arrow-down" class="ml-[4px]" />
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-hasPermi="['gamer:service-order:update']"
                  @click="openForm('update', scope.row.id)"
                >
                  查看
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="scope.row.orderStatus === 4"
                  v-hasPermi="['gamer:service-order:update']"
                  @click="openRefundDialog(scope.row)"
                >
                  退款审核
                </el-dropdown-item>
                <el-dropdown-item @click="openVoucherPreview(scope.row)">
                  查看结单证明
                </el-dropdown-item>
                <el-dropdown-item
                  v-hasPermi="['gamer:service-order:delete']"
                  @click="handleDelete(scope.row.id)"
                >
                  删除
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      v-model:page="queryParams.pageNo" v-model:limit="queryParams.pageSize" :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <ServiceOrderForm ref="formRef" @success="getList" />

  <!-- 指定接单人弹窗 -->
  <UserInfoPickerDialog ref="assignPickerRef" @confirm="handleAssignConfirm" />

  <!-- 退款审核弹窗 -->
  <Dialog v-model="refundDialogVisible" title="退款审核" width="480px">
    <el-form v-loading="refundFormLoading" :model="refundForm" label-width="80px">
      <el-form-item label="审核">
        <el-radio-group v-model="refundForm.auditStatus">
          <el-radio :value="1">
            通过
          </el-radio>
          <el-radio :value="2">
            拒绝
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="refundForm.auditStatus === 2" label="拒绝原因">
        <el-input v-model="refundForm.auditReason" type="textarea" placeholder="请输入拒绝原因" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="refundDialogVisible = false">
        取 消
      </el-button>
      <el-button
        type="primary"
        :disabled="!refundForm.auditStatus || (refundForm.auditStatus === 2 && !refundForm.auditReason)"
        @click="submitRefundAudit"
      >
        确 定
      </el-button>
    </template>
  </Dialog>

  <!-- 结单证明预览 -->
  <Dialog v-model="voucherPreviewVisible" title="结单证明" align-center width="80vw">
    <div class="flex items-center justify-center">
      <el-image
        v-if="voucherPreviewUrl"
        :src="voucherPreviewUrl"
        :preview-src-list="[voucherPreviewUrl]"
        :initial-index="0"
        fit="contain"
        style="max-width: 100%; max-height: 70vh"
      />
    </div>
  </Dialog>
</template>

<style scoped>
:deep(.el-table .col-order-info .cell) {
  white-space: normal;
  overflow: visible;
}
</style>

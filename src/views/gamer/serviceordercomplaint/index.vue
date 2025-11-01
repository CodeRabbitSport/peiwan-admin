<script setup lang="ts">
import { ServiceOrderApi } from '@/api/gamer/serviceorder'
import type { ServiceOrderComplaint } from '@/api/gamer/serviceordercomplaint'
import { ServiceOrderComplaintApi } from '@/api/gamer/serviceordercomplaint'
import { useUserStore } from '@/store/modules/user'
import { fenToYuan } from '@/utils'
import download from '@/utils/download'
import { dateFormatter, formatDate } from '@/utils/formatTime'
import { isEmpty } from '@/utils/is'

import OrderTable from './components/OrderTable.vue'
import ServiceOrderComplaintForm from './ServiceOrderComplaintForm.vue'

/** 订单投诉内容 列表 */
defineOptions({ name: 'ServiceOrderComplaint' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<any[]>([]) // 列表的数据（订单数据）
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  orderId: undefined,
  userId: undefined,
  userType: undefined,
  complaintStatus: 1,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

// 当前登录用户
const userStore = useUserStore()

// 用户类型枚举映射
type TagType = 'success' | 'warning' | 'info' | 'primary' | 'danger'
interface TagMeta { text: string, color: TagType }
const userTypeTagMap: Record<number, TagMeta> = {
  1: { text: '会员', color: 'success' },
  2: { text: '管理员', color: 'warning' },
}
function formatUserTypeTag(value?: number): TagMeta {
  if (value == null) return { text: '-', color: 'info' }
  return userTypeTagMap[value] || { text: String(value), color: 'info' }
}

// 回复投诉对话框
const replyDialogVisible = ref(false)
const replyFormLoading = ref(false)
const replyForm = reactive<{ orderId?: number, content?: string, images: string[] }>({ images: [] })

// 订单详情弹窗
const orderDetailDialogVisible = ref(false)
const orderDetailLoading = ref(false)
const orderDetail = ref<any>({})
const orderDetailList = computed(() => (orderDetail.value && Object.keys(orderDetail.value).length ? [orderDetail.value] : []))

// 投诉列表弹窗
const complaintDialogVisible = ref(false)
const complaintLoading = ref(false)
const complaintList = ref<ServiceOrderComplaint[]>([])
const currentComplaintStatus = ref<number | undefined>(undefined)
async function openComplaintDialog(row: any) {
  complaintDialogVisible.value = true
  complaintLoading.value = true
  try {
    replyForm.orderId = row.id
    currentComplaintStatus.value = row?.complaintStatus
    const data = await ServiceOrderComplaintApi.getServiceOrderComplaintPage({ pageNo: 1, pageSize: 100, orderId: row.id })
    complaintList.value = data.list || []
  }
  finally {
    complaintLoading.value = false
  }
}

watch(complaintDialogVisible, (val) => {
  if (!val) {
    complaintList.value = []
  }
})

// 完成投诉处理弹窗
const completeDialogVisible = ref(false)
const completeFormLoading = ref(false)
const completeForm = reactive<{ orderId?: number, contributeDeduct?: boolean }>({})

function openCompleteDialog() {
  completeForm.orderId = replyForm.orderId
  completeForm.contributeDeduct = undefined
  completeDialogVisible.value = true
}

async function submitComplete() {
  if (!completeForm.orderId) return message.warning('缺少订单ID')
  if (completeForm.contributeDeduct === undefined) return message.warning('请选择是否扣分')
  completeFormLoading.value = true
  try {
    await ServiceOrderComplaintApi.ServiceOrderComplaint_completeComplaint({
      orderId: completeForm.orderId,
      contributeDeduct: !!completeForm.contributeDeduct,
    } as any)
    message.success('处理完成')
    completeDialogVisible.value = false
    currentComplaintStatus.value = 2
    // 处理后刷新投诉列表
    await openComplaintDialog({ id: completeForm.orderId })
  }
  finally {
    completeFormLoading.value = false
  }
}

const acceptorStatusMap: Record<number, { text: string, color: TagType }> = {
  0: { text: '派单中', color: 'warning' },
  1: { text: '已确认接单', color: 'success' },
}

function getOrderStatusTag(row: any): TagMeta {
  const { orderStatus, acceptorStatus } = row || {}
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

function formatPayStatus(value?: number): TagMeta {
  switch (value) {
    case 0:
      return { text: '未支付', color: 'primary' }
    case 1:
      return { text: '已支付', color: 'success' }
    case 2:
      return { text: '已退款', color: 'danger' }
    default:
      return { text: '-', color: 'info' }
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

async function submitReply() {
  if (!replyForm.orderId) return message.warning('缺少订单ID')
  if (!replyForm.content) return message.warning('请输入回复内容')
  replyFormLoading.value = true
  try {
    await ServiceOrderComplaintApi.createServiceOrderComplaint({
      id: 0 as unknown as number,
      orderId: replyForm.orderId,
      userId: userStore.getUser.id,
      // 2-管理员
      userType: 2 as unknown as any,
      content: replyForm.content!,
      images: Array.isArray(replyForm.images) ? JSON.stringify(replyForm.images) : '',
    } as unknown as ServiceOrderComplaint)
    message.success('回复成功')
    replyDialogVisible.value = false
    await getList()
  }
  finally {
    replyFormLoading.value = false
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
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()

// 删除功能此页面不再使用

const checkedIds = ref<number[]>([])

/** 批量删除订单投诉内容 */
async function handleDeleteBatch() {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await ServiceOrderComplaintApi.deleteServiceOrderComplaintList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  }
  catch {}
}

function handleRowCheckboxChange(records: ServiceOrderComplaint[]) {
  checkedIds.value = records.map(item => item.id!)
}

/** 导出按钮操作 */
async function handleExport() {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await ServiceOrderComplaintApi.exportServiceOrderComplaint(queryParams)
    download.excel(data, '订单投诉内容.xls')
  }
  catch {
  }
  finally {
    exportLoading.value = false
  }
}

/** 初始化 */
onMounted(() => {
  getList()
})
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
      <el-form-item label="订单ID" prop="orderId">
        <el-input
          v-model="queryParams.orderId"
          placeholder="订单ID"
          clearable
          class="!w-[240px]"
        />
      </el-form-item>
      <el-form-item label="用户ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="用户ID"
          clearable
          class="!w-[240px]"
        />
      </el-form-item>
      <el-form-item label="投诉状态" prop="userType">
        <el-select
          v-model="queryParams.complaintStatus"
          placeholder="请选择投诉状态"
          clearable
          class="!w-[240px]"
          @change="handleQuery"
        >
          <el-option label="未处理" :value="1" />
          <el-option label="已处理" :value="2" />
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
          v-hasPermi="['gamer:service-order-complaint:export']"
          type="success"
          plain
          :loading="exportLoading"
          @click="handleExport"
        >
          <Icon icon="ep:download" class="mr-[5px]" /> 导出
        </el-button>
        <el-button
          v-hasPermi="['gamer:service-order-complaint:delete']"
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
    <OrderTable :data="list" :loading="loading" @selection-change="handleRowCheckboxChange">
      <template #operations="{ row }">
        <el-button link type="warning" @click="openComplaintDialog(row)">
          查看投诉
        </el-button>
      </template>
    </OrderTable>
    <!-- 分页 -->
    <Pagination
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <ServiceOrderComplaintForm ref="formRef" @success="getList" />

  <!-- 回复投诉弹窗 -->
  <Dialog v-model="replyDialogVisible" title="回复投诉" width="600px" align-center>
    <el-form v-loading="replyFormLoading" :model="replyForm" label-width="80px">
      <el-form-item label="内容">
        <el-input v-model="replyForm.content" type="textarea" :rows="4" placeholder="请输入回复内容" />
      </el-form-item>
      <el-form-item label="图片">
        <UploadImgs v-model="replyForm.images" :limit="6" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="replyDialogVisible = false">
        取 消
      </el-button>
      <el-button type="primary" :disabled="!replyForm.content" @click="submitReply">
        确 定
      </el-button>
    </template>
  </Dialog>

  <!-- 订单详情弹窗 -->
  <Dialog v-model="orderDetailDialogVisible" title="订单详情" width="80vw" align-center>
    <el-table
      v-loading="orderDetailLoading"
      row-key="id"
      :data="orderDetailList"
      :stripe="true"
      :show-overflow-tooltip="true"
    >
      <!-- 订单号 -->
      <el-table-column label="订单号" align="center" prop="orderNo" width="180" />
      <!-- 用户信息 -->
      <el-table-column label="用户信息" align="center" prop="userId" width="150">
        <template #default="scope">
          <div class="flex flex-col items-center">
            <el-avatar :src="scope.row.avatar" size="small" />
            <span>{{ scope.row.nickname || '-' }}</span>
            <span>{{ scope.row.mobile || '-' }}</span>
          </div>
        </template>
      </el-table-column>
      <!-- 接单信息 -->
      <el-table-column label="接单信息" align="center" min-width="220px">
        <template #default="scope">
          <div v-if="Array.isArray(scope.row.acceptorList) && scope.row.acceptorList.length" class="flex flex-col items-start gap-2">
            <div v-for="acceptor in scope.row.acceptorList" :key="acceptor.id" class="flex flex-col items-center">
              <el-avatar :src="acceptor.avatar" size="small" />
              <span>{{ acceptor.nickname || '-' }}</span>
              <span>接单时间：{{ acceptor.confirmTime ? formatDate(acceptor.confirmTime) : '-' }}</span>
              <span>完成时间：{{ acceptor.completeTime ? formatDate(acceptor.completeTime) : '-' }}</span>
            </div>
          </div>
          <div v-else class="flex items-center justify-center">
            <span>-</span>
          </div>
        </template>
      </el-table-column>

      <!-- 下单信息 -->
      <el-table-column label="下单信息" align="center" width="200px" class-name="col-order-info">
        <template #default="scope">
          <div class="flex flex-col gap-1 text-left">
            <div>
              订单类型：{{ scope.row.categoryType === 1 ? '陪玩' : scope.row.categoryType === 2 ? '打手' : '未知' }}
            </div>
            <div v-if="scope.row.gameCard">
              <div v-for="item in parseJsonEntries(scope.row.gameCard)" :key="item.key">
                {{ item.key }}：{{ item.value }}
              </div>
            </div>
            <div v-if="scope.row.gameRegion">
              游戏区服：{{ scope.row.gameRegion }}
            </div>
            <div v-if="normalizeJackpot(scope.row.jackpotPrizeInfo)">
              <div class="font-semibold">
                盲盒信息
              </div>
              <div>
                奖品：{{ normalizeJackpot(scope.row.jackpotPrizeInfo)?.prizeTitle || '-' }}
              </div>
              <el-image
                v-if="normalizeJackpot(scope.row.jackpotPrizeInfo)?.prizeCover"
                :src="normalizeJackpot(scope.row.jackpotPrizeInfo)?.prizeCover"
                fit="cover"
                style="width: 60px; height: 60px"
              />
            </div>
            <div v-if="scope.row.orderRemark">
              订单备注：{{ scope.row.orderRemark || '-' }}
            </div>
          </div>
        </template>
      </el-table-column>
      <!-- 时间 -->
      <el-table-column label="时间" align="center" width="250">
        <template #default="scope">
          <div class="text-left">
            <div v-if="scope.row.acceptTime">
              接单时间：{{ formatDate(scope.row.acceptTime) || '-' }}
            </div>
            <div v-if="scope.row.startTime">
              开始执行：{{ formatDate(scope.row.startTime) || '-' }}
            </div>
            <div v-if="scope.row.completeTime">
              完成时间：{{ formatDate(scope.row.completeTime) || '-' }}
            </div>
            <div v-if="scope.row.confirmTime">
              确认完成：{{ formatDate(scope.row.confirmTime) || '-' }}
            </div>
            <div v-if="scope.row.payTime">
              支付时间：{{ formatDate(scope.row.payTime) || '-' }}
            </div>
            <div v-if="scope.row.cancelTime">
              取消时间：{{ formatDate(scope.row.cancelTime) || '-' }}
            </div>
            <div v-if="scope.row.refundApplyTime">
              退款申请：{{ formatDate(scope.row.refundApplyTime) || '-' }}
            </div>
            <div v-if="scope.row.refundTime">
              退款时间：{{ formatDate(scope.row.refundTime) || '-' }}
            </div>
            <div v-if="scope.row.createTime">
              创建时间：{{ formatDate(scope.row.createTime) || '-' }}
            </div>
          </div>
        </template>
      </el-table-column>
      <!-- 商品名称 -->
      <el-table-column label="商品名称" align="center" prop="productName" />
      <!-- 金额 -->
      <el-table-column label="金额" align="center" width="180">
        <template #default="scope">
          <div class="text-left">
            <div>价格：{{ scope.row.productPrice != null ? fenToYuan(scope.row.productPrice) : '-' }}</div>
            <div>订单总金额：{{ scope.row.totalAmount != null ? fenToYuan(scope.row.totalAmount) : '-' }}</div>
            <div>实际支付金额：{{ scope.row.actualAmount != null ? fenToYuan(scope.row.actualAmount) : '-' }}</div>
            <div>平台手续费：{{ scope.row.platformFee != null ? fenToYuan(scope.row.platformFee) : '-' }}</div>
            <div>接单人获得金额：{{ scope.row.acceptorAmount != null ? fenToYuan(scope.row.acceptorAmount) : '-' }}</div>
            <div v-if="scope.row.refundAmount > 0">
              退款金额：{{ scope.row.refundAmount != null ? fenToYuan(scope.row.refundAmount) : '-' }}
            </div>
          </div>
        </template>
      </el-table-column>
      <!-- 订单状态 -->
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
    </el-table>
    <template #footer>
      <el-button @click="orderDetailDialogVisible = false">
        关 闭
      </el-button>
    </template>
  </Dialog>

  <!-- 投诉列表弹窗 -->
  <Dialog v-if="complaintDialogVisible" v-model="complaintDialogVisible" title="投诉内容" width="80vw" align-center>
    <div class="mb-3">
      <el-button type="primary" class="mr-2" @click="replyDialogVisible = true">
        回复
      </el-button>
      <el-button
        v-if="currentComplaintStatus !== 2" v-hasPermi="['gamer:service-order-complaint:complete']"
        type="success"

        @click="openCompleteDialog"
      >
        完成
      </el-button>
    </div>
    <el-table v-loading="complaintLoading" :data="complaintList" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column type="selection" width="55" />
      <el-table-column label="订单ID" align="center" prop="orderId" width="120" />
      <el-table-column label="用户ID" align="center" prop="userId" />
      <el-table-column label="用户类型" align="center" prop="userType" width="110">
        <template #default="scope">
          <el-tag :type="formatUserTypeTag(scope.row.userType).color" effect="plain">
            {{ formatUserTypeTag(scope.row.userType).text }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="内容" align="center" prop="content" />
      <el-table-column label="图片" align="center" prop="images">
        <template #default="scope">
          <div class="flex flex-wrap gap-2">
            <el-image v-if="scope.row?.images || scope.row?.images !== ''" :src="scope.row?.images.startsWith('[') ? JSON.parse(scope.row?.images || '[]')?.[0] : scope.row?.images" fit="cover" style="width: 60px; height: 60px" :preview-src-list="scope.row?.images.startsWith('[') ? JSON.parse(scope.row?.images || '[]') : [scope.row?.images]" preview-teleported />
            <span v-else>-</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" :formatter="dateFormatter" width="180px" />
    </el-table>
  </Dialog>

  <!-- 完成处理弹窗 -->
  <Dialog v-model="completeDialogVisible" title="完成投诉处理" width="420px" align-center>
    <el-form v-loading="completeFormLoading" :model="completeForm" label-width="100px">
      <el-form-item label="是否扣分">
        <el-radio-group v-model="completeForm.contributeDeduct">
          <el-radio :value="true">
            是
          </el-radio>
          <el-radio :value="false">
            否
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="completeDialogVisible = false">
        取 消
      </el-button>
      <el-button type="primary" :disabled="completeForm.contributeDeduct === undefined" @click="submitComplete">
        确 定
      </el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { formatDate } from '@/utils/formatTime'

type TagType = 'success' | 'warning' | 'info' | 'primary' | 'danger'
interface TagMeta { text: string, color: TagType }

const props = defineProps<{
  data: any[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'selection-change', rows: any[]): void
}>()

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

function handleSelectionChange(rows: any[]) {
  emit('selection-change', rows)
}
</script>

<template>
  <el-table
    :data="props.data"
    :stripe="true"
    :show-overflow-tooltip="true"
    :v-loading="props.loading"
    row-key="id"
    @selection-change="handleSelectionChange"
  >
    <el-table-column type="selection" width="55" />
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
          <div>价格：{{ scope.row.productPrice != null ? (scope.row.productPrice / 100) : '-' }}</div>
          <div>订单总金额：{{ scope.row.totalAmount != null ? (scope.row.totalAmount / 100) : '-' }}</div>
          <div>实际支付金额：{{ scope.row.actualAmount != null ? (scope.row.actualAmount / 100) : '-' }}</div>
          <div>平台手续费：{{ scope.row.platformFee != null ? (scope.row.platformFee / 100) : '-' }}</div>
          <div>接单人获得金额：{{ scope.row.acceptorAmount != null ? (scope.row.acceptorAmount / 100) : '-' }}</div>
          <div v-if="scope.row.refundAmount > 0">
            退款金额：{{ scope.row.refundAmount != null ? scope.row.refundAmount : '-' }}
          </div>
        </div>
      </template>
    </el-table-column>
    <!-- 订单状态 -->
    <el-table-column label="订单状态" align="center" prop="orderStatus" width="100px" class-name="col-order-info">
      <template #default="scope">
        <div class="flex flex-col items-center gap-1">
          <el-tag :type="getOrderStatusTag(scope.row).color" effect="plain">
            {{ getOrderStatusTag(scope.row).text }}
          </el-tag>
          <el-tag :type="formatPayStatus(scope.row.payStatus).color" effect="plain">
            {{ formatPayStatus(scope.row.payStatus).text }}
          </el-tag>
          <p v-if="scope.row.refundApplyReason">
            退款原因：{{ scope.row.refundApplyReason }}
          </p>
        </div>
      </template>
    </el-table-column>
    <!-- 操作插槽 -->
    <el-table-column label="操作" align="center" fixed="right" min-width="160px">
      <template #default="scope">
        <slot name="operations" :row="scope.row" />
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped>
::deep(.el-table .col-order-info .cell) {
  white-space: normal;
  overflow: visible;
}
</style>


<script setup lang="ts">
import { fenToYuan } from '@/utils'
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
            <span>接单时间：{{ acceptor.confirmTime ? formatDate(acceptor.confirmTime) : scope.row.acceptConfirmTime ? formatDate(scope.row.acceptConfirmTime) : '-' }}</span>
            <span>完成时间：{{ formatDate(scope.row.completeTime) || '-' }}</span>
          </div>
        </div>
        <div v-else-if="scope.row.captainId" class="flex flex-col items-center">
          <span>接单人：{{ scope.row.captainId }}</span>
          <span>接单时间：{{ formatDate(scope.row.acceptConfirmTime) || '-' }}</span>
          <span>完成时间：{{ formatDate(scope.row.completeTime) || '-' }}</span>
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
            订单类型：<el-tag type="success">陪玩</el-tag>
          </div>
          <div v-if="scope.row.gameRegion">
            游戏区服：{{ scope.row.gameRegion }}
          </div>
          <div v-if="scope.row.userPickLevel">
            选择等级：{{ scope.row.userPickLevel }}
          </div>
          <div v-if="scope.row.productDuration">
            时长：{{ scope.row.productDuration / 60 }} 小时
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
          <div v-if="scope.row.startTime">
            开始执行：{{ formatDate(scope.row.startTime) || '-' }}
          </div>
          <div v-if="scope.row.startTimeForCustomer">
            用户确认开始：{{ formatDate(scope.row.startTimeForCustomer) || '-' }}
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
          <div v-if="scope.row.differenceAmount > 0">
            差价：{{ scope.row.differenceAmount != null ? fenToYuan(scope.row.differenceAmount) : '-' }}
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


<script setup lang="ts">
import type { LevelApplyAcceptorStats } from '@/api/gamer/levelapply'
import { LevelApplyApi } from '@/api/gamer/levelapply'

/** 查看陪玩数据 弹窗 */
defineOptions({ name: 'CompanionDataDialog' })

const dialogVisible = ref(false)
const loading = ref(false)
const currentUserId = ref<number>()
const currentNickname = ref<string>('')
const stats = ref<LevelApplyAcceptorStats>()

// 接单单数
const acceptCountRow = computed(() => [
  { label: '今日接单', value: stats.value?.todayAcceptCount ?? 0 },
  { label: '昨日接单', value: stats.value?.yesterdayAcceptCount ?? 0 },
  { label: '本周接单', value: stats.value?.currentWeekAcceptCount ?? 0 },
  { label: '上周接单', value: stats.value?.lastWeekAcceptCount ?? 0 },
  { label: '本月接单', value: stats.value?.currentMonthAcceptCount ?? 0 },
  { label: '上月接单', value: stats.value?.lastMonthAcceptCount ?? 0 },
])

// 退单单数
const refundCountRow = computed(() => [
  { label: '今日退单', value: stats.value?.todayRefundCount ?? 0 },
  { label: '昨日退单', value: stats.value?.yesterdayRefundCount ?? 0 },
  { label: '本周退单', value: stats.value?.currentWeekRefundCount ?? 0 },
  { label: '上周退单', value: stats.value?.lastWeekRefundCount ?? 0 },
  { label: '本月退单', value: stats.value?.currentMonthRefundCount ?? 0 },
  { label: '上月退单', value: stats.value?.lastMonthRefundCount ?? 0 },
])

// 接单金额
const acceptAmountRow = computed(() => [
  { label: '今日接单金额', value: stats.value?.todayAcceptAmount ?? 0 },
  { label: '昨日接单金额', value: stats.value?.yesterdayAcceptAmount ?? 0 },
  { label: '本周接单金额', value: stats.value?.currentWeekAcceptAmount ?? 0 },
  { label: '上周接单金额', value: stats.value?.lastWeekAcceptAmount ?? 0 },
  { label: '本月接单金额', value: stats.value?.currentMonthAcceptAmount ?? 0 },
  { label: '上月接单金额', value: stats.value?.lastMonthAcceptAmount ?? 0 },
])

// 退单金额
const refundAmountRow = computed(() => [
  { label: '今日退单金额', value: stats.value?.todayRefundAmount ?? 0 },
  { label: '昨日退单金额', value: stats.value?.yesterdayRefundAmount ?? 0 },
  { label: '本周退单金额', value: stats.value?.currentWeekRefundAmount ?? 0 },
  { label: '上周退单金额', value: stats.value?.lastWeekRefundAmount ?? 0 },
  { label: '本月退单金额', value: stats.value?.currentMonthRefundAmount ?? 0 },
  { label: '上月退单金额', value: stats.value?.lastMonthRefundAmount ?? 0 },
])

// 评分
const ratingRow = computed(() => [
  { label: '接单被评数量', value: stats.value?.ratedCount ?? 0 },
  { label: '一分评分单数', value: stats.value?.star1Count ?? 0 },
  { label: '二分评分单数', value: stats.value?.star2Count ?? 0 },
  { label: '三分评分单数', value: stats.value?.star3Count ?? 0 },
  { label: '四分评分单数', value: stats.value?.star4Count ?? 0 },
  { label: '五分评分单数', value: stats.value?.star5Count ?? 0 },
])

async function loadStats(levelType?: number) {
  if (!currentUserId.value) return
  loading.value = true
  try {
    stats.value = await LevelApplyApi.getAcceptorStats(currentUserId.value, levelType)
  }
  finally {
    loading.value = false
  }
}

/** 打开弹窗 */
async function open(userId: number, nickname?: string, levelType?: number) {
  currentUserId.value = userId
  currentNickname.value = nickname || ''
  stats.value = undefined
  dialogVisible.value = true
  await loadStats(levelType)
}

defineExpose({ open })
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="查看陪玩数据"
    width="1000px"
    :close-on-click-modal="false"
    append-to-body
  >
    <div v-loading="loading">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="m-0 text-lg font-bold">
          数据概览
        </h3>
        <span v-if="currentNickname || currentUserId" class="text-sm text-[#909399]">
          {{ currentNickname || '--' }}（ID：{{ currentUserId }}）
        </span>
      </div>

      <table class="fighter-stat-table">
        <tbody>
          <!-- 接单单数 -->
          <tr class="stat-head">
            <td v-for="item in acceptCountRow" :key="item.label">{{ item.label }}</td>
          </tr>
          <tr>
            <td v-for="item in acceptCountRow" :key="item.label">{{ item.value }}</td>
          </tr>
          <!-- 退单单数 -->
          <tr class="stat-head">
            <td v-for="item in refundCountRow" :key="item.label">{{ item.label }}</td>
          </tr>
          <tr>
            <td v-for="item in refundCountRow" :key="item.label">{{ item.value }}</td>
          </tr>
          <!-- 接单金额 -->
          <tr class="stat-head">
            <td v-for="item in acceptAmountRow" :key="item.label">{{ item.label }}</td>
          </tr>
          <tr>
            <td v-for="item in acceptAmountRow" :key="item.label">{{ item.value }}</td>
          </tr>
          <!-- 退单金额 -->
          <tr class="stat-head">
            <td v-for="item in refundAmountRow" :key="item.label">{{ item.label }}</td>
          </tr>
          <tr>
            <td v-for="item in refundAmountRow" :key="item.label">{{ item.value }}</td>
          </tr>
          <!-- 评分 -->
          <tr class="stat-head">
            <td v-for="item in ratingRow" :key="item.label">{{ item.label }}</td>
          </tr>
          <tr>
            <td v-for="item in ratingRow" :key="item.label">{{ item.value }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">
        关闭
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.fighter-stat-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.fighter-stat-table td {
  width: 16.66%;
  padding: 12px 10px;
  font-size: 14px;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  text-align: left;
}

.fighter-stat-table tr.stat-head td {
  color: #606266;
  background-color: #fafafa;
  font-weight: 500;
}
</style>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'

import {
  getCategoryPercentageList,
  getConversationRate,
  getRechargeAmount,
  getRefundRate,
  getRepeatPurchaseRate,
  getTodayServiceOrderList,
  getUserConsumptionRankList,
  getUserIncomeRankList,
  getWeeklyStatics,
} from '@/api/gamer/statics'

import OrderList from './components/OrderList.vue'
import RankTable from './components/RankTable.vue'
import RateCircle from './components/RateCircle.vue'
import StatsTabs from './components/StatsTabs.vue'
import WeeklyChart from './components/WeeklyChart.vue'

defineOptions({ name: 'Index' })

const loading = ref(true)

// tabs options
const weekTabs = [
  { label: '本周', value: 1 },
  { label: '上周', value: 2 },
]
const rechargeTabs = [
  { label: '本周', value: 1 },
  { label: '上周', value: 2 },
  { label: '本月', value: 3 },
  { label: '上月', value: 4 },
  { label: '全部', value: 5 },
]

const levelTabs = [
  { label: '陪玩', value: 1 },
  { label: '打手', value: 2 },
]

// tab states
const levelType = ref(1)
const weekDateType = ref(1)
const rankDateType = ref(1)
const rateDateType = ref(1)
const rechargeDateType = ref(1)

// recharge and rates
const rechargeAmount = ref(0)
const conversionRate = ref(0)
const repeatPurchaseRate = ref(0)
const refundRate = ref(0)

// weekly statics for charts
interface WeeklyItem {
  time: string
  rechargeAmount: number
  commissionAmount: number
  orderAmount: number
  orderCount: number
}
const weeklyData = ref<WeeklyItem[]>([])

// lists
const incomeRankRows = ref<{ userId: number, nickname: string, amount: number }[]>([])
const consumptionRankRows = ref<{ userId: number, nickname: string, amount: number }[]>([])
const todayOrders = ref<any[]>([])
const categoryPercentages = ref<{ categoryId: number, categoryName: string, orderCount: number, percentage: number }[]>([])

function fenToYuan(value: number): number {
  if (value == null) return 0
  return Math.round((value / 100) * 100) / 100
}

const rechargeAmountDisplay = computed(() => fenToYuan(rechargeAmount.value))

async function fetchRecharge() {
  const data = await getRechargeAmount({ dateType: rechargeDateType.value, levelType: levelType.value })
  rechargeAmount.value = data || 0
}

async function fetchRates() {
  const [c, r, f] = await Promise.all([
    getConversationRate({ dateType: rateDateType.value, levelType: levelType.value }),
    getRepeatPurchaseRate({ dateType: rateDateType.value, levelType: levelType.value }),
    getRefundRate({ dateType: rateDateType.value, levelType: levelType.value }),
  ])
  conversionRate.value = (c || 0) * (c <= 1 ? 100 : 1)
  repeatPurchaseRate.value = (r || 0) * (r <= 1 ? 100 : 1)
  refundRate.value = (f || 0) * (f <= 1 ? 100 : 1)
}

async function fetchWeekly() {
  const data = await getWeeklyStatics({ dateType: weekDateType.value, levelType: levelType.value })
  weeklyData.value = data || []
}

async function fetchRanks() {
  const [income, consumption] = await Promise.all([
    getUserIncomeRankList({ dateType: rankDateType.value, levelType: levelType.value }),
    getUserConsumptionRankList({ dateType: rankDateType.value, levelType: levelType.value }),
  ])
  incomeRankRows.value = income || []
  consumptionRankRows.value = consumption || []
}

async function fetchTodayAndCategory() {
  const [orders, categories] = await Promise.all([
    getTodayServiceOrderList(),
    getCategoryPercentageList({ levelType: levelType.value }),
  ])
  console.log('%c🤪 ~ file: /Users/soya/Desktop/p-admin/src/views/Home/Index.vue:111 [] -> orders : ', 'color: #8396bd', orders)

  todayOrders.value = orders || []
  categoryPercentages.value = categories || []
}

onMounted(async () => {
  await Promise.all([fetchRecharge(), fetchRates(), fetchWeekly(), fetchRanks(), fetchTodayAndCategory()])
  loading.value = false
})

watch([levelType, rechargeDateType], () => fetchRecharge())
watch([levelType, rateDateType], () => fetchRates())
watch([levelType, weekDateType], () => fetchWeekly())
watch([levelType, rankDateType], () => fetchRanks())
watch(levelType, () => fetchTodayAndCategory())
</script>

<template>
  <div class="white-dashboard">
    <el-row class="mb-[12px]" justify="end">
      <StatsTabs v-model="levelType" :options="levelTabs" />
    </el-row>
    <el-row :gutter="12">
      <!-- 左侧：今日订单 + 陪玩占比 -->
      <el-col :xl="6" :lg="6" :md="24" :sm="24" :xs="24" class="mb-[12px]">
        <el-card shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <span>今日订单</span>
            </div>
          </template>
          <OrderList :rows="todayOrders" :avatar-size="32" height="360px" />
        </el-card>

        <el-card class="mt-[12px]" shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <span>陪玩占比</span>
            </div>
          </template>
          <div>
            <div v-for="item in categoryPercentages" :key="item.categoryId" class="mb-[10px]">
              <div class="mb-[4px] flex items-center justify-between text-[13px]">
                <span>{{ item.categoryName }}</span>
                <span>{{ (item.percentage || 0).toFixed(2) }}%</span>
              </div>
              <el-progress :percentage="Number((item.percentage || 0).toFixed(2))" :stroke-width="10" />
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 中间：本周充值 + 指标 + 图表 -->
      <el-col :xl="12" :lg="12" :md="24" :sm="24" :xs="24" class="mb-[12px]">
        <el-card shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <span>本周充值</span>
              <div class="flex items-center">
                <StatsTabs v-model="rechargeDateType" :options="rechargeTabs" />
              </div>
            </div>
          </template>
          <div class="px-[8px] py-[6px]">
            <div class="text-[52px] text-[#FFB800] font-bold leading-none">
              {{ rechargeAmountDisplay }}
            </div>
            <div class="mt-[4px] text-[12px] text-[#999]">
              单位：元
            </div>
          </div>
          <div class="mt-[8px] flex items-center justify-around">
            <RateCircle title="下单率" :value="conversionRate" />
            <RateCircle title="复购率" :value="repeatPurchaseRate" />
            <RateCircle title="退款率" :value="refundRate" />
          </div>
        </el-card>

        <el-card class="mt-[12px]" shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <span>本周销售额</span>
              <div class="flex items-center">
                <StatsTabs v-model="weekDateType" :options="weekTabs" />
              </div>
            </div>
          </template>
          <WeeklyChart :data="weeklyData" height="320px" />
        </el-card>

        <el-card class="mt-[12px]" shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <span>订单量走势</span>
              <div class="flex items-center">
                <StatsTabs v-model="weekDateType" :options="weekTabs" />
              </div>
            </div>
          </template>
          <WeeklyChart :data="weeklyData" mode="countOnly" height="320px" />
        </el-card>
      </el-col>

      <!-- 右侧：排行榜 -->
      <el-col :xl="6" :lg="6" :md="24" :sm="24" :xs="24" class="mb-[12px]">
        <el-card shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <span>陪玩排名</span>
              <div class="flex items-center">
                <StatsTabs v-model="rankDateType" :options="weekTabs" />
              </div>
            </div>
          </template>
          <RankTable :rows="incomeRankRows" height="360px" amount-label="收入(元)" />
        </el-card>
        <el-card class="mt-[12px]" shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <span>老板消费榜</span>
              <div class="flex items-center">
                <StatsTabs v-model="rankDateType" :options="weekTabs" />
              </div>
            </div>
          </template>
          <RankTable :rows="consumptionRankRows" height="360px" amount-label="消费(元)" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.white-dashboard :deep(.el-card) {
  background-color: #ffffff;
}
.white-dashboard {
  color: #303133;
}
</style>

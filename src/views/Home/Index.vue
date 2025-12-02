<script lang="ts" setup>
import type { EChartsOption } from 'echarts'

import dayjs from 'dayjs'

import type { StaticsDashboardRespVO, StaticsOrderPeriodRespVO } from '@/api/gamer/statics'
import {
  getOrderAmountPeriod,
  getOrderSizePeriod,
  getStaticDashboard,
} from '@/api/gamer/statics'
import { Echart } from '@/components/Echart'
import SummaryCard from '@/components/SummaryCard/index.vue'
import { fenToYuan } from '@/utils'

defineOptions({ name: 'Dashboard' })

const message = useMessage()

// 数据加载状态
const dashboardLoading = ref(false)
const amountChartLoading = ref(false)
const sizeChartLoading = ref(false)

const amountChartRef = ref<InstanceType<typeof Echart>>()
const sizeChartRef = ref<InstanceType<typeof Echart>>()

// 大屏数据
const dashboardData = ref<StaticsDashboardRespVO>({})

// 订单金额图表日期筛选
const amountDateFilter = ref<'today' | 'yesterday' | 'last7days' | 'last30days' | 'lastMonth' | 'thisMonth' | 'custom'>('today')
const amountCustomDate = ref<[string, string]>(['', ''])

// 订单数量图表日期筛选
const sizeDateFilter = ref<'today' | 'yesterday' | 'last7days' | 'last30days' | 'lastMonth' | 'thisMonth' | 'custom'>('today')
const sizeCustomDate = ref<[string, string]>(['', ''])

// 图表数据
const orderAmountData = ref<{
  amountList: StaticsOrderPeriodRespVO[]
  refundAmountList: StaticsOrderPeriodRespVO[]
}>({ amountList: [], refundAmountList: [] })

const orderSizeData = ref<{
  amountList: StaticsOrderPeriodRespVO[]
  refundAmountList: StaticsOrderPeriodRespVO[]
}>({ amountList: [], refundAmountList: [] })

// 计算日期范围 - 订单金额图表
function getAmountDateRange() {
  const now = dayjs()
  let startTime: string
  let endTime: string

  switch (amountDateFilter.value) {
    case 'today':
      startTime = now.startOf('day').format('YYYY-MM-DD HH:mm:ss')
      endTime = now.endOf('day').format('YYYY-MM-DD HH:mm:ss')
      break
    case 'yesterday':
      startTime = now.subtract(1, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss')
      endTime = now.subtract(1, 'day').endOf('day').format('YYYY-MM-DD HH:mm:ss')
      break
    case 'last7days':
      startTime = now.subtract(7, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss')
      endTime = now.subtract(1, 'day').endOf('day').format('YYYY-MM-DD HH:mm:ss')
      break
    case 'last30days':
      startTime = now.subtract(30, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss')
      endTime = now.subtract(1, 'day').endOf('day').format('YYYY-MM-DD HH:mm:ss')
      break
    case 'lastMonth':
      startTime = now.subtract(1, 'month').startOf('month').format('YYYY-MM-DD HH:mm:ss')
      endTime = now.subtract(1, 'month').endOf('month').format('YYYY-MM-DD HH:mm:ss')
      break
    case 'thisMonth':
      startTime = now.startOf('month').format('YYYY-MM-DD HH:mm:ss')
      endTime = now.endOf('day').format('YYYY-MM-DD HH:mm:ss')
      break
    case 'custom':
      if (amountCustomDate.value[0] && amountCustomDate.value[1]) {
        startTime = dayjs(amountCustomDate.value[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss')
        endTime = dayjs(amountCustomDate.value[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss')
      }
      else {
        startTime = now.startOf('day').format('YYYY-MM-DD HH:mm:ss')
        endTime = now.endOf('day').format('YYYY-MM-DD HH:mm:ss')
      }
      break
    default:
      startTime = now.startOf('day').format('YYYY-MM-DD HH:mm:ss')
      endTime = now.endOf('day').format('YYYY-MM-DD HH:mm:ss')
  }

  return { startTime, endTime }
}

// 计算日期范围 - 订单数量图表
function getSizeDateRange() {
  const now = dayjs()
  let startTime: string
  let endTime: string

  switch (sizeDateFilter.value) {
    case 'today':
      startTime = now.startOf('day').format('YYYY-MM-DD HH:mm:ss')
      endTime = now.endOf('day').format('YYYY-MM-DD HH:mm:ss')
      break
    case 'yesterday':
      startTime = now.subtract(1, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss')
      endTime = now.subtract(1, 'day').endOf('day').format('YYYY-MM-DD HH:mm:ss')
      break
    case 'last7days':
      startTime = now.subtract(7, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss')
      endTime = now.subtract(1, 'day').endOf('day').format('YYYY-MM-DD HH:mm:ss')
      break
    case 'last30days':
      startTime = now.subtract(30, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss')
      endTime = now.subtract(1, 'day').endOf('day').format('YYYY-MM-DD HH:mm:ss')
      break
    case 'lastMonth':
      startTime = now.subtract(1, 'month').startOf('month').format('YYYY-MM-DD HH:mm:ss')
      endTime = now.subtract(1, 'month').endOf('month').format('YYYY-MM-DD HH:mm:ss')
      break
    case 'thisMonth':
      startTime = now.startOf('month').format('YYYY-MM-DD HH:mm:ss')
      endTime = now.endOf('day').format('YYYY-MM-DD HH:mm:ss')
      break
    case 'custom':
      if (sizeCustomDate.value[0] && sizeCustomDate.value[1]) {
        startTime = dayjs(sizeCustomDate.value[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss')
        endTime = dayjs(sizeCustomDate.value[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss')
      }
      else {
        startTime = now.startOf('day').format('YYYY-MM-DD HH:mm:ss')
        endTime = now.endOf('day').format('YYYY-MM-DD HH:mm:ss')
      }
      break
    default:
      startTime = now.startOf('day').format('YYYY-MM-DD HH:mm:ss')
      endTime = now.endOf('day').format('YYYY-MM-DD HH:mm:ss')
  }

  return { startTime, endTime }
}

// 获取大屏数据
async function fetchDashboardData() {
  dashboardLoading.value = true
  try {
    dashboardData.value = await getStaticDashboard()
  }
  catch (error) {
    console.error('获取大屏数据失败:', error)
  }
  finally {
    dashboardLoading.value = false
  }
}

// 获取订单金额图表数据
async function fetchAmountChartData() {
  amountChartLoading.value = true
  try {
    const { startTime, endTime } = getAmountDateRange()
    const params = {
      levelType: 2, // 1:陪玩,2:打手，可以根据需要调整
      startTime,
      endTime,
    }

    const amountData = await getOrderAmountPeriod(params)
    orderAmountData.value = amountData
  }
  catch (error) {
    console.error('获取订单金额图表数据失败:', error)
    message.error('获取订单金额图表数据失败')
  }
  finally {
    amountChartLoading.value = false
  }
}

// 获取订单数量图表数据
async function fetchSizeChartData() {
  sizeChartLoading.value = true
  try {
    const { startTime, endTime } = getSizeDateRange()
    const params = {
      levelType: 2, // 1:陪玩,2:打手，可以根据需要调整
      startTime,
      endTime,
    }

    const sizeData = await getOrderSizePeriod(params)
    orderSizeData.value = sizeData
  }
  catch (error) {
    console.error('获取订单数量图表数据失败:', error)
    message.error('获取订单数量图表数据失败')
  }
  finally {
    sizeChartLoading.value = false
  }
}

// 订单金额图表日期筛选变化
function handleAmountDateFilterChange() {
  fetchAmountChartData()
}

// 订单金额图表自定义日期变化
function handleAmountCustomDateChange() {
  if (amountDateFilter.value === 'custom' && amountCustomDate.value[0] && amountCustomDate.value[1]) {
    fetchAmountChartData()
  }
}

// 订单数量图表日期筛选变化
function handleSizeDateFilterChange() {
  fetchSizeChartData()
}

// 订单数量图表自定义日期变化
function handleSizeCustomDateChange() {
  if (sizeDateFilter.value === 'custom' && sizeCustomDate.value[0] && sizeCustomDate.value[1]) {
    fetchSizeChartData()
  }
}

// 生成24小时时段数组
function generate24Hours() {
  return Array.from({ length: 24 }, (_, i) => {
    return `${String(i).padStart(2, '0')}:00`
  })
}

// 处理毫秒级时间戳
function parsePeriod(period: string | number | undefined, isHourMode: boolean): string {
  if (!period) return ''

  // 如果是毫秒级时间戳
  const timestamp = typeof period === 'string' ? Number.parseInt(period) : period

  if (isHourMode) {
    // 返回小时格式 HH:00
    return dayjs(timestamp).format('HH:00')
  }
  else {
    // 返回日期格式 MM-DD
    return dayjs(timestamp).format('MM-DD')
  }
}

// 处理图表数据 - 根据日期筛选类型处理
function processChartData(
  data: StaticsOrderPeriodRespVO[],
  dateFilter: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'lastMonth' | 'thisMonth' | 'custom',
) {
  const isHourMode = dateFilter === 'today' || dateFilter === 'yesterday'

  if (isHourMode) {
    // 小时模式：生成24小时数据
    const hours = generate24Hours()
    const dataMap = new Map<string, number>()

    // 将数据转换为Map，key为小时（如 "08:00"）
    data.forEach((item) => {
      if (item.period) {
        const hourKey = parsePeriod(item.period, true)
        if (hourKey) {
          dataMap.set(hourKey, item.count || 0)
        }
      }
    })

    // 为每个小时生成数据，如果没有则设为0
    return {
      labels: hours,
      values: hours.map((hour) => {
        return dataMap.get(hour) || 0
      }),
    }
  }
  else {
    // 日期模式：按日期排序并处理
    const dataMap = new Map<string, number>()
    const dateSet = new Set<string>()

    // 处理数据，转换为日期格式
    data.forEach((item) => {
      if (item.period) {
        const dateKey = parsePeriod(item.period, false)
        if (dateKey) {
          dateSet.add(dateKey)
          // 如果同一天有多个数据，累加
          const currentValue = dataMap.get(dateKey) || 0
          dataMap.set(dateKey, currentValue + (item.count || 0))
        }
      }
    })

    // 按日期排序
    const sortedDates = Array.from(dateSet).sort((a, b) => {
      return dayjs(a, 'MM-DD').valueOf() - dayjs(b, 'MM-DD').valueOf()
    })

    return {
      labels: sortedDates,
      values: sortedDates.map((date) => {
        return dataMap.get(date) || 0
      }),
    }
  }
}

// 订单金额趋势图配置
const orderAmountChartOptions = computed<EChartsOption>(() => {
  const amountProcessed = processChartData(
    orderAmountData.value.amountList || [],
    amountDateFilter.value,
  )
  const refundProcessed = processChartData(
    orderAmountData.value.refundAmountList || [],
    amountDateFilter.value,
  )

  // 合并标签，确保两个数据集使用相同的x轴标签
  const isHourMode = amountDateFilter.value === 'today' || amountDateFilter.value === 'yesterday'
  let labels: string[] = []
  const amountDataMap = new Map<string, number>()
  const refundDataMap = new Map<string, number>()

  if (isHourMode) {
    // 小时模式：使用24小时标签
    labels = generate24Hours()
    amountProcessed.labels.forEach((label, index) => {
      amountDataMap.set(label, amountProcessed.values[index])
    })
    refundProcessed.labels.forEach((label, index) => {
      refundDataMap.set(label, refundProcessed.values[index])
    })
  }
  else {
    // 日期模式：合并所有日期
    const allDates = new Set([...amountProcessed.labels, ...refundProcessed.labels])
    labels = Array.from(allDates).sort((a, b) => {
      return dayjs(a, 'MM-DD').valueOf() - dayjs(b, 'MM-DD').valueOf()
    })
    amountProcessed.labels.forEach((label, index) => {
      amountDataMap.set(label, amountProcessed.values[index])
    })
    refundProcessed.labels.forEach((label, index) => {
      refundDataMap.set(label, refundProcessed.values[index])
    })
  }

  const convertToYuan = (value: number) => {
    const yuanString = fenToYuan(value || 0)
    const parsed = Number(yuanString)
    return Number.isNaN(parsed) ? 0 : parsed
  }

  const amountValues = labels.map(label => convertToYuan(amountDataMap.get(label) || 0))
  const refundValues = labels.map(label => convertToYuan(refundDataMap.get(label) || 0))

  return {
    title: {
      text: '订单金额趋势',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      data: ['订单金额', '退款金额'],
      top: 35,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: labels,
      axisLabel: {
        interval: isHourMode ? 1 : 'auto',
        rotate: isHourMode ? 0 : 45,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => {
          return value.toFixed(0)
        },
      },
    },
    series: [
      {
        name: '订单金额',
        type: 'line',
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.1)' },
            ],
          },
        },
        itemStyle: {
          color: '#409EFF',
        },
        data: amountValues,
      },
      {
        name: '退款金额',
        type: 'line',
        smooth: true,
        itemStyle: {
          color: '#67C23A',
        },
        data: refundValues,
      },
    ],
    toolbox: {
      feature: {
        saveAsImage: {
          show: true,
          name: '订单金额趋势',
        },
      },
      right: 10,
      top: 10,
    },
  }
})

// 订单数量趋势图配置
const orderSizeChartOptions = computed<EChartsOption>(() => {
  const sizeProcessed = processChartData(
    orderSizeData.value.amountList || [],
    sizeDateFilter.value,
  )
  const refundSizeProcessed = processChartData(
    orderSizeData.value.refundAmountList || [],
    sizeDateFilter.value,
  )

  // 合并标签，确保两个数据集使用相同的x轴标签
  const isHourMode = sizeDateFilter.value === 'today' || sizeDateFilter.value === 'yesterday'
  let labels: string[] = []
  const sizeDataMap = new Map<string, number>()
  const refundSizeDataMap = new Map<string, number>()

  if (isHourMode) {
    // 小时模式：使用24小时标签
    labels = generate24Hours()
    sizeProcessed.labels.forEach((label, index) => {
      sizeDataMap.set(label, sizeProcessed.values[index])
    })
    refundSizeProcessed.labels.forEach((label, index) => {
      refundSizeDataMap.set(label, refundSizeProcessed.values[index])
    })
  }
  else {
    // 日期模式：合并所有日期
    const allDates = new Set([...sizeProcessed.labels, ...refundSizeProcessed.labels])
    labels = Array.from(allDates).sort((a, b) => {
      return dayjs(a, 'MM-DD').valueOf() - dayjs(b, 'MM-DD').valueOf()
    })
    sizeProcessed.labels.forEach((label, index) => {
      sizeDataMap.set(label, sizeProcessed.values[index])
    })
    refundSizeProcessed.labels.forEach((label, index) => {
      refundSizeDataMap.set(label, refundSizeProcessed.values[index])
    })
  }

  const sizeValues = labels.map(label => sizeDataMap.get(label) || 0)
  const refundSizeValues = labels.map(label => refundSizeDataMap.get(label) || 0)

  return {
    title: {
      text: '订单数量趋势',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      data: ['订单数量', '退款数量'],
      top: 35,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: labels,
      axisLabel: {
        interval: isHourMode ? 1 : 'auto',
        rotate: isHourMode ? 0 : 45,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => {
          return value.toFixed(1)
        },
      },
    },
    series: [
      {
        name: '订单数量',
        type: 'line',
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.1)' },
            ],
          },
        },
        itemStyle: {
          color: '#409EFF',
        },
        data: sizeValues,
      },
      {
        name: '退款数量',
        type: 'line',
        smooth: true,
        itemStyle: {
          color: '#67C23A',
        },
        data: refundSizeValues,
      },
    ],
    toolbox: {
      feature: {
        saveAsImage: {
          show: true,
          name: '订单数量趋势',
        },
      },
      right: 10,
      top: 10,
    },
  }
})

// 图表重新渲染的key，用于强制重新渲染
const amountChartKey = ref(0)
const sizeChartKey = ref(0)

// 强制重新渲染图表
function refreshCharts() {
  nextTick(() => {
    amountChartKey.value++
    sizeChartKey.value++
  })
}

// 初始化
onMounted(() => {
  fetchDashboardData()
  fetchAmountChartData()
  fetchSizeChartData()
})

// tab切换后重新渲染图表
onActivated(async () => {
  // 重新获取数据
  await Promise.all([
    fetchDashboardData(),
    fetchAmountChartData(),
    fetchSizeChartData(),
  ])
  // 延迟刷新图表，确保DOM已更新和数据已加载
  nextTick(() => {
    refreshCharts()
  })
})
</script>

<template>
  <div class="white-dashboard">
    <!-- KPI卡片区域 -->
    <el-row :gutter="16" class="mb-4">
      <el-col :xs="24" :sm="12" :md="8" :lg="8">
        <el-card shadow="never" :loading="dashboardLoading">
          <SummaryCard
            title="总订单金额"
            icon="ep:money"
            icon-color="bg-blue-100"
            icon-bg-color="text-blue-500"
            prefix="¥ "
            :decimals="2"
            :value="Number(fenToYuan(dashboardData.totalOrderAmount || 0))"
          />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="8">
        <el-card shadow="never" :loading="dashboardLoading">
          <SummaryCard
            title="今日订单金额"
            icon="ep:money"
            icon-color="bg-green-100"
            icon-bg-color="text-green-500"
            prefix="¥ "
            :decimals="2"
            :value="Number(fenToYuan(dashboardData.todayOrderAmount || 0))"
          />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="8">
        <el-card shadow="never" :loading="dashboardLoading">
          <SummaryCard
            title="总用户数"
            icon="ep:user"
            icon-color="bg-purple-100"
            icon-bg-color="text-purple-500"
            :value="Number(fenToYuan(dashboardData.todayUserCount || 0))"
          />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="mb-4">
      <el-col :xs="24" :sm="12" :md="8" :lg="8">
        <el-card shadow="never" :loading="dashboardLoading">
          <SummaryCard
            title="总利润"
            icon="ep:present"
            icon-color="bg-orange-100"
            icon-bg-color="text-orange-500"
            prefix="¥ "
            :decimals="2"
            :value="Number(fenToYuan((dashboardData.totalFeeAmount || 0) + (dashboardData.giftFeeAmount || 0)))"
          />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="8">
        <el-card shadow="never" :loading="dashboardLoading">
          <SummaryCard
            title="退款金额"
            icon="ep:calendar"
            icon-color="bg-red-100"
            icon-bg-color="text-red-500"
            :value="Number(fenToYuan(dashboardData.refundAmount || 0))"
          />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="8">
        <el-card shadow="never" :loading="dashboardLoading">
          <SummaryCard
            title="今日新增用户数"
            icon="ep:user-filled"
            icon-color="bg-cyan-100"
            icon-bg-color="text-cyan-500"
            :value="Number(fenToYuan(dashboardData.todayApplyCount || 0))"
          />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="mb-4">
      <el-col :xs="24" :sm="12" :md="8" :lg="8">
        <el-card shadow="never" :loading="dashboardLoading">
          <SummaryCard
            title="打赏利润"
            icon="ep:calendar"
            icon-color="bg-yellow-100"
            icon-bg-color="text-yellow-500"
            prefix="¥ "
            :decimals="2"
            :value="Number(fenToYuan(dashboardData.giftFeeAmount || 0))"
          />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="8">
        <el-card shadow="never" :loading="dashboardLoading">
          <SummaryCard
            title="今日新增打手"
            icon="ep:arrow-left"
            icon-color="bg-indigo-100"
            icon-bg-color="text-indigo-500"
            :value="0"
          />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="8">
        <el-card shadow="never" :loading="dashboardLoading">
          <SummaryCard
            title="打手服务费"
            icon="ep:calendar"
            icon-color="bg-pink-100"
            icon-bg-color="text-pink-500"
            prefix="¥ "
            :decimals="2"
            :value="Number(fenToYuan(dashboardData.totalFeeAmount || 0))"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 订单金额趋势图表 -->
    <el-card shadow="never" class="mb-4" :loading="amountChartLoading">
      <template #header>
        <div class="flex flex-wrap items-center gap-4">
          <span class="text-base font-medium">订单金额趋势</span>
          <el-radio-group v-model="amountDateFilter" @change="handleAmountDateFilterChange">
            <el-radio-button value="today">
              今天
            </el-radio-button>
            <el-radio-button value="yesterday">
              昨天
            </el-radio-button>
            <el-radio-button value="last7days">
              最近7天
            </el-radio-button>
            <el-radio-button value="last30days">
              最近30天
            </el-radio-button>
            <el-radio-button value="lastMonth">
              上月
            </el-radio-button>
            <el-radio-button value="thisMonth">
              本月
            </el-radio-button>
          </el-radio-group>
          <el-date-picker
            v-model="amountCustomDate"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            @change="handleAmountCustomDateChange"
          />
          <el-button
            v-if="amountDateFilter !== 'custom'"
            @click="amountDateFilter = 'custom'"
          >
            指定日期
          </el-button>
        </div>
      </template>
      <Echart :key="amountChartKey" ref="amountChartRef" :height="400" :options="orderAmountChartOptions" />
    </el-card>

    <!-- 订单数量趋势图表 -->
    <el-card shadow="never" class="mb-4" :loading="sizeChartLoading">
      <template #header>
        <div class="flex flex-wrap items-center gap-4">
          <span class="text-base font-medium">订单数量趋势</span>
          <el-radio-group v-model="sizeDateFilter" @change="handleSizeDateFilterChange">
            <el-radio-button value="today">
              今天
            </el-radio-button>
            <el-radio-button value="yesterday">
              昨天
            </el-radio-button>
            <el-radio-button value="last7days">
              最近7天
            </el-radio-button>
            <el-radio-button value="last30days">
              最近30天
            </el-radio-button>
            <el-radio-button value="lastMonth">
              上月
            </el-radio-button>
            <el-radio-button value="thisMonth">
              本月
            </el-radio-button>
          </el-radio-group>
          <el-date-picker
            v-model="sizeCustomDate"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            @change="handleSizeCustomDateChange"
          />
          <el-button
            v-if="sizeDateFilter !== 'custom'"
            @click="sizeDateFilter = 'custom'"
          >
            指定日期
          </el-button>
        </div>
      </template>
      <Echart :key="sizeChartKey" ref="sizeChartRef" :height="400" :options="orderSizeChartOptions" />
    </el-card>
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

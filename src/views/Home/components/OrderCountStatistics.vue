<script setup lang="ts">
import type { StaticsOrderCountRespVO } from '@/api/gamer/statics'

const props = defineProps<{ rows: StaticsOrderCountRespVO[], loading: boolean }>()
const gamePlatform = ref('all')
const terminals = [
  { terminal: 10, label: '小程序' },
  { terminal: 11, label: '公众号' },
  // { terminal: 31, label: 'App' },
]
const tableRows = computed(() => {
  const rows = props.rows
    .filter(row => gamePlatform.value === 'all' || row.gamePlatform === gamePlatform.value)
    .map(row => ({ ...row, terminal: row.terminal === 10 || row.terminal === 31 ? row.terminal : 11 }))
  const counts = terminals.map(item => ({
    label: item.label,
    orderCount: rows.filter(row => row.terminal === item.terminal).reduce((sum, row) => sum + row.orderCount, 0),
    refundCount: rows.filter(row => row.terminal === item.terminal).reduce((sum, row) => sum + row.refundCount, 0),
  }))
  return [
    {
      label: '总计',
      orderCount: rows.reduce((sum, row) => sum + row.orderCount, 0),
      refundCount: rows.reduce((sum, row) => sum + row.refundCount, 0),
    },
    ...counts,
  ]
})
</script>

<template>
  <el-card v-loading="props.loading" shadow="never" class="mb-4">
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <span class="text-base font-medium">订单来源统计</span>
        <el-radio-group v-model="gamePlatform" size="small">
          <el-radio-button value="all">
            全部
          </el-radio-button>
          <el-radio-button value="mobile">
            手机端（手游）
          </el-radio-button>
          <el-radio-button value="computer">
            电脑端（端游）
          </el-radio-button>
          <el-radio-button value="other">
            未分类
          </el-radio-button>
        </el-radio-group>
      </div>
    </template>
    <el-table :data="tableRows" border>
      <el-table-column prop="label" label="下单来源" min-width="140" />
      <el-table-column prop="orderCount" label="订单总笔数" min-width="130" align="right" />
      <el-table-column prop="refundCount" label="退款总笔数" min-width="130" align="right" />
    </el-table>
    <p class="mb-0 mt-3 text-sm text-gray-500">
      按所选时间范围内的下单时间统计。订单总笔数包含已支付、退款中及已退款订单，退款笔数仅统计退款成功。
      游戏端优先按分类的手游／端游设置区分；服务号和 H5 合并统计，未传来源的订单默认计入服务号 / H5。
    </p>
  </el-card>
</template>

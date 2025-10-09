<script lang="ts" setup>
import { computed } from 'vue'
import type { EChartsOption } from 'echarts'

defineOptions({ name: 'WeeklyChart' })

type WeeklyItem = {
  time: string
  rechargeAmount: number
  commissionAmount: number
  orderAmount: number
  orderCount: number
}

const props = withDefaults(defineProps<{ data: WeeklyItem[]; height?: string; mode?: 'full' | 'countOnly' }>(), {
  height: '300px',
  mode: 'full',
})

const options = computed<EChartsOption>(() => {
  const x = (props.data || []).map(i => i.time)
  if (props.mode === 'countOnly') {
    return {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: x },
      yAxis: { type: 'value' },
      series: [
        { name: '订单数', type: 'line', smooth: true, data: props.data.map(i => i.orderCount) },
      ],
    }
  }
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['充值金额', '抽成金额', '订单金额', '订单数'] },
    xAxis: { type: 'category', data: x },
    yAxis: { type: 'value' },
    series: [
      { name: '充值金额', type: 'bar', data: props.data.map(i => Math.round(i.rechargeAmount / 100)) },
      { name: '抽成金额', type: 'bar', data: props.data.map(i => Math.round(i.commissionAmount / 100)) },
      { name: '订单金额', type: 'line', smooth: true, data: props.data.map(i => Math.round(i.orderAmount / 100)) },
      { name: '订单数', type: 'line', smooth: true, data: props.data.map(i => i.orderCount) },
    ],
  }
})
</script>

<template>
  <Echart :options="options as any" :height="props.height" />
</template>

<style scoped>
</style>


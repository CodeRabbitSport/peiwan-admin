<script lang="ts" setup>
import type { EChartsOption } from 'echarts'

import { useCssVar } from '@vueuse/core'
import { graphic } from 'echarts'
import { computed, unref } from 'vue'

defineOptions({ name: 'WeeklyChart' })

const props = withDefaults(defineProps<{ data: WeeklyItem[], height?: string, mode?: 'full' | 'countOnly' }>(), {
  height: '300px',
  mode: 'full',
})

interface WeeklyItem {
  time: string
  rechargeAmount: number
  commissionAmount: number
  orderAmount: number
  orderCount: number
}

const primaryColor = useCssVar('--el-color-primary', document.documentElement)

function hexToRgb(hex: string): { r: number, g: number, b: number } | null {
  if (!hex) return null
  const normalized = hex.replace('#', '')
  const full = normalized.length === 3
    ? normalized.split('').map(c => c + c).join('')
    : normalized
  if (!/^[0-9a-f]{6}$/i.test(full)) return null
  const r = Number.parseInt(full.slice(0, 2), 16)
  const g = Number.parseInt(full.slice(2, 4), 16)
  const b = Number.parseInt(full.slice(4, 6), 16)
  return { r, g, b }
}

function getPrimaryRgb() {
  return hexToRgb(unref(primaryColor) || '#409EFF') || { r: 64, g: 158, b: 255 }
}

function makeAreaStyle(alphaTop = 0.125, alphaBottom = 0.031) {
  const rgb = getPrimaryRgb()
  return {
    opacity: 0.8,
    color: new graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alphaTop})` },
      { offset: 1, color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alphaBottom})` },
    ]),
  }
}

function makeLineStyle() {
  const rgb = getPrimaryRgb()
  return {
    width: 3,
    color: new graphic.LinearGradient(0, 0, 1, 0, [
      { offset: 0, color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${128 / 255})` }, // 80
      { offset: 0.5, color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${146 / 255})` }, // 92
      { offset: 1, color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` }, // FF
    ]),
  }
}

const dotColor = 'rgba(78, 89, 105, 0.2)'

const options = computed<EChartsOption>(() => {
  const x = (props.data || []).map(i => i.time)
  if (props.mode === 'countOnly') {
    return {
      grid: { left: '40', right: '0', top: '10', bottom: '30' },
      xAxis: {
        type: 'category',
        offset: 2,
        data: x,
        boundaryGap: false,
        axisLabel: {
          color: '#4E5969',
          formatter(value: string, idx: number) {
            if (idx === 0) return ''
            if (idx === x.length - 1) return ''
            return `${value}`
          },
        },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          show: true,
          interval: (idx: number) => {
            if (idx === 0) return false
            if (idx === x.length - 1) return false
            return true
          },
          lineStyle: { color: dotColor },
        },
        axisPointer: {
          show: true,
          lineStyle: { color: `${unref(primaryColor) || '#409EFF'}`, width: 2 },
        },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: {
          formatter(value: number, idx: number): string {
            if (idx === 0) return `${value}`
            return `${value}k`
          },
        },
        splitLine: { show: true, lineStyle: { type: 'dashed', color: dotColor } },
      },
      tooltip: {
        trigger: 'axis',
        formatter(params: any[]) {
          const [firstElement] = params
          return `<div>
            <p class="tooltip-title">${firstElement.axisValueLabel}</p>
            <div class="content-panel"><span>总内容量</span><span class="tooltip-value">${(
              Number(firstElement.value) * 10000
            ).toLocaleString()}</span></div>
          </div>`
        },
        className: 'echarts-tooltip-diy',
      },
      series: [
        {
          name: '订单数',
          data: props.data.map(i => i.orderCount),
          type: 'line',
          smooth: true,
          symbolSize: 12,
          emphasis: { focus: 'series', itemStyle: { borderWidth: 2 } },
          lineStyle: makeLineStyle(),
          showSymbol: false,
          areaStyle: makeAreaStyle(),
        },
      ],
    }
  }
  return {
    grid: { left: '40', right: '0', top: '10', bottom: '30' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['充值金额', '抽成金额', '订单金额', '订单数'] },
    xAxis: {
      type: 'category',
      data: x,
      boundaryGap: true,
      offset: 2,
      axisLabel: {
        color: '#4E5969',
        formatter(value: string, idx: number) {
          if (idx === 0) return ''
          if (idx === x.length - 1) return ''
          return `${value}`
        },
      },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        show: true,
        interval: (idx: number) => {
          if (idx === 0) return false
          if (idx === x.length - 1) return false
          return true
        },
        lineStyle: { color: dotColor },
      },
      axisPointer: {
        show: true,
        lineStyle: { color: `${unref(primaryColor) || '#409EFF'}`, width: 2 },
      },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: {
        formatter(value: number, idx: number): string {
          if (idx === 0) return `${value}`
          return `${value}k`
        },
      },
      splitLine: { show: true, lineStyle: { type: 'dashed', color: dotColor } },
    },
    series: [
      { name: '充值金额', type: 'bar', data: props.data.map(i => Math.round(i.rechargeAmount / 100)) },
      { name: '抽成金额', type: 'bar', data: props.data.map(i => Math.round(i.commissionAmount / 100)) },
      {
        name: '订单金额',
        type: 'line',
        smooth: true,
        symbolSize: 12,
        emphasis: { focus: 'series', itemStyle: { borderWidth: 2 } },
        lineStyle: makeLineStyle(),
        showSymbol: false,
        areaStyle: makeAreaStyle(),
        data: props.data.map(i => Math.round(i.orderAmount / 100)),
      },
      {
        name: '订单数',
        type: 'line',
        smooth: true,
        symbolSize: 12,
        emphasis: { focus: 'series', itemStyle: { borderWidth: 2 } },
        lineStyle: makeLineStyle(),
        showSymbol: false,
        areaStyle: makeAreaStyle(0.1, 0.05),
        data: props.data.map(i => i.orderCount),
      },
    ],
  }
})
</script>

<template>
  <Echart :options="options" :height="props.height" />
</template>

<style scoped>
</style>

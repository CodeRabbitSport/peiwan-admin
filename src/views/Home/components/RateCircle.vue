<script lang="ts" setup>
import type { EChartsOption } from 'echarts'

import { computed } from 'vue'

defineOptions({ name: 'RateCircle' })

const props = defineProps<{ title: string, value: number }>()

const options = computed<EChartsOption>(() => ({
  tooltip: { show: false },
  series: [
    {
      type: 'gauge',
      startAngle: 90,
      endAngle: -270,
      center: ['50%', '50%'],
      radius: '100%',
      axisLine: { lineStyle: { width: 10 } },
      pointer: { show: false },
      progress: { show: true, roundCap: true, width: 10 },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      data: [
        { value: Number((props.value || 0).toFixed(2)) },
      ],
      detail: {
        offsetCenter: [0, 0],
        formatter: (val: number) => `${val.toFixed(2)}%`,
        fontSize: 14,
        color: '#303133',
      },
      title: { show: false },
    },
  ],
}))
</script>

<template>
  <div class="rate-card">
    <div class="title">
      {{ props.title }}
    </div>
    <Echart :options="options" :height="100" :width="100" />
  </div>
</template>

<style scoped>
.rate-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.title {
  margin-bottom: 6px;
  color: #606266;
}
</style>

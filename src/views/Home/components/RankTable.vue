<script lang="ts" setup>
defineOptions({ name: 'RankTable' })

const props = withDefaults(defineProps<{ rows: { userId: number; nickname: string; amount: number }[]; height?: string; amountLabel?: string }>(), {
  height: '360px',
  amountLabel: '金额(元)',
})

function fenToYuan(value: number): number {
  if (value == null) return 0
  return Math.round((value / 100) * 100) / 100
}
</script>

<template>
  <el-table :data="props.rows" :height="props.height" size="small" border>
    <el-table-column type="index" width="50" label="#" />
    <el-table-column prop="nickname" label="昵称" min-width="120" />
    <el-table-column prop="amount" :label="props.amountLabel" min-width="100">
      <template #default="scope">
        {{ fenToYuan(scope.row.amount) }}
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped>
</style>


<script lang="ts" setup>
defineOptions({ name: 'OrderList' })

const props = withDefaults(defineProps<{ rows: any[]; height?: string; avatarSize?: number }>(), {
  height: '360px',
  avatarSize: 28,
})
</script>

<template>
  <div :style="{ maxHeight: props.height, overflow: 'auto' }">
    <el-card v-for="(row, idx) in props.rows" :key="`${row.id}-${idx}`" class="mb-[8px]" shadow="hover">
      <div class="flex items-center">
        <el-avatar :src="row.avatar || row.captainAvatar" :size="props.avatarSize" class="mr-[8px]" />
        <div class="flex-1">
          <div class="text-[13px] mb-[4px]">{{ row.categoryName }}</div>
          <div class="text-[12px] text-[#999]">{{ row.nickname || row.captainNickname }}</div>
        </div>
        <div class="text-[12px] text-[#999]">#{{ row.categoryId }}</div>
      </div>
    </el-card>
    <el-empty v-if="props.rows.length === 0" :image-size="100" />
  </div>
</template>

<style scoped>
</style>


<template>
  <Dialog v-model="dialogVisible" :title="currentInfo?.groupTitle + '奖品配置'" width="90%" align-center>
    <PrizeContent ref="prizeContentRef" :group-id="currentGroupId" />
  </Dialog>
</template>

<script setup lang="ts">
import { PrizeGroup } from '@/api/gamer/prizegroup'
import PrizeContent from './PrizeContent.vue'

const dialogVisible = ref(false)
const currentGroupId = ref<number>()
const currentInfo = ref<PrizeGroup | undefined>(undefined)
const prizeContentRef = ref()

/** 打开弹窗 */
const open = (prizeGroup: PrizeGroup) => {
  currentGroupId.value = prizeGroup.id
  currentInfo.value = prizeGroup
  dialogVisible.value = true
  // 等待弹窗完全打开后再初始化内容
  nextTick(() => {
    prizeContentRef.value?.initWithGroupId(prizeGroup.id)
  })
}

/** 关闭弹窗 */
const close = () => {
  dialogVisible.value = false
  currentGroupId.value = undefined
}

defineExpose({
  open,
  close
})
</script>

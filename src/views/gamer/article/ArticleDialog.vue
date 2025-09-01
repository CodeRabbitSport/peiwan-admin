<template>
  <Dialog v-model="dialogVisible" :title="currentInfo?.categoryName + ' 文章管理'" width="90%" align-center>
    <ArticleContent ref="articleContentRef" :category-id="currentCategoryId" />
  </Dialog>
</template>

<script setup lang="ts">
import { ArticleCategory } from '@/api/gamer/articlecategory'
import ArticleContent from './ArticleContent.vue'

const dialogVisible = ref(false)
const currentCategoryId = ref<number>()
const currentInfo = ref<ArticleCategory | undefined>(undefined)
const articleContentRef = ref()

/** 打开弹窗 */
const open = (category: ArticleCategory) => {
  currentCategoryId.value = category.id
  currentInfo.value = category
  dialogVisible.value = true
  // 等待弹窗完全打开后再初始化内容
  nextTick(() => {
    articleContentRef.value?.initWithCategoryId(category.id)
  })
}

/** 关闭弹窗 */
const close = () => {
  dialogVisible.value = false
  currentCategoryId.value = undefined
  currentInfo.value = undefined
}

defineExpose({
  open,
  close
})
</script>

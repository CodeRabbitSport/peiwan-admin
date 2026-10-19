<script setup lang="ts">
import type { ProductCategory } from '@/api/gamer/productcategory'
import { ProductCategoryApi } from '@/api/gamer/productcategory'
import type { ProductSalesRankRespVO } from '@/api/gamer/statics'
import { getProductSalesRank } from '@/api/gamer/statics'

const props = defineProps<{ startTime: string, endTime: string }>()
const message = useMessage()
const loading = ref(false)
const loadFailed = ref(false)
const categoriesLoading = ref(false)
const categories = ref<ProductCategory[]>([])
const categoryId = ref<number>()
const period = ref<'all' | 'selected'>('all')
const rows = ref<ProductSalesRankRespVO[]>([])
let requestId = 0

async function loadCategories() {
  categoriesLoading.value = true
  try {
    const all: ProductCategory[] = []
    let pageNo = 1
    let total = 0
    do {
      const result = await ProductCategoryApi.getProductCategoryPage({ pageNo, pageSize: 100 })
      all.push(...result.list)
      total = result.total
      if (result.list.length === 0) break
      pageNo++
    } while (all.length < total)
    categories.value = all
  }
  catch {
    message.error('获取排行榜分类失败')
  }
  finally {
    categoriesLoading.value = false
  }
}

async function loadRank() {
  const currentRequest = ++requestId
  loading.value = true
  loadFailed.value = false
  rows.value = []
  try {
    const data = await getProductSalesRank({
      categoryId: categoryId.value || undefined,
      ...(period.value === 'selected' ? { startTime: props.startTime, endTime: props.endTime } : {}),
    })
    if (currentRequest === requestId) rows.value = data.slice(0, 10)
  }
  catch {
    if (currentRequest === requestId) loadFailed.value = true
  }
  finally {
    if (currentRequest === requestId) loading.value = false
  }
}

watch(() => [categoryId.value, period.value, ...(period.value === 'selected' ? [props.startTime, props.endTime] : [])], loadRank, { immediate: true })
onMounted(loadCategories)
onActivated(loadRank)
</script>

<template>
  <el-card v-loading="loading" shadow="never" class="mb-4">
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <span class="text-base font-medium">商品出售数量排行榜 · Top10</span>
        <div class="flex flex-wrap items-center gap-3">
          <el-select
            v-model="categoryId"
            aria-label="排行榜分类"
            placeholder="总榜（全部分类）"
            clearable
            filterable
            :loading="categoriesLoading"
            class="!w-[220px]"
          >
            <el-option v-for="category in categories" :key="category.id" :label="category.categoryName" :value="category.id" />
          </el-select>
          <el-radio-group v-model="period" size="small">
            <el-radio-button value="all">
              全部时间
            </el-radio-button>
            <el-radio-button value="selected">
              当前时间范围
            </el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </template>
    <el-alert v-if="loadFailed" type="error" :closable="false" class="mb-3">
      <template #title>
        排行榜加载失败 <el-button link type="primary" @click="loadRank">
          重试
        </el-button>
      </template>
    </el-alert>
    <el-table :data="rows" border max-height="620" :empty-text="loadFailed ? '暂时无法获取排行' : '暂无商品销售数据'">
      <el-table-column type="index" label="排名" width="70" align="center" />
      <el-table-column prop="productId" label="商品 ID" width="110" />
      <el-table-column prop="productName" label="商品名称" min-width="220" show-overflow-tooltip />
      <el-table-column label="游戏分类" min-width="160" show-overflow-tooltip>
        <template #default="scope">
          {{ scope.row.categoryName || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="salesCount" label="出售数量（单）" min-width="150" align="right" />
      <el-table-column prop="orderCount" label="订单笔数" min-width="130" align="right" />
    </el-table>
    <p class="mb-0 mt-3 text-sm text-gray-500">
      按已支付且未退款成功的订单商品数量（含赠送）降序取前 10 名，不含虚拟销量。
      清空分类查看总榜；选择分类查看该分类排行。
    </p>
  </el-card>
</template>

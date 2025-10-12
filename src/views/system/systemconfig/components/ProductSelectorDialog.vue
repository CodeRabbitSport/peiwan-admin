<script setup lang="ts">
import type { Product } from '@/api/gamer/product'
import { ProductApi } from '@/api/gamer/product'

const props = defineProps<{
  modelValue: number[]
  visible: boolean
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', val: number[]): void
  (e: 'update:visible', val: boolean): void
  (e: 'confirm', val: number[]): void
}>()

const visibleLocal = computed({
  get: () => props.visible,
  set: (v: boolean) => emit('update:visible', v),
})

const productLoading = ref(false)
const productList = ref<Product[]>([])
const productTotal = ref(0)
const productTableRef = ref()
const productQuery = reactive({
  pageNo: 1,
  pageSize: 10,
  productTitle: '',
})

watch(
  () => props.visible,
  async (v) => {
    if (v) {
      await getProductList()
      nextTick(() => syncCurrentPageSelection())
    }
  },
)

function productHandleQuery() {
  productQuery.pageNo = 1
  getProductList()
}
function productResetQuery() {
  productQuery.productTitle = ''
  productHandleQuery()
}

async function getProductList() {
  productLoading.value = true
  try {
    const data = await ProductApi.getProductPage(productQuery)
    productList.value = data.list || []
    productTotal.value = data.total || 0
  }
  finally {
    productLoading.value = false
    nextTick(() => syncCurrentPageSelection())
  }
}

function syncCurrentPageSelection() {
  try {
    productList.value.forEach((row) => {
      const selected = props.modelValue.includes(row.id)
      productTableRef.value?.toggleRowSelection(row, selected)
    })
  }
  catch { }
}

function handleProductSelectionChange(rows: Product[]) {
  const currentPageIds = new Set(productList.value.map(r => r.id))
  // 清除本页取消选中的项
  for (const id of Array.from(props.modelValue)) {
    if (currentPageIds.has(id) && !rows.some(r => r.id === id)) {
      emit('update:modelValue', props.modelValue.filter(i => i !== id))
    }
  }
  // 添加当前页新选中的项
  rows.forEach(r => emit('update:modelValue', [...props.modelValue, r.id]))
}

function confirm() {
  const ids = productTableRef.value?.getSelectionRows().map(r => r.id)
  emit('update:modelValue', ids)
  emit('confirm', ids)
  visibleLocal.value = false
}

function handleClose() {
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog v-model="visibleLocal" title="选择商品" width="900px" align-center @close="handleClose">
    <div class="mb-3 flex items-center gap-2">
      <el-input
        v-model="productQuery.productTitle"
        placeholder="请输入商品名称"
        class="!w-[260px]"
        clearable
      />
      <el-button type="primary" @click="productHandleQuery">
        <Icon icon="ep:search" class="mr-[5px]" /> 搜索
      </el-button>
      <el-button @click="productResetQuery">
        <Icon icon="ep:refresh" class="mr-[5px]" /> 重置
      </el-button>
    </div>
    <el-table
      ref="productTableRef"
      v-loading="productLoading"
      row-key="id"
      :data="productList"
      :stripe="true"
      :show-overflow-tooltip="true"
      @selection-change="handleProductSelectionChange"
    >
      <el-table-column type="selection" width="55" reserve-selection />
      <el-table-column label="ID" prop="id" width="90" align="center" />
      <el-table-column label="商品标题" prop="productTitle" min-width="220" />
      <el-table-column label="价格" prop="productPrice" width="120" align="center" />
      <el-table-column label="分类" prop="categoryName" min-width="160" />
      <el-table-column label="上下架" prop="saleStatus" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.saleStatus ? 'success' : 'info'">
            {{ scope.row.saleStatus ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
    <div class="mt-3">
      <Pagination
        v-model:page="productQuery.pageNo" v-model:limit="productQuery.pageSize" :total="productTotal"
        @pagination="getProductList"
      />
    </div>
    <template #footer>
      <el-button type="primary" @click="confirm">
        确 定
      </el-button>
      <el-button @click="visibleLocal = false">
        取 消
      </el-button>
    </template>
  </el-dialog>
</template>

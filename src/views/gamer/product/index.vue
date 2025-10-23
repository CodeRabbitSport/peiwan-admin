<script setup lang="ts">
import type { LevelConfig } from '@/api/gamer/levelconfig'
import { LevelConfigApi } from '@/api/gamer/levelconfig'
import type { Product } from '@/api/gamer/product'
import { ProductApi } from '@/api/gamer/product'
import type { ProductCategory } from '@/api/gamer/productcategory'
import { ProductCategoryApi } from '@/api/gamer/productcategory'
import type { ProductType } from '@/api/gamer/producttype'
import { ProductTypeApi } from '@/api/gamer/producttype'
import { fenToYuan } from '@/utils'
import download from '@/utils/download'
import { dateFormatter } from '@/utils/formatTime'
import { isEmpty } from '@/utils/is'

import ProductForm from './ProductForm.vue'

/** 商品 列表 */
defineOptions({ name: 'Product' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<Product[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const categoryList = ref<ProductCategory[]>([]) // 分类列表
const typeList = ref<ProductType[]>([]) // 类型列表
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  productTitle: undefined,
  categoryId: undefined,
  typeId: undefined,
  refundSupported: undefined,
  saleStatus: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

// 等级选项与映射（来自 LevelConfig 接口）
const levelOptions = ref<LevelConfig[]>([])
const levelNameMap = ref<Record<number, string>>({})
async function loadLevelOptions() {
  try {
    const data = await LevelConfigApi.getLevelConfigPage()
    levelOptions.value = data.list || []
    const map: Record<number, string> = {}
    levelOptions.value.forEach((l) => {
      if (l && typeof l.levelNumber === 'number') {
        map[l.levelNumber] = l.levelName || String(l.levelNumber)
      }
    })
    levelNameMap.value = map
  }
  catch (e) {
    console.error('获取等级列表失败:', e)
  }
}

// 将 productLevel（可能为字符串逗号分隔）解析为等级名称数组
function parseLevelNames(val: string | number[] | undefined) {
  if (!val) return [] as string[]
  const ids = Array.isArray(val)
    ? (val as number[])
    : String(val)
        .split(',')
        .map(v => Number(v))
        .filter(n => !Number.isNaN(n))
  return ids.map(id => levelNameMap.value[id] || `#${id}`)
}

/** 查询列表 */
async function getList() {
  loading.value = true
  try {
    const data = await ProductApi.getProductPage(queryParams)
    list.value = data.list
    total.value = data.total
  }
  finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
function openForm(type: string, id?: number) {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
async function handleDelete(id: number) {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await ProductApi.deleteProduct(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  }
  catch { }
}

/** 批量删除商品 */
async function handleDeleteBatch() {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await ProductApi.deleteProductList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  }
  catch { }
}

const checkedIds = ref<number[]>([])
function handleRowCheckboxChange(records: Product[]) {
  checkedIds.value = records.map(item => item.id)
}

/** 导出按钮操作 */
async function handleExport() {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await ProductApi.exportProduct(queryParams)
    download.excel(data, '商品.xls')
  }
  catch {
  }
  finally {
    exportLoading.value = false
  }
}

/** 获取分类列表 */
async function getCategoryOptions() {
  try {
    const data = await ProductCategoryApi.getProductCategoryPage()
    categoryList.value = data.list || []
  }
  catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

/** 获取类型列表 */
async function getTypeOptions() {
  try {
    const data = await ProductTypeApi.getProductTypePage()
    typeList.value = data.list || []
  }
  catch (error) {
    console.error('获取类型列表失败:', error)
  }
}

async function changeGood(row) {
  try {
    loading.value = true
    await ProductApi.updateProduct({
      ...row,
      saleStatus: !row.saleStatus,
    })
    resetQuery()
  }
  catch {
    message.error('修改失败')
  }
  finally {
    loading.value = false
  }
}
/** 初始化 */
onMounted(() => {
  getList()
  getCategoryOptions()
  getTypeOptions()
  loadLevelOptions()
})
</script>

<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryFormRef"
      class="-mb-[15px]"
      :model="queryParams"
      :inline="true"
      label-width="80px"
    >
      <el-form-item label="名称" prop="productTitle">
        <el-input
          v-model="queryParams.productTitle"
          placeholder="请输入商品标题"
          clearable
          class="!w-[240px]"
        />
      </el-form-item>
      <el-form-item label="分类" prop="categoryId">
        <el-select
          v-model="queryParams.categoryId"
          placeholder="请选择分类"
          clearable
          class="!w-[240px]"
        >
          <el-option
            v-for="category in categoryList"
            :key="category.id"
            :label="category.categoryName"
            :value="category.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="类型" prop="typeId">
        <el-select
          v-model="queryParams.typeId"
          placeholder="请选择商品类型"
          clearable
          class="!w-[240px]"
        >
          <el-option
            v-for="type in typeList"
            :key="type.id"
            :label="type.typeName"
            :value="type.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="上下架" prop="saleStatus">
        <el-select v-model="queryParams.saleStatus" placeholder="请选择上下架状态" clearable class="!w-[240px]">
          <el-option label="上架" :value="true" />
          <el-option label="下架" :value="false" />
        </el-select>
      </el-form-item>
      <el-form-item class="flex flex-wrap gap-2">
        <el-button class="mb-2 sm:mb-0" @click="handleQuery">
          <Icon icon="ep:search" class="mr-[5px]" /> 搜索
        </el-button>
        <el-button class="mb-2 sm:mb-0" @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-[5px]" /> 重置
        </el-button>
        <el-button
          v-hasPermi="['gamer:product:create']" type="primary" plain class="mb-2 sm:mb-0"
          @click="openForm('create')"
        >
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button>
        <el-button
          v-hasPermi="['gamer:product:export']" type="success" plain :loading="exportLoading"
          class="mb-2 sm:mb-0"
          @click="handleExport"
        >
          <Icon icon="ep:download" class="mr-[5px]" /> 导出
        </el-button>
        <el-button
          v-if="!isEmpty(checkedIds)" v-hasPermi="['gamer:product:delete']" type="danger" plain
          :disabled="isEmpty(checkedIds)"
          class="mb-2 sm:mb-0" @click="handleDeleteBatch"
        >
          <Icon icon="ep:delete" class="mr-[5px]" /> 批量删除
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      v-loading="loading" row-key="id" :data="list" :stripe="true" :show-overflow-tooltip="true"
      @selection-change="handleRowCheckboxChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="商品标题" align="center" prop="productTitle" />
      <!-- <el-table-column label="描述" align="center" prop="productDesc" /> -->
      <el-table-column label="库存" align="center" prop="productStock" />
      <el-table-column label="价格" align="center" prop="productPrice">
        <template #default="scope">
          {{ fenToYuan(scope.row.productPrice) }}
        </template>
      </el-table-column>
      <el-table-column label="等级" align="center" prop="productLevel" min-width="160">
        <template #default="scope">
          <div class="flex flex-wrap justify-center gap-1">
            <el-tag v-for="(name, idx) in parseLevelNames(scope.row.productLevel)" :key="idx" size="small">
              {{ name }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="详情图" align="center" prop="productDetailCover">
        <template #default="scope">
          <!-- 图片类型 -->
          <el-image
            :src="scope.row.productDetailCover"
            :preview-src-list="[scope.row.productDetailCover]"
            fit="cover"
            style="width: 60px; height: 60px; border-radius: 6px;"
            preview-teleported
          />
        </template>
      </el-table-column>
      <el-table-column label="主页图" align="center" prop="productMainCover">
        <template #default="scope">
          <!-- 图片类型 -->
          <el-image
            :src="scope.row.productMainCover"
            :preview-src-list="[scope.row.productMainCover]"
            fit="cover"
            style="width: 60px; height: 60px; border-radius: 6px;"
            preview-teleported
          />
        </template>
      </el-table-column>
      <el-table-column label="商品内容" align="center" prop="productContent">
        <template #default="scope">
          <div
            v-hasPermi="['gamer:product:update']"
            class="cursor-pointer text-blue-500"
            @click="openForm('update', scope.row.id)"
          >
            查看详情
          </div>
        </template>
      </el-table-column>
      <el-table-column label="分类" align="center" prop="categoryName" />
      <el-table-column label="商品类型" align="center" prop="typeName" />
      <el-table-column label="上下架" align="center" prop="saleStatus">
        <template #default="scope">
          <el-switch :model-value="scope.row.saleStatus" @change="changeGood(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" :formatter="dateFormatter" width="180px" />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            v-hasPermi="['gamer:product:update']"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-hasPermi="['gamer:product:delete']"
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      v-model:page="queryParams.pageNo" v-model:limit="queryParams.pageSize" :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <ProductForm ref="formRef" @success="getList" />
</template>

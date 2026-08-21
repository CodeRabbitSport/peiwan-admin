<script setup lang="ts">
import { ElCheckbox, ElMessageBox } from 'element-plus'
import { h } from 'vue'

import type { LevelConfig } from '@/api/gamer/levelconfig'
import { LevelConfigApi } from '@/api/gamer/levelconfig'
import type { Product } from '@/api/gamer/product'
import { ProductApi } from '@/api/gamer/product'
import { ProductCategoryApi } from '@/api/gamer/productcategory'
import { ProductTypeApi } from '@/api/gamer/producttype'
import PaginationSelect from '@/components/PaginationSelect/index.vue'
import { fenToYuan } from '@/utils'
import download from '@/utils/download'
import { dateFormatter, formatDate } from '@/utils/formatTime'
import { isEmpty } from '@/utils/is'

import ProductForm from './ProductForm.vue'

/** 商品 列表 */
defineOptions({ name: 'Product' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<Product[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
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

const linkedProductDetailVisible = ref(false)
const linkedProductDetailLoading = ref(false)
const linkedProductDetail = ref<Product>()

async function openLinkedProductDetail(id?: number) {
  if (!id) return
  linkedProductDetailVisible.value = true
  linkedProductDetailLoading.value = true
  linkedProductDetail.value = undefined
  try {
    linkedProductDetail.value = await ProductApi.getProduct(id)
  }
  catch {
    message.error('加载关联商品信息失败')
  }
  finally {
    linkedProductDetailLoading.value = false
  }
}

const checkedIds = ref<number[]>([])
const checkedProducts = ref<Product[]>([])
function handleRowCheckboxChange(records: Product[]) {
  checkedProducts.value = records
  checkedIds.value = records.map(item => item.id)
}

async function confirmDelete(content: string, hasLinkedProduct: boolean) {
  let deleteLinked = false
  const messageContent = hasLinkedProduct
    ? h('div', { class: 'flex flex-col gap-3' }, [
        h('div', content),
        h(ElCheckbox, {
          'checked': false,
          'onUpdate:modelValue': (value: boolean | string | number) => {
            deleteLinked = Boolean(value)
          },
        }, { default: () => '同时删除关联商品' }),
      ])
    : content
  await ElMessageBox.confirm(messageContent, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
  return deleteLinked
}

/** 删除按钮操作 */
async function handleDelete(product: Product) {
  try {
    const deleteLinked = await confirmDelete('确认删除该商品？', Boolean(product.linkedProductId))
    await ProductApi.deleteProduct(product.id, deleteLinked)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  }
  catch { }
}

/** 批量删除商品 */
async function handleDeleteBatch() {
  try {
    const deleteLinked = await confirmDelete(
      `确认删除选中的 ${checkedIds.value.length} 个商品？`,
      checkedProducts.value.some(item => Boolean(item.linkedProductId)),
    )
    await ProductApi.deleteProductList(checkedIds.value, deleteLinked)
    checkedIds.value = []
    checkedProducts.value = []
    message.success(t('common.delSuccess'))
    await getList()
  }
  catch { }
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

async function changeMiniProgramVisibility(row: Product) {
  const nextIsShow = !row.isShow
  try {
    loading.value = true
    await ProductApi.updateProduct({
      ...row,
      isShow: nextIsShow,
    })
    row.isShow = nextIsShow
    message.success('修改成功')
    try {
      await getList()
    }
    catch {
      message.error('刷新列表失败')
    }
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
        <PaginationSelect
          v-model="queryParams.categoryId"
          placeholder="请选择分类"
          clearable
          :api="ProductCategoryApi.getProductCategoryPage"
          label-key="categoryName"
          search-key="categoryName"
          value-key="id"
          :page-size="10"
          width="240px"
        />
      </el-form-item>
      <el-form-item label="类型" prop="typeId">
        <PaginationSelect
          v-model="queryParams.typeId"
          placeholder="请选择商品类型"
          clearable
          filterable
          :api="ProductTypeApi.getProductTypePage"
          label-key="typeName"
          search-key="typeName"
          value-key="id"
          :page-size="10"
          width="240px"
        />
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
      <el-table-column label="关联商品" align="center" prop="linkedProductTitle" min-width="160">
        <template #default="scope">
          <el-link
            v-if="scope.row.linkedProductId"
            type="primary"
            :underline="false"
            :title="scope.row.linkedProductTitle || `商品 #${scope.row.linkedProductId}`"
            @click="openLinkedProductDetail(scope.row.linkedProductId)"
          >
            {{ scope.row.linkedProductTitle || `商品 #${scope.row.linkedProductId}` }}
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="商品标题" align="center" prop="productTitle" />
      <!-- <el-table-column label="描述" align="center" prop="productDesc" /> -->
      <el-table-column label="库存" align="center" prop="productStock" />
      <el-table-column label="价格" align="center" prop="productPrice">
        <template #default="scope">
          {{ fenToYuan(scope.row.productPrice) }}
        </template>
      </el-table-column>
      <!-- <el-table-column label="等级" align="center" prop="productLevel" min-width="160">
        <template #default="scope">
          <div class="flex flex-wrap justify-center gap-1">
            <el-tag v-for="(name, idx) in parseLevelNames(scope.row.productLevel)" :key="idx" size="small">
              {{ name }}
            </el-tag>
          </div>
        </template>
      </el-table-column> -->
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
      <el-table-column label="小程序端显示" align="center" prop="isShow" width="140">
        <template #default="scope">
          <el-switch
            v-hasPermi="['gamer:product:update']"
            :model-value="scope.row.isShow"
            active-text="显示"
            inactive-text="隐藏"
            inline-prompt
            @change="changeMiniProgramVisibility(scope.row)"
          />
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
            @click="handleDelete(scope.row)"
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

  <Dialog
    v-model="linkedProductDetailVisible"
    :title="linkedProductDetail?.productTitle || '关联商品信息'"
    width="820px"
    align-center
  >
    <div v-loading="linkedProductDetailLoading" class="min-h-[180px]">
      <template v-if="linkedProductDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="商品 ID">
            {{ linkedProductDetail.id ?? '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="商品标题">
            {{ linkedProductDetail.productTitle || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="商品价格">
            {{ linkedProductDetail.productPrice == null ? '-' : `${fenToYuan(linkedProductDetail.productPrice)} 元` }}
          </el-descriptions-item>
          <el-descriptions-item label="库存">
            {{ linkedProductDetail.productStock ?? '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="分类 ID">
            {{ linkedProductDetail.categoryId ?? '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="商品类型 ID">
            {{ linkedProductDetail.typeId ?? '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="上下架">
            {{ linkedProductDetail.saleStatus ? '上架' : '下架' }}
          </el-descriptions-item>
          <el-descriptions-item label="小程序端显示">
            {{ linkedProductDetail.isShow ? '显示' : '隐藏' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ linkedProductDetail.createTime ? formatDate(new Date(linkedProductDetail.createTime)) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">
            {{ linkedProductDetail.productDesc || '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">
          商品图片
        </el-divider>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div v-if="linkedProductDetail.productDetailCover">
            <div class="mb-2 text-sm text-gray-500">
              详情图
            </div>
            <el-image
              :src="linkedProductDetail.productDetailCover"
              :preview-src-list="[linkedProductDetail.productDetailCover]"
              fit="contain"
              class="h-40 max-w-[320px] w-full"
              preview-teleported
            />
          </div>
          <div v-if="linkedProductDetail.productMainCover">
            <div class="mb-2 text-sm text-gray-500">
              主页图
            </div>
            <el-image
              :src="linkedProductDetail.productMainCover"
              :preview-src-list="[linkedProductDetail.productMainCover]"
              fit="contain"
              class="h-40 max-w-[320px] w-full"
              preview-teleported
            />
          </div>
        </div>

        <el-divider content-position="left">
          商品内容
        </el-divider>
        <div
          v-if="linkedProductDetail.productContent"
          v-dompurify-html="linkedProductDetail.productContent"
          class="max-h-[260px] overflow-y-auto border border-gray-200 rounded p-3"
        />
        <el-empty v-else description="暂无商品内容" :image-size="60" />
      </template>
      <el-empty v-else-if="!linkedProductDetailLoading" description="暂无商品信息" :image-size="80" />
    </div>
    <template #footer>
      <el-button @click="linkedProductDetailVisible = false">
        关闭
      </el-button>
    </template>
  </Dialog>
</template>

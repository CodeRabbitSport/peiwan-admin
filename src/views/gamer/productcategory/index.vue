<script setup lang="ts">
import type { ProductCategory } from '@/api/gamer/productcategory'
import { ProductCategoryApi } from '@/api/gamer/productcategory'
import download from '@/utils/download'
import { isEmpty } from '@/utils/is'

import ProductCategoryForm from './ProductCategoryForm.vue'
import ProductTypeDialog from './ProductTypeDialog.vue'

/** 产品分类 列表 */
defineOptions({ name: 'ProductCategory' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<ProductCategory[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  categoryName: undefined,
  categoryType: undefined,
  orderReceivingStatus: undefined,
  skilledPositionStatus: undefined,
  accompanyTypeStatus: undefined,
  gameType: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
async function getList() {
  loading.value = true
  try {
    const data = await ProductCategoryApi.getProductCategoryPage(queryParams)
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

// 商品类型弹窗
const productTypeDialogRef = ref()
function openProductTypeDialog(categoryId: number, categoryName: string) {
  productTypeDialogRef.value.open(categoryId, categoryName)
}

/** 删除按钮操作 */
async function handleDelete(id: number) {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await ProductCategoryApi.deleteProductCategory(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  }
  catch { }
}

/** 批量删除產品分類 */
async function handleDeleteBatch() {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await ProductCategoryApi.deleteProductCategoryList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  }
  catch { }
}

const checkedIds = ref<number[]>([])
function handleRowCheckboxChange(records: ProductCategory[]) {
  checkedIds.value = records.map(item => item.id)
}

/** 导出按钮操作（已隐藏按钮，保留逻辑以备后用） */
async function handleExport() {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await ProductCategoryApi.exportProductCategory(queryParams)
    download.excel(data, '產品分類.xls')
  }
  catch {
  }
  finally {
    exportLoading.value = false
  }
}

/** 初始化 */
onMounted(() => {
  getList()
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
      label-width="68px"
    >
      <el-form-item label="分类名称" prop="categoryName">
        <el-input
          v-model="queryParams.categoryName"
          placeholder="请输入分类名称"
          clearable

          class="!w-[240px]"
        />
      </el-form-item>

      <el-form-item class="flex flex-wrap gap-2">
        <el-button class="mb-2 sm:mb-0" @click="handleQuery">
          <Icon icon="ep:search" class="mr-[5px]" /> 搜索
        </el-button>
        <el-button class="mb-2 sm:mb-0" @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-[5px]" /> 重置
        </el-button>
        <el-button
          v-hasPermi="['gamer:product-category:create']"
          type="primary"
          plain
          class="mb-2 sm:mb-0"
          @click="openForm('create')"
        >
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button>
        <el-button
          v-if="!isEmpty(checkedIds)"
          v-hasPermi="['gamer:product-category:delete']"
          type="danger"
          plain
          :disabled="isEmpty(checkedIds)"
          class="mb-2 sm:mb-0"
          @click="handleDeleteBatch"
        >
          <Icon icon="ep:delete" class="mr-[5px]" /> 批量删除
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      v-loading="loading"
      row-key="id"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
      @selection-change="handleRowCheckboxChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="分类名称" align="center" prop="categoryName" />
      <!-- <el-table-column label="类型" align="center" prop="categoryType">
        <template #default="scope">
          {{ scope.row.categoryType == 1 ? "陪玩" : "打手" }}
        </template>
      </el-table-column> -->
      <el-table-column label="图标" align="center" prop="categoryIcon">
        <template #default="scope">
          <el-image
            :src="scope.row.categoryIcon"
            :preview-src-list="[scope.row.categoryIcon]"
            fit="cover"
            style="width: 50px; height: 50px; border-radius: 6px;"
            preview-teleported
          />
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            v-hasPermi="['gamer:product-category:update']"
            link
            class="!text-green-500"
            @click="openProductTypeDialog(scope.row.id, scope.row.categoryName)"
          >
            产品类型
          </el-button>
          <el-button
            v-hasPermi="['gamer:product-category:update']"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-hasPermi="['gamer:product-category:delete']"
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
  <ProductCategoryForm ref="formRef" @success="getList" />
  <!-- 商品类型弹窗 -->
  <ProductTypeDialog ref="productTypeDialogRef" />
</template>

<script setup lang="ts">
import type { ProductCategory } from '@/api/gamer/productcategory'
import { ProductCategoryApi } from '@/api/gamer/productcategory'
import type { ProductType } from '@/api/gamer/producttype'
import { ProductTypeApi } from '@/api/gamer/producttype'
import download from '@/utils/download'
import { dateFormatter } from '@/utils/formatTime'
import { isEmpty } from '@/utils/is'

import ProductTypeForm from './ProductTypeForm.vue'

/** 商品類型 列表 */
defineOptions({ name: 'ProductType' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<ProductType[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  typeName: undefined,
  categoryId: undefined,
  isShow: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
async function getList() {
  loading.value = true
  try {
    const data = await ProductTypeApi.getProductTypePage(queryParams)
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
    await ProductTypeApi.deleteProductType(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  }
  catch { }
}

/** 批量删除商品類型 */
async function handleDeleteBatch() {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await ProductTypeApi.deleteProductTypeList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  }
  catch { }
}

const checkedIds = ref<number[]>([])
function handleRowCheckboxChange(records: ProductType[]) {
  checkedIds.value = records.map(item => item.id)
}

/** 导出按钮操作 */
async function handleExport() {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await ProductTypeApi.exportProductType(queryParams)
    download.excel(data, '商品類型.xls')
  }
  catch {
  }
  finally {
    exportLoading.value = false
  }
}

const categoryLoading = ref(false) // 分类搜索加载中
const categoryOptions = ref<ProductCategory[]>([]) // 分类选项

// 初始化时加载一些分类选项
async function loadInitialCategories() {
  try {
    const data = await ProductCategoryApi.getProductCategoryPage()
    categoryOptions.value = data.list
  }
  catch (error) {
    console.error('加载分类选项失败:', error)
  }
}

/** 初始化 */
onMounted(() => {
  getList()
  loadInitialCategories()
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
      <el-form-item label="类型名称" prop="typeName">
        <el-input
          v-model="queryParams.typeName"
          placeholder="请输入类型名称"
          clearable

          class="!w-[240px]"
        />
      </el-form-item>
      <el-form-item label="商品分类" prop="categoryId">
        <el-select
          v-model="queryParams.categoryId"
          placeholder="请选择商品分类"
          clearable
          filterable
          :loading="categoryLoading"
          class="!w-[240px]"
        >
          <el-option
            v-for="item in categoryOptions"
            :key="item.id"
            :label="item.categoryName"
            :value="item.id"
          />
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
          v-hasPermi="['gamer:product-type:create']"
          type="primary"
          plain
          class="mb-2 sm:mb-0"
          @click="openForm('create')"
        >
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button>
        <el-button
          v-hasPermi="['gamer:product-type:export']"
          type="success"
          plain
          :loading="exportLoading"
          class="mb-2 sm:mb-0"
          @click="handleExport"
        >
          <Icon icon="ep:download" class="mr-[5px]" /> 导出
        </el-button>
        <el-button
          v-if="!isEmpty(checkedIds)"
          v-hasPermi="['gamer:product-type:delete']"
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
      <el-table-column label="类型名称" align="center" prop="typeName" />
      <el-table-column label="商品分类" align="center" prop="categoryId" />
      <el-table-column label="是否显示" align="center" prop="isShow">
        <template #default="scope">
          <el-tag v-if="scope.row.isShow" type="primary">
            显示
          </el-tag>
          <el-tag v-else type="danger">
            隐藏
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sortOrder" />
      <el-table-column label="创建时间" align="center" prop="createTime" :formatter="dateFormatter" width="180px" />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            v-hasPermi="['gamer:product-type:update']"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
            编辑
            <template #dot="slotProps" />
          </el-button>
          <el-button
            v-hasPermi="['gamer:product-type:delete']"
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
  <ProductTypeForm ref="formRef" @success="getList" />
</template>

<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-[15px]"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px">
      <el-form-item label="类型名称" prop="typeName">
        <el-input
          v-model="queryParams.typeName"
          placeholder="请输入类型名称"
          clearable
          
          class="!w-[240px]" />
      </el-form-item>
      <el-form-item label="商品分类" prop="categoryId">
        <el-select
          v-model="queryParams.categoryId"
          placeholder="请选择商品分类"
          clearable
          filterable
          :loading="categoryLoading"
          class="!w-[240px]">
          <el-option
            v-for="item in categoryOptions"
            :key="item.id"
            :label="item.categoryName"
            :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item class="flex flex-wrap gap-2">
        <el-button @click="handleQuery" class="mb-2 sm:mb-0">
          <Icon icon="ep:search" class="mr-[5px]" /> 搜索
        </el-button>
        <el-button @click="resetQuery" class="mb-2 sm:mb-0">
          <Icon icon="ep:refresh" class="mr-[5px]" /> 重置
        </el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['gamer:product-type:create']"
          class="mb-2 sm:mb-0">
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['gamer:product-type:export']"
          class="mb-2 sm:mb-0">
          <Icon icon="ep:download" class="mr-[5px]" /> 导出
        </el-button>
        <el-button
          v-if="!isEmpty(checkedIds)"
          type="danger"
          plain
          :disabled="isEmpty(checkedIds)"
          @click="handleDeleteBatch"
          v-hasPermi="['gamer:product-type:delete']"
          class="mb-2 sm:mb-0">
          <Icon icon="ep:delete" class="mr-[5px]" /> 批量删除
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      row-key="id"
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
      @selection-change="handleRowCheckboxChange">
      <el-table-column type="selection" width="55" />
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="类型名称" align="center" prop="typeName" />
      <el-table-column label="商品分类" align="center" prop="categoryId" />
      <el-table-column label="是否显示" align="center" prop="isShow">
        <template #default="scope">
          <el-tag v-if="scope.row.isShow" type="primary">显示</el-tag>
          <el-tag v-else type="danger">隐藏</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sortOrder" />
      <el-table-column label="创建时间" align="center" prop="createTime" :formatter="dateFormatter" width="180px" />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['gamer:product-type:update']">
            编辑
            <template #dot="slotProps"></template>
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['gamer:product-type:delete']">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination :total="total" v-model:page="queryParams.pageNo" v-model:limit="queryParams.pageSize"
      @pagination="getList" />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <ProductTypeForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { ProductTypeApi, ProductType } from '@/api/gamer/producttype'
import ProductTypeForm from './ProductTypeForm.vue'
import { ProductCategory, ProductCategoryApi } from '@/api/gamer/productcategory'

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
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await ProductTypeApi.getProductTypePage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await ProductTypeApi.deleteProductType(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch { }
}

/** 批量删除商品類型 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await ProductTypeApi.deleteProductTypeList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch { }
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: ProductType[]) => {
  checkedIds.value = records.map((item) => item.id);
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await ProductTypeApi.exportProductType(queryParams)
    download.excel(data, '商品類型.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

const categoryLoading = ref(false) // 分类搜索加载中
const categoryOptions = ref<ProductCategory[]>([]) // 分类选项

// 初始化时加载一些分类选项
const loadInitialCategories = async () => {
  try {
    const data = await ProductCategoryApi.getProductCategoryPage()
    categoryOptions.value = data.list
  } catch (error) {
    console.error('加载分类选项失败:', error)
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
  loadInitialCategories()
})
</script>

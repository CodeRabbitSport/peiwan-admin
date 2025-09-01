<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-[15px]"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="80px">
      <el-form-item label="名称" prop="productTitle">
        <el-input
          v-model="queryParams.productTitle"
          placeholder="请输入商品标题"
          clearable
          @keyup.enter="handleQuery"
          class="!w-[240px]" />
      </el-form-item>
      <el-form-item label="分类" prop="categoryId">
        <el-select
          v-model="queryParams.categoryId"
          placeholder="请选择分类"
          clearable
          class="!w-[240px]">
          <el-option
            v-for="category in categoryList"
            :key="category.id"
            :label="category.categoryName"
            :value="category.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="类型" prop="typeId">
        <el-select
          v-model="queryParams.typeId"
          placeholder="请选择商品类型"
          clearable
          class="!w-[240px]">
          <el-option
            v-for="type in typeList"
            :key="type.id"
            :label="type.typeName"
            :value="type.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="上下架" prop="saleStatus">
        <el-select v-model="queryParams.saleStatus" placeholder="请选择上下架状态" clearable class="!w-[240px]">
          <el-option label="上架" :value="true" />
          <el-option label="下架" :value="false" />
        </el-select>
      </el-form-item>
      <el-form-item class="flex flex-wrap gap-2">
        <el-button @click="handleQuery" class="mb-2 sm:mb-0">
          <Icon icon="ep:search" class="mr-[5px]" /> 搜索
        </el-button>
        <el-button @click="resetQuery" class="mb-2 sm:mb-0">
          <Icon icon="ep:refresh" class="mr-[5px]" /> 重置
        </el-button>
        <el-button type="primary" plain @click="openForm('create')" v-hasPermi="['gamer:product:create']"
          class="mb-2 sm:mb-0">
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button>
        <el-button type="success" plain @click="handleExport" :loading="exportLoading"
          v-hasPermi="['gamer:product:export']"
          class="mb-2 sm:mb-0">
          <Icon icon="ep:download" class="mr-[5px]" /> 导出
        </el-button>
        <el-button v-if="!isEmpty(checkedIds)" type="danger" plain :disabled="isEmpty(checkedIds)"
          @click="handleDeleteBatch"
          v-hasPermi="['gamer:product:delete']" class="mb-2 sm:mb-0">
          <Icon icon="ep:delete" class="mr-[5px]" /> 批量删除
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table row-key="id" v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true"
      @selection-change="handleRowCheckboxChange">
      <el-table-column type="selection" width="55" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="商品标题" align="center" prop="productTitle" />
      <el-table-column label="描述" align="center" prop="productDesc" />
      <el-table-column label="库存" align="center" prop="productStock" />
      <el-table-column label="价格" align="center" prop="productPrice" />
      <el-table-column label="等级" align="center" prop="productLevel">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.PLAYERGRADELEVEL" :value="scope.row.productLevel" />
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
            preview-teleported />
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
            preview-teleported />
        </template>
      </el-table-column>
      <el-table-column label="商品内容" align="center" prop="productContent">
        <template #default="scope">
          <div
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['gamer:product:update']"
            class="text-blue-500 cursor-pointer">
            查看详情
          </div>
        </template>
      </el-table-column>
      <el-table-column label="分类" align="center" prop="categoryName" />
      <el-table-column label="商品类型" align="center" prop="typeName" />
      <el-table-column label="上下架" align="center" prop="saleStatus">
        <template #default="scope">
          <el-tag v-if="scope.row.saleStatus" type="primary">上架</el-tag>
          <el-tag v-else type="danger">下架</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" :formatter="dateFormatter" width="180px" />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['gamer:product:update']">
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['gamer:product:delete']">
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
  <ProductForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { DICT_TYPE } from '@/utils/dict'
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { ProductApi, Product } from '@/api/gamer/product'
import { ProductCategory, ProductCategoryApi } from '@/api/gamer/productcategory'
import { ProductType, ProductTypeApi } from '@/api/gamer/producttype'
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
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await ProductApi.getProductPage(queryParams)
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
    await ProductApi.deleteProduct(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch { }
}

/** 批量删除商品 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await ProductApi.deleteProductList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch { }
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: Product[]) => {
  checkedIds.value = records.map((item) => item.id);
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await ProductApi.exportProduct(queryParams)
    download.excel(data, '商品.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 获取分类列表 */
const getCategoryOptions = async () => {
  try {
    const data = await ProductCategoryApi.getProductCategoryPage()
    categoryList.value = data.list || []
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

/** 获取类型列表 */
const getTypeOptions = async () => {
  try {
    const data = await ProductTypeApi.getProductTypePage()
    typeList.value = data.list || []
  } catch (error) {
    console.error('获取类型列表失败:', error)
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
  getCategoryOptions()
  getTypeOptions()
})
</script>

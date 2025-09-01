<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="70vw" align-center>
    <div class="product-type-dialog">
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
            @keyup.enter="handleQuery"
            class="!w-[240px]" />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleQuery">
            <Icon icon="ep:search" class="mr-[5px]" /> 搜索
          </el-button>
          <el-button @click="resetQuery">
            <Icon icon="ep:refresh" class="mr-[5px]" /> 重置
          </el-button>
          <el-button
            type="primary"
            plain
            @click="openForm('create')"
            v-hasPermi="['gamer:product-type:create']">
            <Icon icon="ep:plus" class="mr-[5px]" /> 新增
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 列表 -->
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
        <el-table-column label="是否显示" align="center" prop="isShow">
          <template #default="scope">
            <el-tag v-if="scope.row.isShow" type="primary">显示</el-tag>
            <el-tag v-else type="danger">隐藏</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="排序" align="center" prop="sortOrder" />
        <el-table-column label="操作" align="center" min-width="120px">
          <template #default="scope">
            <el-button
              link
              type="primary"
              @click="openForm('update', scope.row.id)"
              v-hasPermi="['gamer:product-type:update']">
              编辑
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
    </div>

    <!-- 表单弹窗：添加/修改 -->
    <ProductTypeForm ref="formRef" @success="getList" :categoryId="categoryId" />
  </Dialog>
</template>

<script setup lang="ts">
import { ProductTypeApi, ProductType } from '@/api/gamer/producttype'
import ProductTypeForm from '@/views/gamer/producttype/ProductTypeForm.vue'

/** 商品类型弹窗 */
defineOptions({ name: 'ProductTypeDialog' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('商品类型管理') // 弹窗的标题
const categoryId = ref<number>() // 分类ID

const loading = ref(false) // 列表的加载中
const list = ref<ProductType[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive<any>({
  pageNo: 1,
  pageSize: 10,
  typeName: undefined,
  categoryId: undefined
})
const queryFormRef = ref() // 搜索的表单

/** 打开弹窗 */
const open = async (id: number, categoryName?: string) => {
  dialogVisible.value = true
  categoryId.value = id
  queryParams.categoryId = id
  if (categoryName) {
    dialogTitle.value = `${categoryName} - 商品类型管理`
  }
  await getList()
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

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
  queryParams.categoryId = categoryId.value // 重置时保持分类ID
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

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: ProductType[]) => {
  checkedIds.value = records.map((item) => item.id);
}
</script>

<style lang="scss" scoped>
.product-type-dialog {
  .el-form {
    margin-bottom: 15px;
  }
}
</style>

<template>
  <div>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-[15px]"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px">
      <el-form-item label="文章标题" prop="articleTitle">
        <el-input
          v-model="queryParams.articleTitle"
          placeholder="请输入文章标题"
          clearable
          @keyup.enter="handleQuery"
          class="!w-[240px]" />
      </el-form-item>
      <el-form-item>
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
          v-hasPermi="['gamer:article:create']"
          class="mb-2 sm:mb-0">
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['gamer:article:export']"
          class="mb-2 sm:mb-0">
          <Icon icon="ep:download" class="mr-[5px]" /> 导出
        </el-button>
        <el-button
          v-if="!isEmpty(checkedIds)"
          type="danger"
          plain
          :disabled="isEmpty(checkedIds)"
          @click="handleDeleteBatch"
          v-hasPermi="['gamer:article:delete']"
          class="mb-2 sm:mb-0">
          <Icon icon="ep:delete" class="mr-[5px]" /> 批量删除
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
      @selection-change="handleRowCheckboxChange"
      class="mt-4">
      <el-table-column type="selection" width="55" />
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="文章标题" align="center" prop="articleTitle" />
      <el-table-column label="文章简介" align="center" prop="articleDesc" />
      <el-table-column label="文章内容" align="center" prop="articleContent">
        <template #default="scope">
          <div
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['gamer:article:update']"
            class="text-blue-500 cursor-pointer">
            查看详情
          </div>
        </template>
      </el-table-column>
      <el-table-column label="封面图" align="center" prop="cover">
        <template #default="scope">
          <el-image
            :src="scope.row.cover"
            :preview-src-list="[scope.row.cover]"
            fit="cover"
            style="width: 60px; height: 60px; border-radius: 6px;"
            preview-teleported />
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
            v-hasPermi="['gamer:article:update']">
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['gamer:article:delete']">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <Pagination :total="total" v-model:page="queryParams.pageNo" v-model:limit="queryParams.pageSize"
      @pagination="getList"
      class="mt-4" />

    <!-- 表单弹窗：添加/修改 -->
    <ArticleForm ref="formRef" @success="getList" :default-category-id="categoryId" />
  </div>
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { ArticleApi, Article } from '@/api/gamer/article'
import ArticleForm from './ArticleForm.vue'

interface Props {
  categoryId?: number
}

const props = defineProps<Props>()

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<Article[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  categoryId: undefined as number | undefined,
  articleTitle: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 根据分类ID初始化 */
const initWithCategoryId = (categoryId: number) => {
  queryParams.categoryId = categoryId
  queryParams.pageNo = 1
  getList()
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await ArticleApi.getArticlePage(queryParams)
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
  // 保持 categoryId 不变
  const currentCategoryId = queryParams.categoryId
  queryFormRef.value.resetFields()
  queryParams.categoryId = currentCategoryId
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
    await ArticleApi.deleteArticle(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch { }
}

/** 批量删除文章 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await ArticleApi.deleteArticleList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch { }
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: Article[]) => {
  checkedIds.value = records.map((item) => item.id);
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await ArticleApi.exportArticle(queryParams)
    download.excel(data, '文章.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

// 初始化时如果有 categoryId 则自动加载数据
watchEffect(() => {
  if (props.categoryId) {
    initWithCategoryId(props.categoryId)
  }
})

defineExpose({
  initWithCategoryId,
  getList
})
</script>

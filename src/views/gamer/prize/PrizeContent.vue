<template>
  <div>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-[15px]"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px">
      <el-form-item label="奖品标题" prop="prizeTitle">
        <el-input
          v-model="queryParams.prizeTitle"
          placeholder="请输入奖品标题"
          clearable
          
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
          v-hasPermi="['gamer:prize:create']"
          class="mb-2 sm:mb-0">
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['gamer:prize:export']"
          class="mb-2 sm:mb-0">
          <Icon icon="ep:download" class="mr-[5px]" /> 导出
        </el-button>
        <el-button
          v-if="!isEmpty(checkedIds)"
          type="danger"
          plain
          :disabled="isEmpty(checkedIds)"
          @click="handleDeleteBatch"
          v-hasPermi="['gamer:prize:delete']"
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
      <el-table-column label="奖品标题" align="center" prop="prizeTitle" />
      <el-table-column label="概率" align="center" prop="prizeRate" />
      <el-table-column label="描述" align="center" prop="prizeDesc" />
      <el-table-column label="封面图" align="center" prop="prizeCover">
        <template #default="scope">
          <el-image
            :src="scope.row.prizeCover"
            :preview-src-list="[scope.row.prizeCover]"
            fit="cover"
            style="width: 60px; height: 60px; border-radius: 6px;"
            preview-teleported />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" :formatter="dateFormatter" width="180px" />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['gamer:prize:update']">
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['gamer:prize:delete']">
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
    <PrizeForm ref="formRef" @success="getList" :default-group-id="groupId" />
  </div>
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { PrizeApi, Prize } from '@/api/gamer/prize'
import PrizeForm from './PrizeForm.vue'

interface Props {
  groupId?: number
}

const props = defineProps<Props>()

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<Prize[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  groupId: undefined as number | undefined,
  prizeTitle: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 根据分组ID初始化 */
const initWithGroupId = (groupId: number) => {
  queryParams.groupId = groupId
  queryParams.pageNo = 1
  getList()
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await PrizeApi.getPrizePage(queryParams)
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
  // 保持 groupId 不变
  const currentGroupId = queryParams.groupId
  queryFormRef.value.resetFields()
  queryParams.groupId = currentGroupId
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
    await PrizeApi.deletePrize(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch { }
}

/** 批量删除奖品配置 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await PrizeApi.deletePrizeList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch { }
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: Prize[]) => {
  checkedIds.value = records.map((item) => item.id);
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await PrizeApi.exportPrize(queryParams)
    download.excel(data, '奖品配置.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

// 初始化时如果有 groupId 则自动加载数据
watchEffect(() => {
  if (props.groupId) {
    initWithGroupId(props.groupId)
  }
})

defineExpose({
  initWithGroupId,
  getList
})
</script>

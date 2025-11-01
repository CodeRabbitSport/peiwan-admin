<script setup lang="ts">
import type { UserMomentVote } from '@/api/gamer/usermomentvote'
import { UserMomentVoteApi } from '@/api/gamer/usermomentvote'
import download from '@/utils/download'
import { dateFormatter } from '@/utils/formatTime'
import { isEmpty } from '@/utils/is'

import UserMomentVoteForm from './UserMomentVoteForm.vue'

/** 用户投票 列表 */
defineOptions({ name: 'UserMomentVote' })

// 接收来自父层弹窗传入的动态ID（可选）
const props = defineProps<{ momentId?: number }>()

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<UserMomentVote[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  momentId: undefined,
  question: undefined,
  multiple: undefined,
  deadline: [],
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
async function getList() {
  loading.value = true
  try {
    const data = await UserMomentVoteApi.getUserMomentVotePage(queryParams)
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

// 当从父组件传入 momentId 时，自动按该动态筛选
watch(
  () => props.momentId,
  (val) => {
    if (val !== undefined && val !== null) {
      queryParams.momentId = val as any
      handleQuery()
    }
  },
  { immediate: true },
)

/** 添加/修改操作 */
const formRef = ref()
function openForm(type: string, id?: number) {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const currentRow = ref<Record<string, any>>({})
async function handleDelete(id: number) {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await UserMomentVoteApi.deleteUserMomentVote(id)
    message.success(t('common.delSuccess'))
    currentRow.value = {}
    // 刷新列表
    await getList()
  }
  catch {}
}

/** 批量删除用户投票 */
async function handleDeleteBatch() {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await UserMomentVoteApi.deleteUserMomentVoteList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  }
  catch {}
}

const checkedIds = ref<number[]>([])
function handleRowCheckboxChange(records: UserMomentVote[]) {
  checkedIds.value = records.map(item => item.id)
}

/** 导出按钮操作 */
async function handleExport() {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await UserMomentVoteApi.exportUserMomentVote(queryParams)
    download.excel(data, '用户投票.xls')
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
      <el-form-item label="动态ID" prop="momentId">
        <el-input
          v-model="queryParams.momentId"
          placeholder="请输入动态ID"
          clearable

          class="!w-[240px]"
        />
      </el-form-item>
      <el-form-item label="投票问题" prop="question">
        <el-input
          v-model="queryParams.question"
          placeholder="请输入投票问题"
          clearable

          class="!w-[240px]"
        />
      </el-form-item>
      <el-form-item label="是否多选" prop="multiple">
        <el-select
          v-model="queryParams.multiple"
          placeholder="请选择是否多选"
          clearable
          class="!w-[240px]"
        >
          <el-option label="单选" :value="0" />
          <el-option label="多选" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="截止时间" prop="deadline">
        <el-date-picker
          v-model="queryParams.deadline"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-[220px]"
        />
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-[220px]"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" class="mr-[5px]" /> 搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-[5px]" /> 重置
        </el-button>
        <el-button
          v-hasPermi="['gamer:user-moment-vote:create']"
          type="primary"
          plain
          @click="openForm('create')"
        >
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button>
        <el-button
          v-hasPermi="['gamer:user-moment-vote:export']"
          type="success"
          plain
          :loading="exportLoading"
          @click="handleExport"
        >
          <Icon icon="ep:download" class="mr-[5px]" /> 导出
        </el-button>
        <el-button
          v-hasPermi="['gamer:user-moment-vote:delete']"
          type="danger"
          plain
          :disabled="isEmpty(checkedIds)"
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
      <el-table-column label="主键ID" align="center" prop="id" />
      <el-table-column label="动态ID" align="center" prop="momentId" />
      <el-table-column label="投票问题" align="center" prop="question" />
      <el-table-column label="是否多选" align="center" prop="multiple">
        <template #default="scope">
          <el-tag
            :type="scope.row.multiple === 0 ? 'success' : scope.row.multiple === 1 ? 'danger' : 'info'"
          >
            {{ scope.row.multiple === 0 ? '单选' : scope.row.multiple === 1 ? '多选' : '未知' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="截止时间"
        align="center"
        prop="deadline"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <!-- <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            v-hasPermi="['gamer:user-moment-vote:update']"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-hasPermi="['gamer:user-moment-vote:delete']"
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column> -->
    </el-table>
    <!-- 分页 -->
    <Pagination
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <UserMomentVoteForm ref="formRef" @success="getList" />
</template>

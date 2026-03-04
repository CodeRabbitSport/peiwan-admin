<script setup lang="ts">
import type { UserGrade } from '@/api/userCenter/usergrade'
import { UserGradeApi } from '@/api/userCenter/usergrade'
import download from '@/utils/download'
import { isEmpty } from '@/utils/is'

import UserGradeForm from './UserGradeForm.vue'

/** 用户等级配置 列表 */
defineOptions({ name: 'UserGrade' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<UserGrade[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  levelNumber: undefined,
  levelName: undefined,
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
async function getList() {
  loading.value = true
  try {
    const data = await UserGradeApi.getUserGradePage(queryParams)
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
    await UserGradeApi.deleteUserGrade(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  }
  catch {}
}

/** 批量删除用户等级配置 */
async function handleDeleteBatch() {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await UserGradeApi.deleteUserGradeList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  }
  catch {}
}

const checkedIds = ref<number[]>([])
function handleRowCheckboxChange(records: UserGrade[]) {
  checkedIds.value = records.map(item => item.id!)
}

/** 解析等级权益 JSON，格式 [{ icon, subTitle, title }] */
function parseLevelPrivileges(jsonStr: string | undefined): { icon?: string, subTitle?: string, title?: string }[] {
  if (!jsonStr || typeof jsonStr !== 'string') return []
  try {
    const parsed = JSON.parse(jsonStr)
    return Array.isArray(parsed) ? parsed : []
  }
  catch {
    return []
  }
}

/** 导出按钮操作 */
async function handleExport() {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await UserGradeApi.exportUserGrade(queryParams)
    download.excel(data, '用户等级配置.xls')
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
      <el-form-item label="等级编号" prop="levelNumber">
        <el-input
          v-model="queryParams.levelNumber"
          placeholder="请输入等级编号"
          clearable
          class="!w-[240px]"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="等级名称" prop="levelName">
        <el-input
          v-model="queryParams.levelName"
          placeholder="请输入等级名称"
          clearable
          class="!w-[240px]"
          @keyup.enter="handleQuery"
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
          v-hasPermi="['userCenter:user-grade:create']"
          type="primary"
          plain
          @click="openForm('create')"
        >
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button>
        <el-button
          v-hasPermi="['userCenter:user-grade:export']"
          type="success"
          plain
          :loading="exportLoading"
          @click="handleExport"
        >
          <Icon icon="ep:download" class="mr-[5px]" /> 导出
        </el-button>
        <el-button
          v-hasPermi="['userCenter:user-grade:delete']"
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
      <!-- <el-table-column label="主键" align="center" prop="id" /> -->
      <el-table-column label="等级号" align="center" prop="levelNumber" />
      <el-table-column label="等级名称" align="center" prop="levelName" />
      <el-table-column label="等级图标" align="center" prop="levelIcon" min-width="80">
        <template #default="scope">
          <el-image
            v-if="scope.row.levelIcon"
            :src="scope.row.levelIcon"
            :preview-src-list="[scope.row.levelIcon]"
            fit="cover"
            style="width: 50px; height: 50px; border-radius: 6px;"
            preview-teleported
          />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="等级封面" align="center" prop="levelCover" min-width="80">
        <template #default="scope">
          <el-image
            v-if="scope.row.levelCover"
            :src="scope.row.levelCover"
            :preview-src-list="[scope.row.levelCover]"
            fit="cover"
            style="width: 50px; height: 50px; border-radius: 6px;"
            preview-teleported
          />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="等级描述" align="center" prop="levelDescription" /> -->
      <!-- <el-table-column label="等级权益" align="center" prop="levelPrivileges" min-width="200">
        <template #default="scope">
          <div v-if="scope.row.levelPrivileges" class="flex flex-wrap justify-center gap-2">
            <template v-for="(item, idx) in parseLevelPrivileges(scope.row.levelPrivileges)" :key="idx">
              <div class="max-w-[180px] flex items-center gap-1.5 border border-gray-200 rounded bg-gray-50 px-2 py-1 text-xs">
                <el-image
                  v-if="item.icon"
                  :src="item.icon"
                  :preview-src-list="[item.icon]"
                  fit="cover"
                  class="h-6 w-6 shrink-0 rounded"
                  preview-teleported
                />
                <span class="truncate" :title="(item.title || '') + (item.subTitle ? ` - ${item.subTitle}` : '')">
                  {{ item.title || '-' }}{{ item.subTitle ? ` · ${item.subTitle}` : '' }}
                </span>
              </div>
            </template>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column> -->
      <el-table-column label="升级所需数" align="center" prop="levelUpgradePoints">
        <template #default="scope">
          {{ scope.row.levelUpgradePoints ? Number(scope.row.levelUpgradePoints) / 100 : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            v-hasPermi="['userCenter:user-grade:update']"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-hasPermi="['userCenter:user-grade:delete']"
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
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <UserGradeForm ref="formRef" @success="getList" />
</template>

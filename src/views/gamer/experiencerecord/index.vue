<script setup lang="ts">
import type { ExperienceRecord } from '@/api/userCenter/experiencerecord'
import { ExperienceRecordApi } from '@/api/userCenter/experiencerecord'
import { fenToYuan } from '@/utils'
import download from '@/utils/download'
import { dateFormatter } from '@/utils/formatTime'

defineOptions({ name: 'GamerExperienceRecord' })

const props = defineProps<{ userId?: number }>()

const message = useMessage()

const loading = ref(true)
const list = ref<ExperienceRecord[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: undefined,
  changeType: undefined,
  operatorName: undefined,
  createTime: [],
})
const queryFormRef = ref()
const exportLoading = ref(false)

function getChangeTypeTag(type?: number) {
  if (type === 1) return 'success'
  if (type === 2) return 'danger'
  return 'info'
}

function getChangeTypeLabel(type?: number) {
  if (type === 1) return '增加'
  if (type === 2) return '减少'
  return '未知'
}

async function getList() {
  loading.value = true
  try {
    const data = await ExperienceRecordApi.getExperienceRecordPage(queryParams)
    list.value = data.list
    total.value = data.total
  }
  finally {
    loading.value = false
  }
}

function handleQuery() {
  queryParams.pageNo = 1
  getList()
}

function resetQuery() {
  queryFormRef.value.resetFields()
  if (props.userId !== undefined && props.userId !== null) {
    queryParams.userId = props.userId as any
  }
  handleQuery()
}

watch(
  () => props.userId,
  (val) => {
    if (val !== undefined && val !== null) {
      queryParams.userId = val as any
      handleQuery()
    }
  },
  { immediate: true },
)

async function handleExport() {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await ExperienceRecordApi.exportExperienceRecord(queryParams)
    download.excel(data, '积分流水.xls')
  }
  catch {
  }
  finally {
    exportLoading.value = false
  }
}

onMounted(() => {
  getList()
})
</script>

<template>
  <ContentWrap>
    <el-form
      ref="queryFormRef"
      class="-mb-[15px]"
      :model="queryParams"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="用户" prop="userId">
        <UserMultiSelectInput
          v-model="queryParams.userId"
          :disabled="props?.userId !== undefined && props?.userId !== null"
          :multiple="false"
          placeholder="请选择用户"
          @change="handleQuery"
        />
      </el-form-item>

      <el-form-item label="类型" prop="changeType">
        <el-select
          v-model="queryParams.changeType"
          placeholder="请选择类型"
          clearable
          class="!w-[240px]"
        >
          <el-option label="增加" :value="1" />
          <el-option label="减少" :value="2" />
        </el-select>
      </el-form-item>

      <el-form-item label="操作人" prop="operatorName">
        <el-input
          v-model="queryParams.operatorName"
          placeholder="请输入操作人名称"
          clearable
          class="!w-[240px]"
        />
      </el-form-item>

      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" class="mr-[5px]" /> 搜索
        </el-button>
        <el-button :loading="exportLoading" @click="handleExport">
          <Icon icon="ep:position" class="mr-[5px]" /> 导出
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-[5px]" /> 重置
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table
      v-loading="loading"
      row-key="id"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
    >
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="用户ID" align="center" prop="userId" />
      <el-table-column label="类型" align="center" prop="changeType">
        <template #default="scope">
          <el-tag :type="getChangeTypeTag(scope.row.changeType)">
            {{ getChangeTypeLabel(scope.row.changeType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="变动积分" align="center" prop="changeExperience">
        <template #default="scope">
          {{ fenToYuan(scope.row.changeExperience) }}
        </template>
      </el-table-column>
      <el-table-column label="变动前积分" align="center" prop="beforeTotalExperience">
        <template #default="scope">
          {{ fenToYuan(scope.row.beforeTotalExperience) }}
        </template>
      </el-table-column>
      <el-table-column label="变动后积分" align="center" prop="afterTotalExperience">
        <template #default="scope">
          {{ fenToYuan(scope.row.afterTotalExperience) }}
        </template>
      </el-table-column>
      <el-table-column label="操作人" align="center" prop="operatorName" />
      <el-table-column label="备注" align="center" prop="remark" min-width="220" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
    </el-table>
    <Pagination
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>
</template>

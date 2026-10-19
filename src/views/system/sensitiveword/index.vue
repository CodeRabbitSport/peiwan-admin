<script lang="ts" setup>
import type { FormInstance } from 'element-plus'

import type { SensitiveWordVO } from '@/api/gamer/sensitiveword'
import * as SensitiveWordApi from '@/api/gamer/sensitiveword'
import { getTenantId } from '@/utils/auth'
import { dateFormatter } from '@/utils/formatTime'

import SensitiveWordForm from './SensitiveWordForm.vue'

defineOptions({ name: 'SystemSensitiveWord' })

const message = useMessage()
const loading = ref(false)
const total = ref(0)
const list = ref<SensitiveWordVO[]>([])
const queryFormRef = ref<FormInstance>()
const formRef = ref<InstanceType<typeof SensitiveWordForm>>()
const queryParams = reactive({ pageNo: 1, pageSize: 10, word: '', status: undefined as number | undefined })
const canModify = Number(getTenantId()) === 1

async function getList() {
  loading.value = true
  try {
    const data = await SensitiveWordApi.getSensitiveWordPage(queryParams)
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
  queryFormRef.value?.resetFields()
  handleQuery()
}

async function handleDelete(row: SensitiveWordVO) {
  if (row.id === undefined) return
  try {
    await message.delConfirm(`确定删除敏感词“${row.word}”吗？`)
  }
  catch {
    return
  }
  await SensitiveWordApi.deleteSensitiveWord(row.id)
  message.success('删除成功')
  if (list.value.length === 1 && queryParams.pageNo > 1) queryParams.pageNo--
  await getList()
}

const updatingId = ref<number>()
async function toggleStatus(row: SensitiveWordVO) {
  if (row.id === undefined || updatingId.value !== undefined) return
  updatingId.value = row.id
  try {
    await SensitiveWordApi.updateSensitiveWord({ ...row, status: row.status === 0 ? 1 : 0 })
    message.success(row.status === 0 ? '已停用' : '已启用')
    await getList()
  }
  finally {
    updatingId.value = undefined
  }
}

onMounted(getList)
</script>

<template>
  <ContentWrap>
    <el-alert
      title="全平台共用敏感词库，修改对所有租户生效。命中敏感词会禁止发送当前消息，并检查同一会话中该用户的前 3 条文本；空白、标点和大小写不影响匹配。"
      type="warning"
      :closable="false"
      show-icon
      class="sensitive-word-alert"
    />
    <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="-mb-15px">
      <el-form-item label="敏感词" prop="word">
        <el-input v-model="queryParams.word" placeholder="请输入敏感词" clearable class="!w-240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="全部状态" clearable class="!w-160px">
          <el-option label="启用" :value="0" />
          <el-option label="停用" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" class="mr-5px" />搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-5px" />重置
        </el-button>
        <el-button v-hasPermi="['gamer:sensitive-word:create']" type="primary" plain @click="formRef?.open()">
          <Icon icon="ep:plus" class="mr-5px" />新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>
  <ContentWrap>
    <el-table v-loading="loading" :data="list" row-key="id">
      <el-table-column label="编号" prop="id" width="90" align="center" />
      <el-table-column label="敏感词" prop="word" min-width="180" show-overflow-tooltip />
      <el-table-column label="状态" prop="status" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 0 ? 'success' : 'info'">
            {{ row.status === 0 ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
      <el-table-column label="创建时间" prop="createTime" width="180" :formatter="dateFormatter" />
      <el-table-column v-if="canModify" label="操作" width="220" align="center">
        <template #default="{ row }">
          <el-button v-hasPermi="['gamer:sensitive-word:update']" type="primary" link @click="formRef?.open(row.id)">
            编辑
          </el-button>
          <el-button v-hasPermi="['gamer:sensitive-word:update']" type="primary" link :disabled="updatingId !== undefined" @click="toggleStatus(row)">
            {{ row.status === 0 ? '停用' : '启用' }}
          </el-button>
          <el-button v-hasPermi="['gamer:sensitive-word:delete']" type="danger" link @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination v-model:page="queryParams.pageNo" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
  </ContentWrap>
  <SensitiveWordForm ref="formRef" @success="getList" />
</template>

<style scoped>
.sensitive-word-alert {
  padding: 16px;
  margin-bottom: 20px;
}
</style>

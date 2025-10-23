<script setup lang="ts">
import { nextTick, reactive, ref, watch } from 'vue'

import { UserInfoApi } from '@/api/gamer/userinfo'

interface Emits {
  (e: 'confirm', user: any): void
}

const emit = defineEmits<Emits>()
const visible = ref(false)
const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const currentUser = ref<any>(null)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  id: undefined as number | undefined,
  phone: undefined as string | undefined,
  nickname: undefined as string | undefined,
  categoryType: undefined as number | undefined,
  categoryId: undefined as number | undefined,
})
const queryFormRef = ref()
const tableRef = ref<{ clearSelection: () => void, toggleRowSelection: (row: any, selected?: boolean) => void } | null>(null)
const isProgrammaticSelection = ref(false)

function open(selectedUserId?: number, categoryType?: number, categoryId?: number) {
  visible.value = true
  currentUser.value = selectedUserId ? { id: selectedUserId } : null
  if (selectedUserId)
    queryParams.id = selectedUserId
  if (categoryType)
    queryParams.categoryType = categoryType
  if (categoryId)
    queryParams.categoryId = categoryId
  handleQuery()
}

async function getList() {
  loading.value = true
  try {
    const data = await UserInfoApi.getUserInfoPageByLevel(queryParams)
    list.value = data.list
    total.value = data.total
    await nextTick()
    if (tableRef.value) tableRef.value.clearSelection()
    if (currentUser.value) {
      const match = data.list.find((item: any) => item.id === currentUser.value.id)
      if (match && tableRef.value) {
        currentUser.value = match
        isProgrammaticSelection.value = true
        tableRef.value.toggleRowSelection(match, true)
        isProgrammaticSelection.value = false
      }
    }
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
  currentUser.value = null
  handleQuery()
}

function selectRow(row: any) {
  if (!row || !tableRef.value) return
  isProgrammaticSelection.value = true
  tableRef.value.clearSelection()
  tableRef.value.toggleRowSelection(row, true)
  isProgrammaticSelection.value = false
  currentUser.value = row
}

function handleSelectionChange(selection: any[]) {
  if (isProgrammaticSelection.value) return
  if (!selection.length) {
    currentUser.value = null
    return
  }
  selectRow(selection[selection.length - 1])
}

function handleRowClick(row: any) {
  selectRow(row)
}

function handleRowDblClick(row: any) {
  selectRow(row)
  confirmSelection()
}

function confirmSelection() {
  if (!currentUser.value) return
  visible.value = false
  emit('confirm', currentUser.value)
}

watch(visible, (val) => {
  if (!val) currentUser.value = null
})

defineExpose({ open })
</script>

<template>
  <Dialog
    v-model="visible"
    align-center
    title="选择用户"
    width="900px"
  >
    <ContentWrap>
      <el-form
        ref="queryFormRef"
        :inline="true"
        :model="queryParams"
        label-width="80px"
      >
        <el-form-item label="用户ID" prop="id">
          <el-input
            v-model="queryParams.id"
            placeholder="请输入用户ID"
            clearable
            class="!w-[220px]"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="queryParams.phone"
            placeholder="请输入手机号"
            clearable
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
        </el-form-item>
      </el-form>
    </ContentWrap>

    <ContentWrap class="mt-3">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="list"
        row-key="id"
        highlight-current-row
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        @row-dblclick="handleRowDblClick"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="用户ID" align="center" prop="id" width="100" />

        <el-table-column label="头像" align="center" prop="avatar" width="90">
          <template #default="scope">
            <el-avatar v-if="scope.row.avatar" :src="scope.row.avatar" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="昵称" align="center" prop="nickname" />
        <el-table-column label="手机号" align="center" prop="mobile" />
      </el-table>
      <Pagination
        v-model:page="queryParams.pageNo"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="getList"
      />
    </ContentWrap>

    <template #footer>
      <el-button type="primary" :disabled="!currentUser" @click="confirmSelection">
        确 定
      </el-button>
      <el-button @click="visible = false">
        取 消
      </el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { nextTick, reactive, ref, watch } from 'vue'

import { UserInfoApi } from '@/api/gamer/userinfo'

interface Emits {
  (e: 'confirm', users: any[]): void
}

const emit = defineEmits<Emits>()
const visible = ref(false)
const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const selectedUsers = ref<any[]>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  id: undefined as number | undefined,
  phone: undefined as string | undefined,
  nickname: undefined as string | undefined,
})
const queryFormRef = ref()
const tableRef = ref<{ clearSelection: () => void, toggleRowSelection: (row: any, selected?: boolean) => void } | null>(null)

function open(preSelectedIds?: number[]) {
  visible.value = true
  selectedUsers.value = []
  if (preSelectedIds && preSelectedIds.length) {
    // 预选ID仅用于展示高亮，最终以手动勾选为准
    // 拉取第一页并尽量选中
  }
  handleQuery()
}

async function getList() {
  loading.value = true
  try {
    const data = await UserInfoApi.getUserInfoPage(queryParams)
    list.value = data.list
    total.value = data.total
    await nextTick()
    if (tableRef.value) {
      // 尝试同步已选
      const selectedIdSet = new Set(selectedUsers.value.map(u => u.id))
      list.value.forEach((row) => {
        if (selectedIdSet.has(row.id)) tableRef.value!.toggleRowSelection(row, true)
      })
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
  handleQuery()
}

function handleSelectionChange(selection: any[]) {
  selectedUsers.value = selection
}

function handleRowDblClick(row: any) {
  // 双击切换选中
  if (!tableRef.value) return
  const isSelected = selectedUsers.value.some(u => u.id === row.id)
  tableRef.value.toggleRowSelection(row, !isSelected)
}

function confirmSelection() {
  visible.value = false
  emit('confirm', selectedUsers.value)
}

watch(visible, (val) => {
  if (!val) selectedUsers.value = []
})

defineExpose({ open })
</script>

<template>
  <Dialog v-model="visible" align-center title="选择用户(多选)" width="900px">
    <ContentWrap>
      <el-form ref="queryFormRef" :inline="true" :model="queryParams" label-width="80px">
        <el-form-item label="用户ID" prop="id">
          <el-input v-model="queryParams.id" placeholder="请输入用户ID" clearable class="!w-[220px]" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="queryParams.phone" placeholder="请输入手机号" clearable class="!w-[220px]" />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-[5px]" /> 搜索</el-button>
          <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-[5px]" /> 重置</el-button>
        </el-form-item>
      </el-form>
    </ContentWrap>

    <ContentWrap class="mt-3">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="list"
        row-key="id"
        @selection-change="handleSelectionChange"
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
      <Pagination v-model:page="queryParams.pageNo" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </ContentWrap>

    <template #footer>
      <el-button type="primary" :disabled="!selectedUsers.length" @click="confirmSelection">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </template>
  </Dialog>
</template>


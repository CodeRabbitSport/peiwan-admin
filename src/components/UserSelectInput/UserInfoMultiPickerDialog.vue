<script setup lang="ts">
import { nextTick, reactive, ref, watch } from 'vue'

import { UserInfoApi } from '@/api/gamer/userinfo'

interface Emits {
  (e: 'confirm', users: any[]): void
}

const props = withDefaults(defineProps<{
  multiple?: boolean
}>(), {
  multiple: true,
})

const emit = defineEmits<Emits>()
const visible = ref(false)
const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const selectedUsers = ref<any[]>([])
const selectedUserId = ref<number | undefined>(undefined) // 单选模式下的选中用户ID
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  id: undefined as number | undefined,
  phone: undefined as string | undefined,
  nickname: undefined as string | undefined,
})
const queryFormRef = ref()
const tableRef = ref<{ clearSelection: () => void, toggleRowSelection: (row: any, selected?: boolean) => void } | null>(null)

function open(preSelectedIds?: number[], multiple = true) {
  visible.value = true
  selectedUsers.value = []
  selectedUserId.value = undefined
  if (!multiple && preSelectedIds && preSelectedIds.length > 0) {
    // 单选模式，预选第一个
    selectedUserId.value = preSelectedIds[0]
  }
  else if (preSelectedIds && preSelectedIds.length) {
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
  if (props.multiple) {
    selectedUsers.value = selection
  }
}

function handleRowClick(row: any) {
  if (!props.multiple) {
    // 单选模式：点击选中
    selectedUserId.value = row.id
  }
  else {
    // 多选模式：点击切换选中
    if (!tableRef.value) return
    const isSelected = selectedUsers.value.some(u => u.id === row.id)
    tableRef.value.toggleRowSelection(row, !isSelected)
  }
}

function handleRowDblClick(row: any) {
  if (!props.multiple) {
    // 单选模式：双击直接确认
    selectedUserId.value = row.id
    confirmSelection()
    return
  }
  // 多选模式：双击切换选中
  if (!tableRef.value) return
  const isSelected = selectedUsers.value.some(u => u.id === row.id)
  tableRef.value.toggleRowSelection(row, !isSelected)
}

function confirmSelection() {
  visible.value = false
  if (!props.multiple) {
    // 单选模式：返回选中的用户
    const user = list.value.find(u => u.id === selectedUserId.value)
    emit('confirm', user ? [user] : [])
  }
  else {
    // 多选模式
    emit('confirm', selectedUsers.value)
  }
}

watch(visible, (val) => {
  if (!val) {
    selectedUsers.value = []
    selectedUserId.value = undefined
  }
})

defineExpose({ open })
</script>

<template>
  <Dialog v-model="visible" align-center :title="multiple ? '选择用户(多选)' : '选择用户(单选)'" width="900px">
    <ContentWrap>
      <el-form ref="queryFormRef" :inline="true" :model="queryParams" label-width="80px">
        <el-form-item label="用户ID" prop="id">
          <el-input v-model="queryParams.id" placeholder="请输入用户ID" clearable class="!w-[220px]" />
        </el-form-item>
        <!-- 昵称 -->
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="queryParams.nickname" placeholder="请输入昵称" clearable class="!w-[220px]" />
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
        highlight-current-row
        @row-click="handleRowClick"
        @selection-change="handleSelectionChange"
        @row-dblclick="handleRowDblClick"
      >
        <el-table-column v-if="multiple" type="selection" width="55" align="center" />
        <el-table-column v-else width="55" align="center">
          <template #default="scope">
            <el-radio v-model="selectedUserId" :value="scope.row.id" @click.stop>
              <span />
            </el-radio>
          </template>
        </el-table-column>
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
      <el-button type="primary" :disabled="multiple ? !selectedUsers.length : !selectedUserId" @click="confirmSelection">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </template>
  </Dialog>
</template>


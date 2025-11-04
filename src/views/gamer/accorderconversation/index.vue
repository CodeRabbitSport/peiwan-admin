<script setup lang="ts">
import type { AccOrderConversation } from '@/api/gamer/accorderconversation'
import { AccOrderConversationApi } from '@/api/gamer/accorderconversation'
import download from '@/utils/download'
import { dateFormatter } from '@/utils/formatTime'
import { isEmpty } from '@/utils/is'
import AccOrderConversationMessage from '@/views/gamer/accorderconversationmessage/index.vue'

import AccOrderConversationForm from './AccOrderConversationForm.vue'

/** 陪玩订单会话 列表 */
defineOptions({ name: 'AccOrderConversation' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<AccOrderConversation[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  orderId: undefined,
  customerId: undefined,
  sellerId: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
async function getList() {
  loading.value = true
  try {
    const data = await AccOrderConversationApi.getAccOrderConversationPage(queryParams)
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
    await AccOrderConversationApi.deleteAccOrderConversation(id)
    message.success(t('common.delSuccess'))
    currentRow.value = {}
    // 刷新列表
    await getList()
  }
  catch {}
}

/** 批量删除陪玩订单会话 */
async function handleDeleteBatch() {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await AccOrderConversationApi.deleteAccOrderConversationList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  }
  catch {}
}

const checkedIds = ref<number[]>([])
function handleRowCheckboxChange(records: AccOrderConversation[]) {
  checkedIds.value = records.map(item => item.id!)
}

/** 导出按钮操作 */
async function handleExport() {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await AccOrderConversationApi.exportAccOrderConversation(queryParams)
    download.excel(data, '陪玩订单会话.xls')
  }
  catch {
  }
  finally {
    exportLoading.value = false
  }
}

const recordDialogVisible = ref(false)
const recordConversationId = ref<number | undefined>()
function openRecordDialog(row: AccOrderConversation) {
  recordConversationId.value = row.id
  recordDialogVisible.value = true
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
      <el-form-item label="订单ID" prop="orderId">
        <el-input
          v-model="queryParams.orderId"
          placeholder="请输入订单ID"
          clearable
          class="!w-[240px]"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="客户" prop="customerId">
        <UserSelectInput
          v-model="queryParams.customerId"
          placeholder="请选择客户"
          @change="handleQuery"
        />
      </el-form-item>
      <el-form-item label="接单人" prop="sellerId">
        <UserSelectInput
          v-model="queryParams.sellerId"
          placeholder="请选择接单人"
          @change="handleQuery"
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
          v-hasPermi="['gamer:acc-order-conversation:create']"
          type="primary"
          plain
          @click="openForm('create')"
        >
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button>
        <el-button
          v-hasPermi="['gamer:acc-order-conversation:export']"
          type="success"
          plain
          :loading="exportLoading"
          @click="handleExport"
        >
          <Icon icon="ep:download" class="mr-[5px]" /> 导出
        </el-button>
        <el-button
          v-hasPermi="['gamer:acc-order-conversation:delete']"
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
      <el-table-column label="会话编号" align="center" prop="id" />
      <el-table-column label="订单ID" align="center" prop="orderId" />
      <el-table-column label="客户ID" align="center" prop="customerId" />
      <el-table-column label="客户昵称" align="center" prop="customerNickname" />
      <el-table-column label="接单人ID" align="center" prop="sellerId" />
      <el-table-column label="接单人昵称" align="center" prop="sellerNickname" />
      <el-table-column
        label="最新消息时间"
        align="center"
        prop="lastMessageAt"
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
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            v-hasPermi="['gamer:order-conversation:update']"
            link
            type="primary"
            @click="openRecordDialog(scope.row)"
          >
            查询记录
          </el-button>
          <!-- <el-button
            v-hasPermi="['gamer:acc-order-conversation:update']"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
            编辑
            <template #default="slotProps"></template>
          </el-button>
          <el-button
            v-hasPermi="['gamer:acc-order-conversation:delete']"
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
          >
            删除
          </el-button> -->
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

  <el-dialog v-model="recordDialogVisible" title="会话记录" width="80%" destroy-on-close>
    <AccOrderConversationMessage :embed="true" :conversation-id="recordConversationId" />
  </el-dialog>
  <!-- 表单弹窗：添加/修改 -->
  <AccOrderConversationForm ref="formRef" @success="getList" />
</template>

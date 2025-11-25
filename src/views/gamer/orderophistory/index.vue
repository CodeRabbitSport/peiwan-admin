<script setup lang="ts">
import type { OrderOpHistory } from '@/api/gamer/orderophistory'
import { OrderOpHistoryApi } from '@/api/gamer/orderophistory'
import download from '@/utils/download'
import { dateFormatter } from '@/utils/formatTime'
import { isEmpty } from '@/utils/is'

import OrderOpHistoryForm from './OrderOpHistoryForm.vue'

/** 订单操作历史记录 列表 */
defineOptions({ name: 'OrderOpHistory' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<OrderOpHistory[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  orderId: undefined,
  orderType: undefined,
  operatorId: undefined,
  operatorType: undefined,
  operatorName: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
async function getList() {
  loading.value = true
  try {
    const data = await OrderOpHistoryApi.getOrderOpHistoryPage(queryParams)
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

const checkedIds = ref<number[]>([])
function handleRowCheckboxChange(records: OrderOpHistory[]) {
  checkedIds.value = records.map(item => item.id!)
}

/** 删除按钮操作 */
async function _handleDelete(id: number) {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await OrderOpHistoryApi.deleteOrderOpHistory(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  }
  catch {}
}

/** 批量删除订单操作历史记录 */
async function handleDeleteBatch() {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await OrderOpHistoryApi.deleteOrderOpHistoryList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  }
  catch {}
}

/** 导出按钮操作 */
async function handleExport() {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await OrderOpHistoryApi.exportOrderOpHistory(queryParams)
    download.excel(data, '订单操作历史记录.xls')
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
      <el-form-item label="订单ID" prop="orderId">
        <el-input
          v-model="queryParams.orderId"
          placeholder="请输入订单ID"
          clearable
          class="!w-[240px]"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单类型: 1=陪玩订单, 2=打手订单" prop="orderType">
        <el-select
          v-model="queryParams.orderType"
          placeholder="请选择订单类型: 1=陪玩订单, 2=打手订单"
          clearable
          class="!w-[240px]"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作人ID" prop="operatorId">
        <el-input
          v-model="queryParams.operatorId"
          placeholder="请输入操作人ID"
          clearable
          class="!w-[240px]"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="操作人类型: 1=customer, 2=acceptor, 3=admin, 4=system" prop="operatorType">
        <el-select
          v-model="queryParams.operatorType"
          placeholder="请选择操作人类型: 1=customer, 2=acceptor, 3=admin, 4=system"
          clearable
          class="!w-[240px]"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作人名称" prop="operatorName">
        <el-input
          v-model="queryParams.operatorName"
          placeholder="请输入操作人名称"
          clearable
          class="!w-[240px]"
          @keyup.enter="handleQuery"
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
          v-hasPermi="['gamer:order-op-history:create']"
          type="primary"
          plain
          @click="openForm('create')"
        >
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button>
        <el-button
          v-hasPermi="['gamer:order-op-history:export']"
          type="success"
          plain
          :loading="exportLoading"
          @click="handleExport"
        >
          <Icon icon="ep:download" class="mr-[5px]" /> 导出
        </el-button>
        <el-button
          v-hasPermi="['gamer:order-op-history:delete']"
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
      <el-table-column label="订单ID" align="center" prop="orderId" />
      <el-table-column label="订单类型" align="center" prop="orderType">
        <template #default="scope">
          <el-tag
            v-if="scope.row.orderType === 1"
            type="success"
          >
            陪玩订单
          </el-tag>
          <el-tag
            v-else-if="scope.row.orderType === 2"
            type="primary"
          >
            打手订单
          </el-tag>
          <span v-else>{{ scope.row.orderType || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作时间"
        align="center"
        prop="operateTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作内容" align="center" prop="operateContent" />
      <el-table-column label="操作人ID" align="center" prop="operatorId" />
      <el-table-column label="操作人类型" align="center" prop="operatorType">
        <template #default="scope">
          <el-tag
            v-if="scope.row.operatorType === 1"
            type="info"
          >
            customer
          </el-tag>
          <el-tag
            v-else-if="scope.row.operatorType === 2"
            type="warning"
          >
            acceptor
          </el-tag>
          <el-tag
            v-else-if="scope.row.operatorType === 3"
            type="danger"
          >
            admin
          </el-tag>
          <el-tag
            v-else-if="scope.row.operatorType === 4"
            type="success"
          >
            system
          </el-tag>
          <span v-else>{{ scope.row.operatorType || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作人名称" align="center" prop="operatorName">
        <template #default="scope">
          <el-tag
            v-if="scope.row.operatorName"
            :type="scope.row.operatorType === 1 ? 'info' : scope.row.operatorType === 2 ? 'warning' : scope.row.operatorType === 3 ? 'danger' : 'success'"
          >
            {{ scope.row.operatorName }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
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
            v-hasPermi="['gamer:order-op-history:update']"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-hasPermi="['gamer:order-op-history:delete']"
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
  <OrderOpHistoryForm ref="formRef" @success="getList" />
</template>

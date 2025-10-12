<script setup lang="ts">
import type { ServiceOrderAcceptor } from '@/api/gamer/serviceorderacceptor'
import { ServiceOrderAcceptorApi } from '@/api/gamer/serviceorderacceptor'
import { fenToYuan } from '@/utils'
import { dateFormatter, formatDate } from '@/utils/formatTime'

import ServiceOrderAcceptorForm from './ServiceOrderAcceptorForm.vue'

/** 用户订单接单人 列表 */
defineOptions({ name: 'ServiceOrderAcceptor' })

const loading = ref(true) // 列表的加载中
const list = ref<ServiceOrderAcceptor[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  orderId: undefined,
  acceptorId: undefined,
  acceptorType: undefined,
  acceptorStatus: undefined,
  isLeader: undefined,
  teamId: undefined,
  tempTeamId: undefined,
  teamName: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单

/** 查询列表 */
async function getList() {
  loading.value = true
  try {
    const data = await ServiceOrderAcceptorApi.getServiceOrderAcceptorPage(queryParams)
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

const checkedIds = ref<number[]>([])

/** 批量删除用户订单接单人 */

function handleRowCheckboxChange(records: ServiceOrderAcceptor[]) {
  checkedIds.value = records.map(item => item.id)
}

function renderTime(value?: string | number | Date) {
  if (!value) return '-'
  const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '-'
  return formatDate(date)
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
          
        />
      </el-form-item>
      <el-form-item label="接单人用户ID" prop="acceptorId" label-width="120px">
        <el-input
          v-model="queryParams.acceptorId"
          placeholder="请输入接单人用户ID"
          clearable
          class="!w-[240px]"
          
        />
      </el-form-item>
      <el-form-item
        label="接单状态" prop="acceptorStatus"
      >
        <el-select
          v-model="queryParams.acceptorStatus"
          placeholder="请选择接单状态"
          clearable
          class="!w-[240px]"
        >
          <el-option label="抢单中" :value="1" />
          <el-option label="已确认接单" :value="2" />
          <el-option label="已取消接单" :value="3" />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="是否是队长" prop="isLeader">
        <el-select
          v-model="queryParams.isLeader"
          placeholder="请选择是否是队长"
          clearable
          class="!w-[240px]"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="队伍ID" prop="teamId">
        <el-input
          v-model="queryParams.teamId"
          placeholder="请输入队伍ID"
          clearable
          class="!w-[240px]"
          
        />
      </el-form-item>
      <el-form-item label="临时队伍ID" prop="tempTeamId">
        <el-input
          v-model="queryParams.tempTeamId"
          placeholder="请输入临时队伍ID"
          clearable
          class="!w-[240px]"
          
        />
      </el-form-item>
      <el-form-item label="队伍名称" prop="teamName">
        <el-input
          v-model="queryParams.teamName"
          placeholder="请输入队伍名称"
          clearable
          class="!w-[240px]"
          
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
      </el-form-item> -->
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" class="mr-[5px]" /> 搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-[5px]" /> 重置
        </el-button>
        <!-- <el-button
          v-hasPermi="['gamer:service-order-acceptor:create']"
          type="primary"
          plain
          @click="openForm('create')"
        >
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button> -->
        <!-- <el-button
          v-hasPermi="['gamer:service-order-acceptor:export']"
          type="success"
          plain
          :loading="exportLoading"
          @click="handleExport"
        >
          <Icon icon="ep:download" class="mr-[5px]" /> 导出
        </el-button> -->
        <!-- <el-button
          v-hasPermi="['gamer:service-order-acceptor:delete']"
          type="danger"
          plain
          :disabled="isEmpty(checkedIds)"
          @click="handleDeleteBatch"
        >
          <Icon icon="ep:delete" class="mr-[5px]" /> 批量删除
        </el-button>
      </el-form-item> -->
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
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="订单ID" align="center" prop="orderId" />
      <el-table-column label="接单人" align="center" prop="teamName" />
      <!-- <el-table-column label="接单类型：1-个人接单, 2-组队接单" align="center" prop="acceptorType" /> -->
      <el-table-column
        label="接单状态" align="center" prop="acceptorStatus"
      >
        <template #default="scope">
          <el-tag :type="scope.row.acceptorStatus === 1 ? 'primary' : scope.row.acceptorStatus === 2 ? 'success' : 'danger'">
            {{ scope.row.acceptorStatus === 1 ? '抢单中' : scope.row.acceptorStatus === 2 ? '已确认接单' : '已取消接单' }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- <el-table-column label="是否是队长" align="center" prop="isLeader" />
      <el-table-column label="队伍ID" align="center" prop="teamId" />
      <el-table-column label="临时队伍ID" align="center" prop="tempTeamId" />
      <el-table-column label="队伍名称" align="center" prop="teamName" /> -->
      <el-table-column label="时间信息" align="center" min-width="220px">
        <template #default="scope">
          <div class="flex flex-col items-center gap-1">
            <div>抢单时间：{{ renderTime(scope.row.grabTime) }}</div>
            <div>确认接单时间：{{ renderTime(scope.row.confirmTime) }}</div>
            <div>取消接单时间：{{ renderTime(scope.row.cancelTime) }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="佣金" align="center" prop="acceptorAmount">
        <template #default="scope">
          {{ fenToYuan(scope.row.acceptorAmount) }}
        </template>
      </el-table-column>
      <!-- <el-table-column label="分成比例" align="center" prop="shareRatio">
        <template #default="scope">
          {{ scope.row.shareRatio || 0 }}%
        </template>
      </el-table-column> -->
      <!-- <el-table-column label="取消接单原因" align="center" prop="cancelReason" /> -->
      <el-table-column label="备注" align="center" prop="remark" width="120px" />
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
            v-hasPermi="['gamer:service-order-acceptor:update']"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-hasPermi="['gamer:service-order-acceptor:delete']"
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
  <ServiceOrderAcceptorForm ref="formRef" @success="getList" />
</template>

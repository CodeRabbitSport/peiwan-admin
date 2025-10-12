<script setup lang="ts">
import type { DepositRecharge } from '@/api/gamer/depositrecharge'
import { DepositRechargeApi } from '@/api/gamer/depositrecharge'
import { fenToYuan } from '@/utils'
import download from '@/utils/download'
import { formatDate } from '@/utils/formatTime'
import { isEmpty } from '@/utils/is'

import DepositRechargeForm from './DepositRechargeForm.vue'

/** 会员保证金充值 列表 */
defineOptions({ name: 'DepositRecharge' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<DepositRecharge[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  no: undefined,
  userId: undefined,
  payStatus: undefined,
  payOrderId: undefined,
  payChannelCode: undefined,
  payRefundId: undefined,
  refundStatus: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
async function getList() {
  loading.value = true
  try {
    const data = await DepositRechargeApi.getDepositRechargePage(queryParams)
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
    await DepositRechargeApi.deleteDepositRecharge(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  }
  catch {}
}

const checkedIds = ref<number[]>([])
/** 批量删除会员保证金充值 */
async function handleDeleteBatch() {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await DepositRechargeApi.deleteDepositRechargeList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  }
  catch {}
}

function handleRowCheckboxChange(records: DepositRecharge[]) {
  checkedIds.value = records.map(item => item.id)
}

/** 导出按钮操作 */
async function handleExport() {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await DepositRechargeApi.exportDepositRecharge(queryParams)
    download.excel(data, '会员保证金充值.xls')
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
      label-width="120px"
    >
      <el-form-item label="流水号" prop="no">
        <el-input
          v-model="queryParams.no"
          placeholder="请输入流水号"
          clearable
          class="!w-[240px]"
          
        />
      </el-form-item>
      <el-form-item label="用户编号" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户编号"
          clearable
          class="!w-[240px]"
          
        />
      </el-form-item>
      <el-form-item label="支付状态" prop="payStatus">
        <el-select
          v-model="queryParams.payStatus"
          placeholder="请选择支付状态"
          clearable
          class="!w-[240px]"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="支付订单编号" prop="payOrderId">
        <el-input
          v-model="queryParams.payOrderId"
          placeholder="请输入支付订单编号"
          clearable
          class="!w-[240px]"
          
        />
      </el-form-item>
      <el-form-item label="支付渠道" prop="payChannelCode">
        <el-input
          v-model="queryParams.payChannelCode"
          placeholder="请输入支付渠道"
          clearable
          class="!w-[240px]"
          
        />
      </el-form-item>
      <el-form-item label="退款单号" prop="payRefundId">
        <el-input
          v-model="queryParams.payRefundId"
          placeholder="请输入退款单号"
          clearable
          class="!w-[240px]"
          
        />
      </el-form-item>
      <el-form-item label="退款状态" prop="refundStatus">
        <el-select
          v-model="queryParams.refundStatus"
          placeholder="请选择退款状态"
          clearable
          class="!w-[240px]"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
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
          v-hasPermi="['gamer:deposit-recharge:create']"
          type="primary"
          plain
          @click="openForm('create')"
        >
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button>
        <el-button
          v-hasPermi="['gamer:deposit-recharge:export']"
          type="success"
          plain
          :loading="exportLoading"
          @click="handleExport"
        >
          <Icon icon="ep:download" class="mr-[5px]" /> 导出
        </el-button>
        <el-button
          v-hasPermi="['gamer:deposit-recharge:delete']"
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
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="流水号" align="center" prop="no" />
      <el-table-column label="用户编号" align="center" prop="userId" />
      <el-table-column label="金额" align="center">
        <template #default="{ row }">
          {{ fenToYuan(row.totalPrice) }}
        </template>
      </el-table-column>
      <el-table-column label="支付状态" align="center">
        <template #default="{ row }">
          <el-tag :type="row.payStatus === 1 ? 'success' : 'warning'">
            {{ row.payStatus === 1 ? '已支付' : '未支付' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="支付信息" align="center" min-width="160">
        <template #default="{ row }">
          <div>订单: {{ row.payOrderId || '-' }}</div>
          <div>渠道: {{ row.payChannelCode || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="时间(支付/退款/创建)" align="center" min-width="220">
        <template #default="{ row }">
          <div>支付: {{ row.payTime ? formatDate(row.payTime) : '-' }}</div>
          <div>退款: {{ row.refundTime ? formatDate(row.refundTime) : '-' }}</div>
          <div>创建: {{ row.createTime ? formatDate(row.createTime) : '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="退款单号" align="center" prop="payRefundId" />
      <el-table-column label="退款金额(总额/实付/赠送)" align="center" min-width="160">
        <template #default="{ row }">
          {{ row.refundTotalPrice ?? '-' }} / {{ row.refundPayPrice ?? '-' }} / {{ row.refundBonusPrice ?? '-' }}
        </template>
      </el-table-column>
      <el-table-column label="退款状态" align="center">
        <template #default="{ row }">
          <el-tag :type="row.refundStatus === 1 ? 'success' : 'warning'">
            {{ row.refundStatus === 1 ? '退款成功' : '未退款' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            v-hasPermi="['gamer:deposit-recharge:update']"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-hasPermi="['gamer:deposit-recharge:delete']"
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
  <DepositRechargeForm ref="formRef" @success="getList" />
</template>

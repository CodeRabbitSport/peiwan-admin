<script setup lang="ts">
import type { WithdrawOrder } from '@/api/gamer/withdraworder'
import { WithdrawOrderApi } from '@/api/gamer/withdraworder'
import { dateFormatter } from '@/utils/formatTime'

import WithdrawOrderForm from './WithdrawOrderForm.vue'

/** 提现订单 列表 */
defineOptions({ name: 'WithdrawOrder' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<WithdrawOrder[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  no: undefined,
  userId: undefined,
  channel: undefined,
  phone: undefined,
  realName: undefined,
  accountNo: undefined,
  bankName: undefined,
  openid: undefined,
  withdrawType: undefined,
  status: undefined,
  payTransferId: undefined,
  transferChannelCode: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
// const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
async function getList() {
  loading.value = true
  try {
    const data = await WithdrawOrderApi.getWithdrawOrderPage(queryParams)
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
    await WithdrawOrderApi.deleteWithdrawOrder(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  }
  catch {}
}

const checkedIds = ref<number[]>([])
function handleRowCheckboxChange(records: WithdrawOrder[]) {
  checkedIds.value = records.map(item => item.id)
}

/** 导出按钮操作（已隐藏按钮，保留逻辑以备后用） */
// async function handleExport() {
//   try {
//     await message.exportConfirm()
//     exportLoading.value = true
//     const data = await WithdrawOrderApi.exportWithdrawOrder(queryParams)
//     download.excel(data, '提现订单.xls')
//   }
//   catch {
//   }
//   finally {
//     exportLoading.value = false
//   }
// }

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
      <el-form-item label="提现订单号" prop="no">
        <el-input
          v-model="queryParams.no"
          placeholder="请输入提现订单号"
          clearable
          class="!w-[240px]"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户ID"
          clearable
          class="!w-[240px]"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="提现渠道" prop="channel">
        <el-select
          v-model="queryParams.channel"
          placeholder="请输入提现渠道"
          clearable
          class="!w-[240px]"
          @keyup.enter="handleQuery"
        >
          <el-option label="微信收款" :value="1" />
          <el-option label="支付宝收款" :value="2" />
          <el-option label="银行卡收款" :value="3" />
          <el-option label="支付宝账号收款" :value="4" />
        </el-select>
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="queryParams.phone"
          placeholder="请输入手机号"
          clearable
          class="!w-[240px]"
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <el-form-item label="账号" prop="accountNo">
        <el-input
          v-model="queryParams.accountNo"
          placeholder="请输入账号"
          clearable
          class="!w-[240px]"
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <el-form-item label="提现状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择提现状态"
          clearable
          class="!w-[240px]"
        >
          <el-option label="待审核" :value="0" />
          <el-option label="审核通过" :value="1" />
          <el-option label="审核拒绝" :value="2" />
          <el-option label="打款失败" :value="3" />
        </el-select>
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
      <el-table-column label="提现订单号" align="center" prop="no" width="100px" />
      <el-table-column label="用户ID" align="center" prop="userId" />
      <el-table-column label="提现信息" align="center" min-width="220px">
        <template #default="scope">
          <div class="flex flex-col items-center gap-1">
            <el-tag :type="scope.row.channel === 1 ? 'success' : scope.row.channel === 2 ? 'warning' : scope.row.channel === 3 ? 'danger' : 'info'">
              {{ scope.row.channel === 1 ? '微信收款' : scope.row.channel === 2 ? '支付宝收款' : scope.row.channel === 3 ? '银行卡收款' : '支付宝账号收款' }}
            </el-tag>
            <div v-if="scope.row.phone">
              手机号：{{ scope.row.phone }}
            </div>
            <div v-if="scope.row.realName">
              真实姓名：{{ scope.row.realName }}
            </div>
            <div v-if="scope.row.accountNo">
              账号：{{ scope.row.accountNo }}
            </div>
            <div v-if="scope.row.bankName">
              银行名称：{{ scope.row.bankName }}
            </div>
            <div v-if="scope.row.qrCodeUrl" class="mt-1">
              <el-image
                :src="scope.row.qrCodeUrl"
                :preview-src-list="[scope.row.qrCodeUrl]"
                fit="cover"
                preview-teleported
                style="width: 48px; height: 48px"
              />
            </div>
          </div>
        </template>
      </el-table-column>
      <!-- <el-table-column label="微信用户openid（仅微信极速到账需要）" align="center" prop="openid" /> -->
      <el-table-column label="金额信息" align="center" min-width="180px">
        <template #default="scope">
          <div class="flex flex-col items-start gap-1">
            <div>提现金额：{{ scope.row.amount }}</div>
            <div v-if="scope.row.feeRate !== undefined && scope.row.feeRate !== null">
              手续费比例：{{ scope.row.feeRate }}%
            </div>
            <div v-if="scope.row.feeAmount !== undefined && scope.row.feeAmount !== null">
              手续费金额：{{ scope.row.feeAmount }}
            </div>
            <div v-if="scope.row.actualAmount !== undefined && scope.row.actualAmount !== null">
              实际到账金额：{{ scope.row.actualAmount }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="到账类型" align="center" prop="withdrawType">
        <template #default="scope">
          <el-tag :type="scope.row.withdrawType === 1 ? 'success' : scope.row.withdrawType === 2 ? 'warning' : 'info'">
            {{ scope.row.withdrawType === 1 ? '急速到账' : scope.row.withdrawType === 2 ? '普通到账' : '其他' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="提现状态" align="center" prop="status">
        <template #default="scope">
          <el-tag :type="scope.row.status === 0 ? 'warning' : scope.row.status === 1 ? 'success' : scope.row.status === 2 ? 'danger' : 'info'">
            {{ scope.row.status === 0 ? '待审核' : scope.row.status === 1 ? '审核通过' : scope.row.status === 2 ? '审核拒绝' : '打款失败' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="提现备注" align="center" prop="withdrawRemark" />
      <el-table-column label="拒绝原因" align="center" prop="rejectReason" />
      <!-- <el-table-column label="转账单编号" align="center" prop="payTransferId" /> -->
      <!-- <el-table-column label="转账渠道" align="center" prop="transferChannelCode" /> -->
      <!-- <el-table-column
        label="交易时间"
        align="center"
        prop="transactionTime"
        :formatter="dateFormatter"
        width="180px"
      /> -->
      <el-table-column label="错误提示" align="center" prop="transactionErrorMsg" />
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
            v-hasPermi="['gamer:withdraw-order:update']"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-hasPermi="['gamer:withdraw-order:delete']"
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
  <WithdrawOrderForm ref="formRef" @success="getList" />
</template>

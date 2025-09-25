<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="提现订单号" prop="no">
        <el-input
          v-model="queryParams.no"
          placeholder="请输入提现订单号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="用户ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户ID"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="提现渠道(1微信收款 2支付宝收款 3银行卡收款 4支付宝账号收款)" prop="channel">
        <el-input
          v-model="queryParams.channel"
          placeholder="请输入提现渠道(1微信收款 2支付宝收款 3银行卡收款 4支付宝账号收款)"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="queryParams.phone"
          placeholder="请输入手机号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="真实姓名" prop="realName">
        <el-input
          v-model="queryParams.realName"
          placeholder="请输入真实姓名"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="账号(银行卡号/支付宝账号)" prop="accountNo">
        <el-input
          v-model="queryParams.accountNo"
          placeholder="请输入账号(银行卡号/支付宝账号)"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="银行名称(仅银行卡)" prop="bankName">
        <el-input
          v-model="queryParams.bankName"
          placeholder="请输入银行名称(仅银行卡)"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="微信用户openid（仅微信极速到账需要）" prop="openid">
        <el-input
          v-model="queryParams.openid"
          placeholder="请输入微信用户openid（仅微信极速到账需要）"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="到账类型(1急速到账 2普通到账)" prop="withdrawType">
        <el-select
          v-model="queryParams.withdrawType"
          placeholder="请选择到账类型(1急速到账 2普通到账)"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="提现状态(0待审核 1审核通过(已打款) 2审核拒绝 3打款失败)" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择提现状态(0待审核 1审核通过(已打款) 2审核拒绝 3打款失败)"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="转账单编号" prop="payTransferId">
        <el-input
          v-model="queryParams.payTransferId"
          placeholder="请输入转账单编号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="转账渠道" prop="transferChannelCode">
        <el-input
          v-model="queryParams.transferChannelCode"
          placeholder="请输入转账渠道"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
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
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['gamer:withdraw-order:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['gamer:withdraw-order:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button
            type="danger"
            plain
            :disabled="isEmpty(checkedIds)"
            @click="handleDeleteBatch"
            v-hasPermi="['gamer:withdraw-order:delete']"
        >
          <Icon icon="ep:delete" class="mr-5px" /> 批量删除
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
        row-key="id"
        v-loading="loading"
        :data="list"
        :stripe="true"
        :show-overflow-tooltip="true"
        @selection-change="handleRowCheckboxChange"
    >
    <el-table-column type="selection" width="55" />
      <el-table-column label="提现订单ID" align="center" prop="id" />
      <el-table-column label="提现订单号" align="center" prop="no" />
      <el-table-column label="用户ID" align="center" prop="userId" />
      <el-table-column label="提现渠道(1微信收款 2支付宝收款 3银行卡收款 4支付宝账号收款)" align="center" prop="channel" />
      <el-table-column label="手机号" align="center" prop="phone" />
      <el-table-column label="真实姓名" align="center" prop="realName" />
      <el-table-column label="账号(银行卡号/支付宝账号)" align="center" prop="accountNo" />
      <el-table-column label="银行名称(仅银行卡)" align="center" prop="bankName" />
      <el-table-column label="收款二维码URL" align="center" prop="qrCodeUrl" />
      <el-table-column label="微信用户openid（仅微信极速到账需要）" align="center" prop="openid" />
      <el-table-column label="提现金额" align="center" prop="amount" />
      <el-table-column label="手续费比例(%)" align="center" prop="feeRate" />
      <el-table-column label="手续费金额" align="center" prop="feeAmount" />
      <el-table-column label="实际到账金额" align="center" prop="actualAmount" />
      <el-table-column label="到账类型(1急速到账 2普通到账)" align="center" prop="withdrawType" />
      <el-table-column label="提现状态(0待审核 1审核通过(已打款) 2审核拒绝 3打款失败)" align="center" prop="status" />
      <el-table-column label="提现备注" align="center" prop="withdrawRemark" />
      <el-table-column label="审核拒绝原因" align="center" prop="rejectReason" />
      <el-table-column label="转账单编号" align="center" prop="payTransferId" />
      <el-table-column label="转账渠道" align="center" prop="transferChannelCode" />
      <el-table-column
        label="交易时间"
        align="center"
        prop="transactionTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="转账错误提示" align="center" prop="transactionErrorMsg" />
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
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['gamer:withdraw-order:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['gamer:withdraw-order:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <WithdrawOrderForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { WithdrawOrderApi, WithdrawOrder } from '@/api/gamer/withdraworder'
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
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await WithdrawOrderApi.getWithdrawOrderPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await WithdrawOrderApi.deleteWithdrawOrder(id)
    message.success(t('common.delSuccess'))
    currentRow.value = {}
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除提现订单 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await WithdrawOrderApi.deleteWithdrawOrderList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: WithdrawOrder[]) => {
  checkedIds.value = records.map((item) => item.id);
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await WithdrawOrderApi.exportWithdrawOrder(queryParams)
    download.excel(data, '提现订单.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
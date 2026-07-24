<script setup lang="ts">
import type { VirtualPaymentRecord } from '@/api/gamer/virtualpayment'
import { VirtualPaymentApi } from '@/api/gamer/virtualpayment'
import download from '@/utils/download'
import { downloadByUrl } from '@/utils/filt'
import { formatDate } from '@/utils/formatTime'
import { isEmpty } from '@/utils/is'

import VirtualPaymentForm from './VirtualPaymentForm.vue'

defineOptions({ name: 'VirtualPayment' })

const message = useMessage()
const { t } = useI18n()

const typeOptions = [
  { label: '充值', value: 'RECHARGE' },
  { label: '代币支付', value: 'CURRENCY_PAY' },
  { label: '取消支付', value: 'CURRENCY_CANCEL' },
  { label: '赠送', value: 'PRESENT' },
  { label: '退款', value: 'REFUND' },
  { label: '余额迁移', value: 'MIGRATION' },
  { label: '后台增加', value: 'ADMIN_ADJUST_IN' },
  { label: '后台扣减', value: 'ADMIN_ADJUST_OUT' },
  { label: '余额同步', value: 'BALANCE_SYNC' },
]
const statusOptions = [
  { label: '待处理', value: 'PENDING' },
  { label: '成功', value: 'SUCCESS' },
  { label: '失败', value: 'FAILED' },
  { label: '已关闭', value: 'CLOSED' },
]

const loading = ref(true)
const list = ref<VirtualPaymentRecord[]>([])
const total = ref(0)
const checkedIds = ref<number[]>([])
const deletingIds = ref<number[]>([])
const batchDeleteLoading = ref(false)
const exportLoading = ref(false)
const queryFormRef = ref()
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: undefined,
  openid: undefined,
  type: undefined,
  status: undefined,
  bizOrderNo: undefined,
  relatedOrderNo: undefined,
  wxOrderId: undefined,
  createTime: [],
})

function getTypeLabel(type?: string) {
  return typeOptions.find(item => item.value === type)?.label || type || '-'
}

function getStatusInfo(status?: string) {
  const map: Record<string, { label: string, type: 'warning' | 'success' | 'danger' | 'info' }> = {
    PENDING: { label: '待处理', type: 'warning' },
    SUCCESS: { label: '成功', type: 'success' },
    FAILED: { label: '失败', type: 'danger' },
    CLOSED: { label: '已关闭', type: 'info' },
  }
  return map[status || ''] || { label: status || '-', type: 'info' }
}

async function getList() {
  loading.value = true
  try {
    const data = await VirtualPaymentApi.getVirtualPaymentPage(queryParams)
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

const formRef = ref()
function openForm(type: 'create' | 'update' | 'detail', id?: number) {
  formRef.value?.open(type, id)
}

async function handleDelete(id: number) {
  try {
    await message.delConfirm()
    deletingIds.value.push(id)
    await VirtualPaymentApi.deleteVirtualPayment(id)
    message.success(t('common.delSuccess'))
    await getList()
  }
  catch {}
  finally {
    deletingIds.value = deletingIds.value.filter(item => item !== id)
  }
}

async function handleDeleteBatch() {
  try {
    await message.delConfirm()
    batchDeleteLoading.value = true
    await VirtualPaymentApi.deleteVirtualPaymentList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  }
  catch {}
  finally {
    batchDeleteLoading.value = false
  }
}

function handleRowCheckboxChange(records: VirtualPaymentRecord[]) {
  checkedIds.value = records.flatMap(item => item.id == null ? [] : [item.id])
}

async function handleExport() {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await VirtualPaymentApi.exportVirtualPayment(queryParams)
    download.excel(data, '虚拟支付记录.xls')
  }
  catch {}
  finally {
    exportLoading.value = false
  }
}

const presentDialogVisible = ref(false)
const presentLoading = ref(false)
const presentFormRef = ref()
const presentForm = ref({
  userId: undefined as number | undefined,
  amount: undefined as number | undefined,
  remark: '',
})
const presentRules = {
  userId: [{ required: true, message: '用户 ID 不能为空', trigger: 'blur' }],
  amount: [{ required: true, message: '赠送金额不能为空', trigger: 'blur' }],
}

function openPresent(userId?: number) {
  presentForm.value = { userId, amount: undefined, remark: '' }
  presentDialogVisible.value = true
  nextTick(() => presentFormRef.value?.clearValidate())
}

async function submitPresent() {
  if (!presentFormRef.value) return
  await presentFormRef.value.validate()
  if (presentForm.value.userId == null || presentForm.value.amount == null) return
  try {
    await message.confirm(
      `确认向用户 ${presentForm.value.userId} 赠送 ${presentForm.value.amount} 分代币吗？`,
    )
    presentLoading.value = true
    const recordId = await VirtualPaymentApi.present({
      userId: presentForm.value.userId,
      amount: presentForm.value.amount,
      remark: presentForm.value.remark || undefined,
    })
    message.success(`赠送请求已提交，记录 ID：${recordId}`)
    presentDialogVisible.value = false
    await getList()
  }
  catch {}
  finally {
    presentLoading.value = false
  }
}

const refundDialogVisible = ref(false)
const refundLoading = ref(false)
const refundFormRef = ref()
const refundForm = ref({
  id: undefined as number | undefined,
  refundAmount: undefined as number | undefined,
  refundReason: undefined as number | undefined,
  remark: '',
})
const refundRules = {
  refundAmount: [{ required: true, message: '退款金额不能为空', trigger: 'blur' }],
  refundReason: [{ required: true, message: '退款原因码不能为空', trigger: 'blur' }],
}

function openRefund(row: VirtualPaymentRecord) {
  refundForm.value = {
    id: row.id,
    refundAmount: undefined,
    refundReason: undefined,
    remark: '',
  }
  refundDialogVisible.value = true
  nextTick(() => refundFormRef.value?.clearValidate())
}

async function submitRefund() {
  if (!refundFormRef.value) return
  await refundFormRef.value.validate()
  const data = refundForm.value
  if (data.id == null || data.refundAmount == null || data.refundReason == null) return
  try {
    await message.confirm(`确认对记录 ${data.id} 发起 ${data.refundAmount} 分退款吗？`)
    refundLoading.value = true
    const recordId = await VirtualPaymentApi.refund({
      id: data.id,
      refundAmount: data.refundAmount,
      refundReason: data.refundReason,
      remark: data.remark || undefined,
    })
    message.success(`退款请求已提交，记录 ID：${recordId}`)
    refundDialogVisible.value = false
    await getList()
  }
  catch {}
  finally {
    refundLoading.value = false
  }
}

const billDialogVisible = ref(false)
const billLoading = ref(false)
const billFormRef = ref()
const billForm = ref({ beginDate: '', endDate: '' })
const billRules = {
  beginDate: [{ required: true, message: '开始日期不能为空', trigger: 'change' }],
  endDate: [{ required: true, message: '结束日期不能为空', trigger: 'change' }],
}

function openBillDialog() {
  billForm.value = { beginDate: '', endDate: '' }
  billDialogVisible.value = true
  nextTick(() => billFormRef.value?.clearValidate())
}

async function submitDownloadBill() {
  if (!billFormRef.value) return
  await billFormRef.value.validate()
  if (billForm.value.beginDate > billForm.value.endDate) {
    message.error('开始日期不能晚于结束日期')
    return
  }
  try {
    await message.confirm(
      `确认下载 ${billForm.value.beginDate} 至 ${billForm.value.endDate} 的微信账单吗？`,
    )
    billLoading.value = true
    const url = await VirtualPaymentApi.downloadBill(billForm.value)
    if (!url) {
      message.error('后端未返回账单下载地址')
      return
    }
    downloadByUrl({ url })
    billDialogVisible.value = false
  }
  catch {}
  finally {
    billLoading.value = false
  }
}

onMounted(getList)
</script>

<template>
  <ContentWrap>
    <el-form
      ref="queryFormRef"
      class="-mb-[15px]"
      :model="queryParams"
      :inline="true"
      label-width="86px"
    >
      <el-form-item label="用户 ID" prop="userId">
        <el-input-number v-model="queryParams.userId" :min="1" class="!w-[240px]" />
      </el-form-item>
      <el-form-item label="OpenID" prop="openid">
        <el-input v-model="queryParams.openid" placeholder="请输入小程序 OpenID" clearable class="!w-[240px]" />
      </el-form-item>
      <el-form-item label="业务类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择业务类型" clearable class="!w-[240px]">
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="业务单号" prop="bizOrderNo">
        <el-input v-model="queryParams.bizOrderNo" placeholder="请输入业务单号" clearable class="!w-[240px]" />
      </el-form-item>
      <el-form-item label="关联单号" prop="relatedOrderNo">
        <el-input v-model="queryParams.relatedOrderNo" placeholder="请输入关联单号" clearable class="!w-[240px]" />
      </el-form-item>
      <el-form-item label="微信单号" prop="wxOrderId">
        <el-input v-model="queryParams.wxOrderId" placeholder="请输入微信订单号" clearable class="!w-[240px]" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable class="!w-[240px]">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
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
          class="!w-[240px]"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" class="mr-[5px]" /> 搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-[5px]" /> 重置
        </el-button>
        <el-button v-hasPermi="['gamer:virtual-payment:create']" type="primary" plain @click="openForm('create')">
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button>
        <el-button v-hasPermi="['gamer:virtual-payment:present']" type="success" plain @click="openPresent()">
          <Icon icon="ep:present" class="mr-[5px]" /> 赠送代币
        </el-button>
        <el-button v-hasPermi="['gamer:virtual-payment:bill']" plain :loading="billLoading" @click="openBillDialog">
          <Icon icon="ep:document" class="mr-[5px]" /> 下载账单
        </el-button>
        <el-button v-hasPermi="['gamer:virtual-payment:export']" type="success" plain :loading="exportLoading" @click="handleExport">
          <Icon icon="ep:download" class="mr-[5px]" /> 导出
        </el-button>
        <el-button
          v-hasPermi="['gamer:virtual-payment:delete']"
          type="danger"
          plain
          :disabled="isEmpty(checkedIds)"
          :loading="batchDeleteLoading"
          @click="handleDeleteBatch"
        >
          <Icon icon="ep:delete" class="mr-[5px]" /> 批量删除
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

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
      <el-table-column label="ID" align="center" prop="id" width="90" />
      <el-table-column label="用户" align="center" min-width="180">
        <template #default="{ row }">
          <div>用户 ID：{{ row.userId ?? '-' }}</div>
          <div>OpenID：{{ row.openid || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" prop="type" min-width="130">
        <template #default="{ row }">
          {{ getTypeLabel(row.type) }}
        </template>
      </el-table-column>
      <el-table-column label="业务单号" align="center" min-width="180">
        <template #default="{ row }">
          <div>业务：{{ row.bizOrderNo || '-' }}</div>
          <div>关联：{{ row.relatedOrderNo || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="金额(分)" align="center" prop="amount" width="110" />
      <el-table-column label="变动后余额(分)" align="center" prop="balanceAfter" width="140" />
      <el-table-column label="状态" align="center" prop="status" width="110">
        <template #default="{ row }">
          <el-tag :type="getStatusInfo(row.status).type">
            {{ getStatusInfo(row.status).label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="微信单号" align="center" min-width="190">
        <template #default="{ row }">
          <div>订单：{{ row.wxOrderId || '-' }}</div>
          <div>退款：{{ row.wxRefundId || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="错误信息" align="center" prop="errorMessage" min-width="180">
        <template #default="{ row }">
          <span :class="row.errorMessage ? 'text-red-500' : ''">{{ row.errorMessage || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="{ row }">
          {{ row.createTime ? formatDate(row.createTime) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="340">
        <template #default="{ row }">
          <el-button v-hasPermi="['gamer:virtual-payment:query']" link type="primary" @click="openForm('detail', row.id)">
            详情
          </el-button>
          <el-button v-hasPermi="['gamer:virtual-payment:update']" link type="primary" @click="openForm('update', row.id)">
            编辑
          </el-button>
          <el-button v-hasPermi="['gamer:virtual-payment:refund']" link type="warning" @click="openRefund(row)">
            退款
          </el-button>
          <el-dropdown trigger="click">
            <el-button link type="info">
              更多
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-hasPermi="['gamer:virtual-payment:present']" @click="openPresent(row.userId)">
                  赠送代币
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button
            v-hasPermi="['gamer:virtual-payment:delete']"
            link
            type="danger"
            :loading="deletingIds.includes(row.id)"
            @click="handleDelete(row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <VirtualPaymentForm ref="formRef" @success="getList" />

  <Dialog v-model="presentDialogVisible" title="赠送代币" width="560px">
    <el-form ref="presentFormRef" v-loading="presentLoading" :model="presentForm" :rules="presentRules" label-width="120px">
      <el-form-item label="用户 ID" prop="userId">
        <el-input-number v-model="presentForm.userId" :min="1" class="!w-full" />
      </el-form-item>
      <el-form-item label="赠送金额(分)" prop="amount">
        <el-input-number v-model="presentForm.amount" :min="100" :step="100" class="!w-full" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="presentForm.remark" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" :loading="presentLoading" @click="submitPresent">确 定</el-button>
      <el-button :disabled="presentLoading" @click="presentDialogVisible = false">取 消</el-button>
    </template>
  </Dialog>

  <Dialog v-model="refundDialogVisible" title="虚拟支付退款" width="560px">
    <el-form ref="refundFormRef" v-loading="refundLoading" :model="refundForm" :rules="refundRules" label-width="120px">
      <el-form-item label="记录 ID">
        <el-input-number v-model="refundForm.id" disabled class="!w-full" />
      </el-form-item>
      <el-form-item label="退款金额(分)" prop="refundAmount">
        <el-input-number v-model="refundForm.refundAmount" :min="100" :step="100" class="!w-full" />
      </el-form-item>
      <el-form-item label="退款原因码" prop="refundReason">
        <el-select v-model="refundForm.refundReason" placeholder="请选择微信退款原因" class="!w-full">
          <el-option label="暂无描述" :value="0" />
          <el-option label="产品问题" :value="1" />
          <el-option label="售后问题" :value="2" />
          <el-option label="用户主动发起退款" :value="3" />
          <el-option label="价格问题" :value="4" />
          <el-option label="其他原因" :value="5" />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="refundForm.remark" type="textarea" :rows="2" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="danger" :loading="refundLoading" @click="submitRefund">确认退款</el-button>
      <el-button :disabled="refundLoading" @click="refundDialogVisible = false">取 消</el-button>
    </template>
  </Dialog>

  <Dialog v-model="billDialogVisible" title="下载微信虚拟支付账单" width="560px">
    <el-form ref="billFormRef" v-loading="billLoading" :model="billForm" :rules="billRules" label-width="100px">
      <el-form-item label="开始日期" prop="beginDate">
        <el-date-picker v-model="billForm.beginDate" type="date" value-format="YYYY-MM-DD" class="!w-full" />
      </el-form-item>
      <el-form-item label="结束日期" prop="endDate">
        <el-date-picker v-model="billForm.endDate" type="date" value-format="YYYY-MM-DD" class="!w-full" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" :loading="billLoading" @click="submitDownloadBill">下 载</el-button>
      <el-button :disabled="billLoading" @click="billDialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

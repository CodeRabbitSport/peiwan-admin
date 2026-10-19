<script setup lang="ts">
import type { FormInstance } from 'element-plus'

import type { VirtualPaymentOperation, VirtualPaymentRecord } from '@/api/gamer/virtualpayment'
import { VirtualPaymentApi } from '@/api/gamer/virtualpayment'
import download from '@/utils/download'
import { downloadByUrl } from '@/utils/filt'
import { formatDate } from '@/utils/formatTime'

import {
  auditStatusLabel,
  money,
  payStatusLabel,
  platformLabel,
  statusInfo,
  statusOptions,
  typeLabel,
  typeOptions,
  wechatStatusLabel,
} from './data'
import VirtualPaymentDetail from './VirtualPaymentDetail.vue'

defineOptions({ name: 'VirtualPayment' })
const message = useMessage()
const loading = ref(false)
const list = ref<VirtualPaymentRecord[]>([])
const total = ref(0)
const queryRef = ref<FormInstance>()
const detailRef = ref<InstanceType<typeof VirtualPaymentDetail>>()
const scope = ref('all')
const exportLoading = ref(false)
const query = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: undefined as number | undefined,
  platform: undefined as string | undefined,
  type: undefined as string | undefined,
  status: undefined as string | undefined,
  bizOrderNo: '',
  merchantOrderId: '',
  wxOrderId: '',
  payOrderId: undefined as number | undefined,
  payOrderStatus: undefined as number | undefined,
  refundAuditStatus: undefined as number | undefined,
  createTime: [] as string[],
})
let listRequest = 0
async function getList() {
  const activeRequest = ++listRequest
  loading.value = true
  try {
    const data = await VirtualPaymentApi.getVirtualPaymentPage(query)
    if (activeRequest !== listRequest) return
    list.value = data.list
    total.value = data.total
  }
  finally {
    if (activeRequest === listRequest) loading.value = false
  }
}
function search() {
  query.pageNo = 1
  getList()
}
function reset() {
  queryRef.value?.resetFields()
  scope.value = 'all'
  search()
}
function selectScope(value: string) {
  scope.value = value
  query.status = value === 'review' ? 'REVIEW_REQUIRED' : undefined
  query.refundAuditStatus = value === 'refund' ? 0 : undefined
  query.type = undefined
  search()
}
async function exportList() {
  try {
    await message.exportConfirm()
  }
  catch {
    return
  }
  exportLoading.value = true
  try {
    download.excel(await VirtualPaymentApi.exportVirtualPayment(query), '虚拟支付流水.xls')
  }
  finally {
    exportLoading.value = false
  }
}

const actionDialog = ref(false)
const actionLoading = ref(false)
const actionRef = ref<FormInstance>()
const action = ref<'reconcile' | 'audit' | 'refund'>('reconcile')
const selected = ref<VirtualPaymentRecord>({})
const actionForm = reactive({
  remark: '',
  auditStatus: 1 as 1 | 2,
  refundAmount: 0,
  refundReason: 3,
})
const actionTitle = computed(
  () =>
    ({ reconcile: '核对并同步支付结果', audit: selected.value.platform === 'IOS' ? 'iOS Apple 退款问询审核' : '退款申请审核', refund: '充值退款审核' })[
      action.value
    ],
)
const lastResult = ref<VirtualPaymentOperation>()
const actionRules = {
  remark: [{ required: true, whitespace: true, message: '请填写操作说明', trigger: 'blur' }],
  refundAmount: [
    {
      type: 'number' as const,
      min: 0.01,
      required: true,
      message: '退款金额不能小于 0.01 元',
      trigger: 'change',
    },
  ],
}
function openAction(type: 'reconcile' | 'audit' | 'refund', row: VirtualPaymentRecord) {
  action.value = type
  selected.value = row
  Object.assign(actionForm, {
    remark: '',
    auditStatus: row.platform === 'IOS' && row.iosRefundAuditStatus === 2 ? 2 : 1,
    refundAmount: Number(row.basePayPrice ?? row.amount ?? 0) / 100,
    refundReason: 3,
  })
  actionDialog.value = true
  nextTick(() => actionRef.value?.clearValidate())
}
async function submitAction() {
  if (!selected.value.id || !(await actionRef.value?.validate().catch(() => false))) return
  actionLoading.value = true
  try {
    let result: VirtualPaymentOperation
    const id = selected.value.id
    const remark = actionForm.remark.trim()
    if (action.value === 'reconcile') {
      result = await VirtualPaymentApi.reconcile({ id, remark })
    }
    else if (action.value === 'audit') {
      result = await VirtualPaymentApi.auditRefund({
        id,
        auditStatus: actionForm.auditStatus,
        auditReason: remark,
      })
    }
    else {
      result = await VirtualPaymentApi.refund({
        id,
        refundAmount: Math.round(actionForm.refundAmount * 100),
        refundReason: actionForm.refundReason,
        remark,
      })
    }
    lastResult.value = result
    if (result.success) message.success(result.message)
    else message.warning(result.message)
    actionDialog.value = false
    await getList()
    await detailRef.value?.open(id, 'logs')
  }
  finally {
    actionLoading.value = false
  }
}
const presentDialog = ref(false)
const presentLoading = ref(false)
const presentRef = ref<FormInstance>()
const presentForm = reactive({ userId: undefined as number | undefined, amount: 1, remark: '' })
const presentRules = {
  userId: [{ required: true, message: '请填写用户编号', trigger: 'blur' }],
  amount: [
    {
      required: true,
      type: 'number' as const,
      min: 1,
      message: '赠送金额至少为 1 元',
      trigger: 'change',
    },
  ],
}
async function present() {
  if (!(await presentRef.value?.validate().catch(() => false)) || !presentForm.userId) return
  try {
    await message.confirm(
      `确认向用户 ${presentForm.userId} 赠送 ${presentForm.amount} 元对应的代币？`,
    )
  }
  catch {
    return
  }
  presentLoading.value = true
  try {
    const id = await VirtualPaymentApi.present({
      userId: presentForm.userId,
      amount: Math.round(presentForm.amount * 100),
      remark: presentForm.remark,
    })
    message.success(`赠送请求已提交，记录编号：${id}`)
    presentDialog.value = false
    await getList()
  }
  finally {
    presentLoading.value = false
  }
}
const billDialog = ref(false)
const billLoading = ref(false)
const billRef = ref<FormInstance>()
const bill = reactive({ beginDate: '', endDate: '' })
async function downloadBill() {
  if (!(await billRef.value?.validate().catch(() => false))) return
  if (bill.beginDate > bill.endDate) {
    message.error('开始日期不能晚于结束日期')
    return
  }
  billLoading.value = true
  try {
    const url = await VirtualPaymentApi.downloadBill(bill)
    if (!url) {
      message.warning('账单仍在生成，请稍后重试')
      return
    }
    downloadByUrl({ url })
    billDialog.value = false
  }
  finally {
    billLoading.value = false
  }
}
onMounted(getList)
</script>

<template>
  <ContentWrap>
    <el-alert
      title="人工核对：点击对应流水的「核对并结单」，填写备注后重新向微信核验。只有核验通过才会更新支付状态；已关闭的订单会保留并提示处理原因。"
      type="info"
      show-icon
      :closable="false"
      class="mb-16px"
    />
    <el-alert
      v-if="lastResult"
      :title="lastResult.message"
      :type="lastResult.success ? 'success' : 'warning'"
      show-icon
      class="mb-16px"
      @close="lastResult = undefined"
    />
    <div class="mb-16px flex flex-wrap gap-8px">
      <el-button :type="scope === 'all' ? 'primary' : 'default'" @click="selectScope('all')">
        全部流水
      </el-button>
      <el-button :type="scope === 'review' ? 'primary' : 'default'" @click="selectScope('review')">
        人工核对
      </el-button>
      <el-button :type="scope === 'refund' ? 'primary' : 'default'" @click="selectScope('refund')">
        退款待审核
      </el-button>
    </div>
    <el-form ref="queryRef" :model="query" :inline="true" label-width="90px" class="-mb-15px">
      <el-form-item label="支付平台" prop="platform">
        <el-select v-model="query.platform" clearable placeholder="全部平台" class="!w-200px">
          <el-option label="安卓" value="ANDROID" /><el-option label="iOS" value="IOS" /><el-option
            label="历史记录 / 未知"
            value="UNKNOWN"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="流水类型" prop="type">
        <el-select v-model="query.type" clearable placeholder="全部类型" class="!w-220px">
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="处理状态" prop="status">
        <el-select v-model="query.status" clearable placeholder="全部状态" class="!w-220px">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="支付单状态" prop="payOrderStatus">
        <el-select
          v-model="query.payOrderStatus"
          clearable
          placeholder="全部支付状态"
          class="!w-200px"
        >
          <el-option label="未支付" :value="0" /><el-option label="已支付" :value="10" /><el-option
            label="已退款"
            :value="20"
          /><el-option label="已关闭" :value="30" />
        </el-select>
      </el-form-item>
      <el-form-item label="虚拟支付单" prop="bizOrderNo">
        <el-input
          v-model="query.bizOrderNo"
          clearable
          placeholder="VPR / VPC 等流水号"
          class="!w-220px"
          @keyup.enter="search"
        />
      </el-form-item>
      <el-form-item label="业务订单号" prop="merchantOrderId">
        <el-input
          v-model="query.merchantOrderId"
          clearable
          placeholder="请输入业务订单号"
          class="!w-220px"
          @keyup.enter="search"
        />
      </el-form-item>
      <el-form-item label="支付单编号" prop="payOrderId">
        <el-input-number v-model="query.payOrderId" :controls="false" :min="1" class="!w-200px" />
      </el-form-item>
      <el-form-item label="用户编号" prop="userId">
        <el-input-number v-model="query.userId" :controls="false" :min="1" class="!w-200px" />
      </el-form-item>
      <el-form-item label="微信订单号" prop="wxOrderId">
        <el-input
          v-model="query.wxOrderId"
          clearable
          placeholder="请输入微信订单号"
          class="!w-220px"
          @keyup.enter="search"
        />
      </el-form-item>
      <el-form-item label="退款审核" prop="refundAuditStatus">
        <el-select
          v-model="query.refundAuditStatus"
          clearable
          placeholder="全部审核状态"
          class="!w-200px"
        >
          <el-option label="待审核" :value="0" /><el-option label="已通过" :value="1" /><el-option
            label="已驳回"
            :value="2"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="query.createTime"
          type="daterange"
          value-format="YYYY-MM-DD HH:mm:ss"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('2000-01-01T00:00:00'), new Date('2000-01-01T23:59:59')]"
          class="!w-300px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">
          <Icon icon="ep:search" class="mr-5px" />搜索
        </el-button>
        <el-button @click="reset">
          <Icon icon="ep:refresh" class="mr-5px" />重置
        </el-button>
        <el-button
          v-hasPermi="['gamer:virtual-payment:export']"
          :loading="exportLoading"
          @click="exportList"
        >
          导出
        </el-button>
        <el-button v-hasPermi="['gamer:virtual-payment:bill']" @click="billDialog = true">
          下载账单
        </el-button>
        <el-button v-hasPermi="['gamer:virtual-payment:present']" @click="presentDialog = true">
          赠送代币
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>
  <ContentWrap>
    <el-table v-loading="loading" :data="list" border row-key="id">
      <el-table-column label="流水 / 用户" min-width="255">
        <template #default="{ row }">
          <div class="font-medium">
            {{ row.bizOrderNo }}
          </div><div class="mt-4px text-12px text-[var(--el-text-color-secondary)]">
            记录 {{ row.id }} · 用户 {{ row.userId }}
          </div><div class="mt-4px text-12px text-[var(--el-text-color-secondary)]">
            {{ row.createTime ? formatDate(row.createTime) : '-' }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="平台 / 类型" min-width="175">
        <template #default="{ row }">
          <el-tag
            :type="
              row.platform === 'ANDROID' ? 'success' : row.platform === 'IOS' ? 'primary' : 'info'
            "
          >
            {{ platformLabel(row.platform) }}
          </el-tag><div class="mt-6px text-12px">
            {{ typeLabel(row.type, row.paymentPurpose) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="关联业务订单" min-width="190">
        <template #default="{ row }">
          <div>{{ row.merchantOrderId || '普通充值 / 其他流水' }}</div><div v-if="row.payOrderId" class="mt-4px text-12px text-[var(--el-text-color-secondary)]">
            支付单 {{ row.payOrderId }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="金额明细" min-width="200">
        <template #default="{ row }">
          <div>业务金额 {{ money(row.basePayPrice ?? row.amount) }}</div><div class="mt-4px text-12px">
            iOS 手续费 {{ money(row.feePrice) }} · 取整 {{ money(row.roundingPrice) }}
          </div><div class="mt-4px font-medium">
            微信实付 {{ money(row.wechatPaidPrice ?? row.payPrice) }}
          </div><div v-if="['REFUND', 'CURRENCY_CANCEL'].includes(row.type)" class="mt-4px text-12px">
            本笔退款 {{ money(row.amount) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="处理 / 支付状态" min-width="185">
        <template #default="{ row }">
          <el-tag :type="statusInfo(row.status).type">
            {{ statusInfo(row.status).label }}
          </el-tag><div class="mt-6px text-12px">
            支付单：{{ payStatusLabel(row.payOrderStatus) }}
          </div><div v-if="row.wechatOrderStatus != null" class="mt-4px text-12px">
            微信：{{ wechatStatusLabel(row.wechatOrderStatus) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="退款审核" min-width="135">
        <template #default="{ row }">
          <template v-if="row.platform === 'IOS'">
            <el-tag :type="row.iosRefundAuditStatus === 1 ? 'success' : row.iosRefundAuditStatus === 2 ? 'danger' : 'warning'">
              {{ auditStatusLabel(row.iosRefundAuditStatus ?? 0) }}
            </el-tag>
            <div class="mt-4px text-12px">
              问询意见：{{ row.iosRefundAuditStatus === 1 ? '0 · 建议退款' : '1 · 拒绝退款' }}
            </div>
            <div class="mt-4px text-12px text-[var(--el-text-color-secondary)]">
              {{ row.iosRefundQueryResult == null ? '未收到 Apple 问询' : `最近应答：${row.iosRefundQueryResult}` }}
            </div>
          </template>
          <template v-else-if="row.businessOrder?.refundApplyTime">
            <el-tag
              :type="
                row.businessOrder.refundAuditStatus === 0
                  ? 'warning'
                  : row.businessOrder.refundAuditStatus === 1
                    ? 'success'
                    : 'info'
              "
            >
              {{ auditStatusLabel(row.businessOrder.refundAuditStatus) }}
            </el-tag><div class="mt-4px text-12px">
              {{
                money(row.businessOrder.refundAmount)
              }}
            </div><div v-if="row.businessOrder.payRefundId" class="mt-4px text-12px">
              {{ row.businessOrder.refundStatus === 10 ? '退款成功' : row.businessOrder.refundStatus === 20 ? '退款失败' : '退款处理中' }}
            </div>
          </template><span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        label="最近处理信息"
        prop="errorMessage"
        min-width="220"
        show-overflow-tooltip
      />
      <el-table-column label="操作" fixed="right" width="235">
        <template #default="{ row }">
          <div class="flex flex-wrap gap-x-8px gap-y-4px">
            <el-button
              v-hasPermi="['gamer:virtual-payment:query']"
              link
              type="primary"
              @click="detailRef?.open(row.id)"
            >
              详情
            </el-button>
            <el-button
              v-hasPermi="['gamer:virtual-payment:query']"
              link
              type="primary"
              @click="detailRef?.open(row.id, 'logs')"
            >
              日志
            </el-button>
            <el-button
              v-if="row.canReconcile"
              v-hasPermi="['gamer:virtual-payment:reconcile']"
              link
              type="warning"
              @click="openAction('reconcile', row)"
            >
              {{
                ['REFUND', 'CURRENCY_CANCEL'].includes(row.type) ? '同步退款' : '核对并结单'
              }}
            </el-button>
            <el-button
              v-if="row.canAuditRefund"
              v-hasPermi="['gamer:virtual-payment:refund-audit']"
              link
              type="danger"
              @click="openAction('audit', row)"
            >
              {{ row.platform === 'IOS' ? 'iOS 退款审核' : '退款审核' }}
            </el-button>
            <el-button
              v-if="row.canRefund"
              v-hasPermi="['gamer:virtual-payment:refund']"
              link
              type="danger"
              @click="openAction('refund', row)"
            >
              充值退款
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      v-model:page="query.pageNo"
      v-model:limit="query.pageSize"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>
  <VirtualPaymentDetail ref="detailRef" />
  <Dialog v-model="actionDialog" :title="actionTitle" width="620px" :close-on-click-modal="false">
    <el-alert
      v-if="action === 'reconcile'"
      title="将重新查询微信并继续原支付流程。金额或订单状态不符时保留原状态，操作结果会写入日志。"
      type="info"
      :closable="false"
      show-icon
      class="mb-16px"
    />
    <el-alert
      v-else-if="action === 'audit'"
      :title="selected.platform === 'IOS' ? '保存 Apple 退款问询意见：同意返回 0；待审核、未同意或拒绝返回 1。审核不会直接退款，最终结果由 Apple 决定。' : '审核通过后发起退款；最终退款成功以微信结果为准。'"
      type="warning"
      :closable="false"
      show-icon
      class="mb-16px"
    />
    <el-descriptions :column="1" border class="mb-16px">
      <el-descriptions-item label="虚拟支付流水">
        {{ selected.bizOrderNo }}
      </el-descriptions-item><el-descriptions-item label="业务订单">
        {{
          selected.merchantOrderId || '普通充值'
        }}
      </el-descriptions-item><el-descriptions-item v-if="action === 'audit' && selected.platform === 'IOS'" label="退款问询">
        {{ selected.iosRefundQueryReason || '尚未收到 Apple 问询，可提前保存审核意见' }}
      </el-descriptions-item><el-descriptions-item v-else-if="action === 'audit'" label="申请退款">
        {{ money(selected.businessOrder?.refundAmount) }} ·
        {{ selected.businessOrder?.refundApplyReason || '-' }}
      </el-descriptions-item>
    </el-descriptions>
    <el-form
      ref="actionRef"
      :model="actionForm"
      :rules="actionRules"
      label-width="100px"
      :disabled="actionLoading"
    >
      <el-form-item v-if="action === 'audit'" label="审核结果">
        <el-radio-group v-model="actionForm.auditStatus">
          <el-radio :value="1">
            {{ selected.platform === 'IOS' ? '同意退款（返回 0）' : '通过并退款' }}
          </el-radio><el-radio :value="2">
            {{ selected.platform === 'IOS' ? '拒绝退款（返回 1）' : '驳回申请' }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="action === 'refund'" label="退款金额" prop="refundAmount">
        <el-input-number
          v-model="actionForm.refundAmount"
          :min="0.01"
          :max="Number(selected.basePayPrice ?? selected.amount ?? 0) / 100"
          :precision="2"
          :step="1"
        /><span class="ml-8px">元</span>
      </el-form-item>
      <el-form-item v-if="action === 'refund'" label="退款原因">
        <el-select v-model="actionForm.refundReason" class="!w-full">
          <el-option label="暂无描述" :value="0" /><el-option
            label="产品问题"
            :value="1"
          /><el-option label="售后问题" :value="2" /><el-option
            label="用户主动退款"
            :value="3"
          /><el-option label="价格问题" :value="4" /><el-option
            label="其他原因"
            :value="5"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="action === 'audit' ? '审核说明' : '操作备注'" prop="remark">
        <el-input
          v-model="actionForm.remark"
          type="textarea"
          :rows="3"
          :maxlength="500"
          show-word-limit
          placeholder="请填写核对依据或审核说明，便于后续追溯"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="actionLoading" @click="actionDialog = false">
        取消
      </el-button><el-button
        :type="action === 'reconcile' ? 'primary' : 'danger'"
        :loading="actionLoading"
        @click="submitAction"
      >
        {{ action === 'reconcile' ? '开始核对' : '确认审核' }}
      </el-button>
    </template>
  </Dialog>
  <Dialog v-model="presentDialog" title="赠送代币" width="520px">
    <el-form ref="presentRef" :model="presentForm" :rules="presentRules" label-width="100px">
      <el-form-item label="用户编号" prop="userId">
        <el-input-number v-model="presentForm.userId" :min="1" />
      </el-form-item><el-form-item label="赠送金额" prop="amount">
        <el-input-number v-model="presentForm.amount" :min="1" :precision="0" /><span
          class="ml-8px"
        >元对应的代币</span>
      </el-form-item><el-form-item label="备注">
        <el-input
          v-model="presentForm.remark"
          type="textarea"
          :maxlength="500"
        />
      </el-form-item>
    </el-form><template #footer>
      <el-button @click="presentDialog = false">
        取消
      </el-button><el-button type="primary" :loading="presentLoading" @click="present">
        确认赠送
      </el-button>
    </template>
  </Dialog>
  <Dialog v-model="billDialog" title="下载微信虚拟支付账单" width="520px">
    <el-form ref="billRef" :model="bill" label-width="100px">
      <el-form-item
        label="开始日期"
        prop="beginDate"
        :rules="[{ required: true, message: '请选择开始日期' }]"
      >
        <el-date-picker
          v-model="bill.beginDate"
          type="date"
          value-format="YYYY-MM-DD"
        />
      </el-form-item><el-form-item
        label="结束日期"
        prop="endDate"
        :rules="[{ required: true, message: '请选择结束日期' }]"
      >
        <el-date-picker
          v-model="bill.endDate"
          type="date"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
    </el-form><template #footer>
      <el-button @click="billDialog = false">
        取消
      </el-button><el-button type="primary" :loading="billLoading" @click="downloadBill">
        下载
      </el-button>
    </template>
  </Dialog>
</template>

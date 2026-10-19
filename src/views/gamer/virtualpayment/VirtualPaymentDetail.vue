<script setup lang="ts">
import type { VirtualPaymentOperationLog, VirtualPaymentRecord } from '@/api/gamer/virtualpayment'
import { VirtualPaymentApi } from '@/api/gamer/virtualpayment'
import { formatDate } from '@/utils/formatTime'

import {
  auditStatusLabel,
  businessStatusLabel,
  money,
  operationLabel,
  payStatusLabel,
  platformLabel,
  statusInfo,
  typeLabel,
  wechatStatusLabel,
} from './data'

defineOptions({ name: 'VirtualPaymentDetail' })
const visible = ref(false)
const loading = ref(false)
const record = ref<VirtualPaymentRecord>({})
const tab = ref('detail')
const logs = ref<VirtualPaymentOperationLog[]>([])
const logTotal = ref(0)
const logLoading = ref(false)
const logPage = reactive({ pageNo: 1, pageSize: 10 })
let requestId = 0

async function loadLogs() {
  const id = record.value.id
  if (!id) return
  const activeRequest = requestId
  logLoading.value = true
  try {
    const data = await VirtualPaymentApi.getOperationLogs(id, logPage.pageNo, logPage.pageSize)
    if (activeRequest !== requestId) return
    logs.value = data.list
    logTotal.value = data.total
  }
  finally {
    if (activeRequest === requestId) logLoading.value = false
  }
}

async function open(id: number, activeTab = 'detail') {
  const activeRequest = ++requestId
  visible.value = true
  loading.value = true
  tab.value = activeTab
  record.value = {}
  logs.value = []
  logTotal.value = 0
  logPage.pageNo = 1
  try {
    const data = await VirtualPaymentApi.getVirtualPayment(id)
    if (activeRequest !== requestId) return
    record.value = data
    await loadLogs()
  }
  finally {
    if (activeRequest === requestId) loading.value = false
  }
}
defineExpose({ open })

function pretty(value?: string) {
  if (!value) return '暂无数据'
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  }
  catch {
    return value
  }
}
</script>

<template>
  <Dialog v-model="visible" title="虚拟支付详情" width="1020px" :scroll="true" :max-height="720">
    <div v-loading="loading" class="min-h-200px">
      <el-alert
        v-if="record.errorMessage"
        :title="record.errorMessage"
        type="warning"
        :closable="false"
        show-icon
        class="mb-16px"
      />
      <el-alert
        v-if="record.platform === 'IOS'"
        title="iOS 用户在 App Store 申请退款。后台审核同意后问询返回 0；待审核、未同意或拒绝返回 1。实际是否退款由 Apple 决定。"
        type="info"
        :closable="false"
        show-icon
        class="mb-16px"
      />
      <el-tabs v-model="tab">
        <el-tab-pane label="订单与金额" name="detail">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="虚拟支付流水">
              {{
                record.bizOrderNo || '-'
              }}
            </el-descriptions-item>
            <el-descriptions-item label="支付平台">
              {{
                platformLabel(record.platform)
              }}
            </el-descriptions-item>
            <el-descriptions-item label="流水类型">
              {{
                typeLabel(record.type, record.paymentPurpose)
              }}
            </el-descriptions-item>
            <el-descriptions-item label="本地处理状态">
              <el-tag :type="statusInfo(record.status).type">
                {{
                  statusInfo(record.status).label
                }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="微信查单状态">
              {{
                wechatStatusLabel(record.wechatOrderStatus)
              }}
            </el-descriptions-item>
            <el-descriptions-item label="支付单状态">
              {{
                payStatusLabel(record.payOrderStatus)
              }}
            </el-descriptions-item>
            <el-descriptions-item label="用户编号">
              {{ record.userId || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="支付单编号">
              {{
                record.payOrderId || '-'
              }}
            </el-descriptions-item>
            <el-descriptions-item label="业务订单号">
              {{
                record.merchantOrderId || '-'
              }}
            </el-descriptions-item>
            <el-descriptions-item label="微信订单号">
              {{
                record.wxOrderId || '-'
              }}
            </el-descriptions-item>
            <el-descriptions-item label="业务金额">
              {{
                money(record.basePayPrice)
              }}
            </el-descriptions-item>
            <el-descriptions-item label="iOS 手续费">
              {{
                money(record.feePrice)
              }}
            </el-descriptions-item>
            <el-descriptions-item label="代币取整差额">
              {{
                money(record.roundingPrice)
              }}
            </el-descriptions-item>
            <el-descriptions-item label="记录实付金额">
              {{
                money(record.payPrice)
              }}
            </el-descriptions-item>
            <el-descriptions-item label="微信查单实付">
              {{
                money(record.wechatPaidPrice)
              }}
            </el-descriptions-item>
            <el-descriptions-item label="本笔变动金额">
              {{
                money(record.amount)
              }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{
                record.createTime ? formatDate(new Date(record.createTime)) : '-'
              }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间">
              {{
                record.updateTime ? formatDate(new Date(record.updateTime)) : '-'
              }}
            </el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">
              {{
                record.remark || '-'
              }}
            </el-descriptions-item>
          </el-descriptions>
          <template v-if="record.platform === 'IOS'">
            <div class="my-16px font-bold">
              iOS Apple 退款问询与审核
            </div>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="审核意见">
                {{ auditStatusLabel(record.iosRefundAuditStatus ?? 0) }}
              </el-descriptions-item>
              <el-descriptions-item label="后续问询返回">
                {{ record.iosRefundAuditStatus === 1 ? '0 · 建议退款' : '1 · 拒绝退款' }}
              </el-descriptions-item>
              <el-descriptions-item label="最近实际应答">
                {{ record.iosRefundQueryResult == null ? '未收到问询' : record.iosRefundQueryResult === 0 ? '0 · 建议退款' : '1 · 拒绝退款' }}
              </el-descriptions-item>
              <el-descriptions-item label="最近问询时间">
                {{ record.iosRefundQueryTime ? formatDate(new Date(record.iosRefundQueryTime)) : '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="用户退款原因" :span="2">
                {{ record.iosRefundQueryReason || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="审核说明" :span="2">
                {{ record.iosRefundAuditReason || '尚未同意退款，默认返回 1' }}
              </el-descriptions-item>
              <el-descriptions-item label="审核人">
                {{ record.iosRefundAuditUserId || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="审核时间">
                {{ record.iosRefundAuditTime ? formatDate(new Date(record.iosRefundAuditTime)) : '-' }}
              </el-descriptions-item>
            </el-descriptions>
          </template>
          <template v-if="record.businessOrder">
            <div class="my-16px font-bold">
              关联业务订单与退款审核
            </div>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="业务订单">
                {{
                  record.businessOrder.orderNo
                }}
              </el-descriptions-item>
              <el-descriptions-item label="订单状态">
                {{
                  businessStatusLabel(record.businessOrder.orderStatus)
                }}
              </el-descriptions-item>
              <el-descriptions-item label="申请退款金额">
                {{
                  money(record.businessOrder.refundAmount)
                }}
              </el-descriptions-item>
              <el-descriptions-item label="退款审核">
                {{
                  auditStatusLabel(record.businessOrder.refundAuditStatus)
                }}
              </el-descriptions-item>
              <el-descriptions-item label="退款处理状态">
                {{
                  record.businessOrder.refundStatus === 10
                    ? '退款成功'
                    : record.businessOrder.refundStatus === 20
                      ? '退款失败'
                      : record.businessOrder.payRefundId
                        ? '退款处理中'
                        : '-'
                }}
              </el-descriptions-item>
              <el-descriptions-item label="退款单编号">
                {{
                  record.businessOrder.payRefundId || '-'
                }}
              </el-descriptions-item>
              <el-descriptions-item label="申请原因" :span="2">
                {{
                  record.businessOrder.refundApplyReason || '-'
                }}
              </el-descriptions-item>
              <el-descriptions-item label="审核说明" :span="2">
                {{
                  record.businessOrder.refundAuditReason || '-'
                }}
              </el-descriptions-item>
              <el-descriptions-item label="审核人">
                {{
                  record.businessOrder.refundAuditUserId || '-'
                }}
              </el-descriptions-item>
              <el-descriptions-item label="审核时间">
                {{
                  record.businessOrder.refundAuditTime
                    ? formatDate(new Date(record.businessOrder.refundAuditTime))
                    : '-'
                }}
              </el-descriptions-item>
            </el-descriptions>
          </template>
        </el-tab-pane>
        <el-tab-pane label="请求与微信响应" name="response">
          <template v-if="record.platform === 'IOS'">
            <div class="mb-8px font-bold">
              最近一次 Apple 退款问询
            </div>
            <pre class="mb-16px overflow-auto rounded bg-[var(--el-fill-color-light)] p-12px text-12px">{{ pretty(record.iosRefundQueryData) }}</pre>
          </template>
          <div class="mb-8px font-bold">
            原始请求参数
          </div>
          <pre class="overflow-auto rounded bg-[var(--el-fill-color-light)] p-12px text-12px">{{
            pretty(record.requestData)
          }}</pre>
          <div class="my-8px font-bold">
            最后一次微信响应
          </div>
          <pre class="overflow-auto rounded bg-[var(--el-fill-color-light)] p-12px text-12px">{{
            pretty(record.responseData)
          }}</pre>
        </el-tab-pane>
        <el-tab-pane label="操作日志" name="logs">
          <el-table v-loading="logLoading" :data="logs" border>
            <el-table-column label="操作时间" width="165">
              <template #default="{ row }">
                {{
                  formatDate(row.createTime)
                }}
              </template>
            </el-table-column>
            <el-table-column label="操作人 ID" prop="adminUserId" width="100" />
            <el-table-column label="操作" width="135">
              <template #default="{ row }">
                {{
                  operationLabel(row.action)
                }}
              </template>
            </el-table-column>
            <el-table-column label="状态变更" min-width="160">
              <template #default="{ row }">
                {{ statusInfo(row.beforeStatus).label }} →
                {{ statusInfo(row.afterStatus).label }}
              </template>
            </el-table-column>
            <el-table-column label="操作结果" width="100">
              <template #default="{ row }">
                <el-tag
                  :type="
                    row.result === 'SUCCESS'
                      ? 'success'
                      : row.result === 'PROCESSING'
                        ? 'warning'
                        : 'danger'
                  "
                >
                  {{
                    row.result === 'SUCCESS'
                      ? '已完成'
                      : row.result === 'PROCESSING'
                        ? '处理中'
                        : '未完成'
                  }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="处理结果 / 备注" min-width="240">
              <template #default="{ row }">
                <div>{{ row.message || '-' }}</div><div class="mt-4px text-[var(--el-text-color-secondary)]">
                  {{
                    row.remark
                  }}
                </div>
              </template>
            </el-table-column>
          </el-table>
          <Pagination
            v-model:page="logPage.pageNo"
            v-model:limit="logPage.pageSize"
            :total="logTotal"
            @pagination="loadLogs"
          />
        </el-tab-pane>
      </el-tabs>
    </div>
    <template #footer>
      <el-button @click="visible = false">
        关闭
      </el-button>
    </template>
  </Dialog>
</template>

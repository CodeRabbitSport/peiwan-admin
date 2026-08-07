<script setup lang="ts">
import type { LevelConfig } from '@/api/gamer/levelconfig'
import { fenToYuan } from '@/utils'

defineOptions({ name: 'LevelConfigRestrictions' })

const props = withDefaults(defineProps<{
  config: LevelConfig
  showCommission?: boolean
}>(), {
  showCommission: false,
})

function formatMoney(value: unknown) {
  return value === undefined || value === null || value === ''
    ? '--'
    : `${fenToYuan(value as string | number)} 元`
}

function formatValue(value: unknown, unit = '') {
  return value === undefined || value === null || value === '' ? '--' : `${value}${unit}`
}

function formatLimit(value: unknown, unit = '') {
  if (value === 0 || value === '0') return '不限制'
  return formatValue(value, unit)
}

function permissionText(value: unknown) {
  return value === true || value === 1 || value === '1' ? '有' : '无'
}

function allowText(value: unknown) {
  return value === true || value === 1 || value === '1' ? '允许' : '不允许'
}

function verificationText(value: unknown) {
  return {
    0: '无需验证',
    1: '验证码验证',
    2: '支付密码验证',
  }[String(value)] || '--'
}

const restrictionItems = computed(() => {
  const row = props.config
  const items = [
    { label: '接单保证金', value: formatMoney(row.depositFee) },
    { label: '每日接单数', value: formatLimit(row.dailyOrderLimit, ' 单') },
    { label: '新订单延迟接单时间', value: formatValue(row.newOrderDelaySeconds, ' 秒') },
    { label: '提现手续费', value: formatValue(row.withdrawalFeeRate, '%') },
    { label: '订单服务费解冻时间', value: formatValue(row.orderFeeUnfreezeSeconds, ' 秒') },
    { label: '打赏金额抽成', value: formatValue(row.rewardCommissionRate, '%') },
    { label: '可自主取消接单订单', value: permissionText(row.canCancelOrder) },
    { label: '可自主退款接单订单', value: permissionText(row.canRefundOrder) },
    { label: '查看已申请退款用户手机号', value: permissionText(row.canViewRefundPhone) },
    { label: '查看未退款用户手机号', value: permissionText(row.canViewUnrefundedPhone) },
    {
      label: '查看未退款用户手机号天数',
      value: row.viewPhoneDaysLimit === -1 ? '不限制' : formatValue(row.viewPhoneDaysLimit, ' 天'),
    },
    { label: '设置用户公告内容权限', value: permissionText(row.canSetAnnouncement) },
    { label: '保证金退还安全期限', value: formatValue(row.depositRefundSafeDays, ' 天') },
    { label: '限制指定接单商品', value: row.restrictedProductIds || '无' },
    { label: '每日接单缴费金额', value: formatMoney(row.dailyOrderFeeLimit) },
    { label: '同时可接单数', value: formatLimit(row.simultaneousOrderLimit, ' 单') },
    { label: '接单验证类型', value: verificationText(row.orderVerificationType) },
    { label: '升级人数名额', value: formatLimit(row.upgradeSlotLimit, ' 人') },
    { label: '允许接单抵扣保证金', value: allowText(row.allowDepositRecharge) },
  ]

  if (props.showCommission) {
    items.splice(4, 0, { label: '陪玩到手比例', value: formatValue(row.commissionRate, '%') })
  }

  return items
})
</script>

<template>
  <div class="restriction-summary">
    <div class="restriction-metric">
      <span>保证金</span>
      <strong>{{ formatMoney(config.depositFee) }}</strong>
    </div>
    <div class="restriction-metric">
      <span>每日接单</span>
      <strong>{{ formatLimit(config.dailyOrderLimit, ' 单') }}</strong>
    </div>
    <div class="restriction-metric">
      <span>同时接单</span>
      <strong>{{ formatLimit(config.simultaneousOrderLimit, ' 单') }}</strong>
    </div>

    <el-popover placement="left-start" :width="640" trigger="click">
      <template #reference>
        <el-button class="restriction-detail-button" link type="primary" size="small">
          <Icon icon="ep:view" class="mr-[4px]" />
          查看全部
        </el-button>
      </template>

      <div class="restriction-detail-title">
        功能限制明细
      </div>
      <div class="restriction-detail-list">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item
            v-for="item in restrictionItems"
            :key="item.label"
            :label="item.label"
          >
            {{ item.value }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-popover>
  </div>
</template>

<style scoped>
.restriction-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(70px, 1fr));
  align-items: center;
  min-width: 260px;
}

.restriction-metric {
  min-width: 0;
  padding: 0 8px;
  text-align: center;
}

.restriction-metric + .restriction-metric {
  border-left: 1px solid var(--el-border-color-lighter);
}

.restriction-metric span,
.restriction-metric strong {
  display: block;
  overflow: hidden;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.restriction-metric span {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.restriction-metric strong {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.restriction-detail-button {
  grid-column: 1 / -1;
  justify-self: center;
  margin-top: 2px;
}

.restriction-detail-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.restriction-detail-list {
  max-height: 480px;
  overflow-y: auto;
}

.restriction-detail-list :deep(.el-descriptions__label) {
  width: 150px;
  white-space: nowrap;
}
</style>

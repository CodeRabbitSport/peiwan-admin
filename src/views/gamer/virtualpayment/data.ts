export const typeOptions = [
  { label: '现金充值 / 订单补差额', value: 'RECHARGE' },
  { label: '代币支付', value: 'CURRENCY_PAY' },
  { label: '代币支付退回', value: 'CURRENCY_CANCEL' },
  { label: '现金退款', value: 'REFUND' },
  { label: '代币赠送', value: 'PRESENT' },
  { label: '后台增加', value: 'ADMIN_ADJUST_IN' },
  { label: '后台扣减', value: 'ADMIN_ADJUST_OUT' },
  { label: '余额迁移', value: 'MIGRATION' },
  { label: '余额同步', value: 'BALANCE_SYNC' },
]

export const statusOptions = [
  { label: '待处理', value: 'PENDING', type: 'warning' },
  { label: '微信已成功，待结单', value: 'REMOTE_SUCCESS', type: 'warning' },
  { label: '处理中', value: 'PROCESSING', type: 'warning' },
  { label: '人工核对', value: 'REVIEW_REQUIRED', type: 'danger' },
  { label: '成功', value: 'SUCCESS', type: 'success' },
  { label: '失败', value: 'FAILED', type: 'danger' },
  { label: '已关闭', value: 'CLOSED', type: 'info' },
] as const

export function statusInfo(status?: string) {
  return (
    statusOptions.find(item => item.value === status) || {
      label: status || '-',
      type: 'info' as const,
    }
  )
}

export function typeLabel(type?: string, paymentPurpose?: string) {
  if (type === 'RECHARGE' && paymentPurpose === 'WALLET_RECHARGE') return '钱包余额充值'
  if (type === 'RECHARGE' && paymentPurpose === 'ORDER_FUNDING') return '业务订单补差额'
  return typeOptions.find(item => item.value === type)?.label || type || '-'
}

export function platformLabel(platform?: string) {
  return (
    { IOS: 'iOS', ANDROID: '安卓', UNKNOWN: '历史记录 / 未知' }[platform || 'UNKNOWN']
    || '历史记录 / 未知'
  )
}

export function money(cents?: number | null) {
  return cents == null ? '-' : `¥${(Number(cents) / 100).toFixed(2)}`
}

export function payStatusLabel(status?: number) {
  return (
    ({ 0: '未支付', 10: '已支付', 20: '已退款', 30: '已关闭' } as Record<number, string>)[
      status ?? -1
    ] || '-'
  )
}

export function wechatStatusLabel(status?: number) {
  return (
    (
      {
        0: '待支付',
        1: '待支付',
        2: '已付款',
        3: '已付款，待发货',
        4: '发货成功',
        5: '已退款',
        6: '已关闭',
        7: '退款失败',
        8: '退款完成',
      } as Record<number, string>
    )[status ?? -1] || '-'
  )
}

export function businessStatusLabel(status?: number) {
  return (
    (
      { 0: '待支付', 1: '进行中', 2: '已完成', 3: '已取消', 4: '退款中', 5: '已退款' } as Record<
        number,
        string
      >
    )[status ?? -1] || '-'
  )
}

export function auditStatusLabel(status?: number) {
  return ({ 0: '待审核', 1: '已通过', 2: '已驳回' } as Record<number, string>)[status ?? -1] || '-'
}

export function operationLabel(action: string) {
  return (
    (
      {
        RECONCILE: '核对 / 同步',
        REFUND_APPROVE: '退款审核通过',
        REFUND_REJECT: '退款审核驳回',
        REFUND_CREATE: '充值退款审核',
      } as Record<string, string>
    )[action] || action
  )
}

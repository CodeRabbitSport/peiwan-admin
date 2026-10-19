import request from '@/config/axios'

export interface VirtualPaymentRecord {
  id?: number
  userId?: number
  openid?: string
  type?: string
  paymentPurpose?: 'WALLET_RECHARGE' | 'ORDER_FUNDING'
  status?: string
  bizOrderNo?: string
  relatedOrderNo?: string
  wxOrderId?: string
  wxRefundId?: string
  amount?: number
  balanceAfter?: number
  requestData?: string
  responseData?: string
  errorMessage?: string
  remark?: string
  createTime?: string
  updateTime?: string
  platform?: 'IOS' | 'ANDROID' | 'UNKNOWN'
  basePayPrice?: number
  feePrice?: number
  roundingPrice?: number
  payPrice?: number
  wechatPaidPrice?: number
  wechatOrderStatus?: number
  payOrderId?: number
  merchantOrderId?: string
  payOrderStatus?: number
  businessOrder?: VirtualPaymentBusinessOrder
  canReconcile?: boolean
  canRefund?: boolean
  canAuditRefund?: boolean
  iosRefundAuditStatus?: number
  iosRefundAuditReason?: string
  iosRefundAuditUserId?: number
  iosRefundAuditTime?: string
  iosRefundQueryData?: string
  iosRefundQueryReason?: string
  iosRefundQueryTime?: string
  iosRefundQueryResult?: number
}

export interface VirtualPaymentBusinessOrder {
  id: number
  type: 'SERVICE_ORDER' | 'ACC_ORDER'
  orderNo: string
  orderStatus: number
  refundStatus?: number
  refundAuditStatus?: number
  refundApplyReason?: string
  refundApplyTime?: string
  refundAuditReason?: string
  refundAuditTime?: string
  refundAuditUserId?: number
  refundAmount?: number
  payRefundId?: number
}

export interface VirtualPaymentOperation {
  success: boolean
  message: string
  record: VirtualPaymentRecord
}

export interface VirtualPaymentOperationLog {
  id: number
  adminUserId: number
  action: string
  beforeStatus: string
  afterStatus?: string
  result: string
  message?: string
  remark?: string
  createTime: string
}

export interface VirtualPaymentPresentReqVO {
  userId: number
  amount: number
  remark?: string
}

export interface VirtualPaymentBalance {
  userId: number
  openid: string
  coinBalance: number
  walletUnit: number
  walletBalance: number
  pendingCount: number
}

export interface VirtualPaymentAdjustReqVO {
  userId: number
  amount: number
  remark?: string
}

export interface VirtualPaymentRefundReqVO {
  id: number
  refundAmount: number
  refundReason: number
  remark?: string
}

export interface VirtualPaymentDownloadBillReqVO {
  beginDate: string
  endDate: string
}

export const VirtualPaymentApi = {
  isEnabled: async () => {
    return await request.get<boolean>({ url: '/gamer/virtual-payment/enabled' })
  },

  getWalletUnit: async () => {
    return await request.get<number>({ url: '/gamer/virtual-payment/wallet-unit' })
  },

  getUserBalance: async (userId: number) => {
    return await request.get<VirtualPaymentBalance>({
      url: '/gamer/virtual-payment/user-balance',
      params: { userId },
    })
  },

  getVirtualPaymentPage: async (params: any) => {
    return await request.get({ url: '/gamer/virtual-payment/page', params })
  },

  getVirtualPayment: async (id: number) => {
    return await request.get<VirtualPaymentRecord>({ url: `/gamer/virtual-payment/get?id=${id}` })
  },

  reconcile: async (data: { id: number, remark: string }) => {
    return await request.post<VirtualPaymentOperation>({
      url: '/gamer/virtual-payment/reconcile',
      data,
    })
  },

  auditRefund: async (data: { id: number, auditStatus: 1 | 2, auditReason: string }) => {
    return await request.post<VirtualPaymentOperation>({
      url: '/gamer/virtual-payment/audit-refund',
      data,
    })
  },

  getOperationLogs: async (id: number, pageNo: number, pageSize: number) => {
    return await request.get<{ list: VirtualPaymentOperationLog[], total: number }>({
      url: '/gamer/virtual-payment/operation-logs',
      params: { id, pageNo, pageSize },
    })
  },

  createVirtualPayment: async (data: VirtualPaymentRecord) => {
    return await request.post({ url: '/gamer/virtual-payment/create', data })
  },

  updateVirtualPayment: async (data: VirtualPaymentRecord) => {
    return await request.put({ url: '/gamer/virtual-payment/update', data })
  },

  deleteVirtualPayment: async (id: number) => {
    return await request.delete({ url: `/gamer/virtual-payment/delete?id=${id}` })
  },

  deleteVirtualPaymentList: async (ids: number[]) => {
    return await request.delete({
      url: `/gamer/virtual-payment/delete-list?ids=${ids.join(',')}`,
    })
  },

  exportVirtualPayment: async (params: any) => {
    return await request.download({ url: '/gamer/virtual-payment/export-excel', params })
  },

  present: async (data: VirtualPaymentPresentReqVO) => {
    return await request.post<number>({
      url: '/gamer/virtual-payment/present',
      data,
    })
  },

  adjust: async (data: VirtualPaymentAdjustReqVO) => {
    return await request.post<number>({
      url: '/gamer/virtual-payment/adjust',
      data,
    })
  },

  refund: async (data: VirtualPaymentRefundReqVO) => {
    return await request.post<VirtualPaymentOperation>({
      url: '/gamer/virtual-payment/refund',
      data,
    })
  },

  downloadBill: async (data: VirtualPaymentDownloadBillReqVO) => {
    return await request.post<string>({
      url: '/gamer/virtual-payment/download-bill',
      data,
    })
  },
}

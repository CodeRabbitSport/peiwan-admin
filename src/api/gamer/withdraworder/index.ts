import type { Dayjs } from 'dayjs'

import request from '@/config/axios'

/** 提现订单信息 */
export interface WithdrawOrder {
  id: number // 提现订单ID
  no?: string // 提现订单号
  userId?: number // 用户ID
  channel?: number // 提现渠道(1微信收款 2支付宝收款 3银行卡收款 4支付宝账号收款)
  phone: string // 手机号
  realName: string // 真实姓名
  accountNo: string // 账号(银行卡号/支付宝账号)
  bankName: string // 银行名称(仅银行卡)
  qrCodeUrl: string // 收款二维码URL
  openid: string // 微信用户openid（仅微信极速到账需要）
  amount?: number // 提现金额
  feeRate: number // 手续费比例(%)
  feeAmount: number // 手续费金额
  actualAmount?: number // 实际到账金额
  withdrawType?: number // 到账类型(1急速到账 2普通到账)
  status: number // 提现状态(0待审核 1审核通过(已打款) 2审核拒绝 3打款失败)
  withdrawRemark: string // 提现备注
  rejectReason: string // 审核拒绝原因
  payTransferId?: number // 转账单编号
  transferChannelCode?: string // 转账渠道
  transactionTime: string | Dayjs // 交易时间
  transactionErrorMsg: string // 转账错误提示
}

// 提现订单 API
export const WithdrawOrderApi = {
  // 查询提现订单分页
  getWithdrawOrderPage: async (params: any) => {
    return await request.get({ url: `/gamer/withdraw-order/page`, params })
  },

  // 查询提现订单详情
  getWithdrawOrder: async (id: number) => {
    return await request.get({ url: `/gamer/withdraw-order/get?id=${id}` })
  },

  // 新增提现订单
  createWithdrawOrder: async (data: WithdrawOrder) => {
    return await request.post({ url: `/gamer/withdraw-order/create`, data })
  },

  // 修改提现订单
  updateWithdrawOrder: async (data: WithdrawOrder) => {
    return await request.put({ url: `/gamer/withdraw-order/update`, data })
  },

  // 删除提现订单
  deleteWithdrawOrder: async (id: number) => {
    return await request.delete({ url: `/gamer/withdraw-order/delete?id=${id}` })
  },

  /** 批量删除提现订单 */
  deleteWithdrawOrderList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/withdraw-order/delete-list?ids=${ids.join(',')}` })
  },

  // 导出提现订单 Excel
  exportWithdrawOrder: async (params) => {
    return await request.download({ url: `/gamer/withdraw-order/export-excel`, params })
  },

  /**
   * 审核同意提现订单
   * @param {string} id 提现订单ID
   * @returns
   */
  WithdrawOrder_approveWithdrawOrder: async (params) => {
    return request.put({ url: `/gamer/withdraw-order/approve?id=${params.id}` })
  },
  /**
   * 审核拒绝提现订单
   * @param {object} data 管理后台 - 提现订单审核拒绝 Request VO
   * @param {number} data.id 提现订单ID
   * @param {string} data.reason 拒绝原因
   * @returns
   */
  WithdrawOrder_rejectWithdrawOrder: async (data) => {
    return request.put({ url: `/gamer/withdraw-order/reject`, data })
  },
}

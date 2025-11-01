import type { Dayjs } from 'dayjs'

import request from '@/config/axios'

/** 保证金转入余额订单信息 */
export interface DepositTransfer {
  id: number // 退款单ID
  transactionNo?: string // 流水号
  userId?: number // 用户ID
  transferredAt: string | Dayjs // 实际退款时间
  transactionAmount?: number // 退款保证金金额(分)
  autoTransferredAt: string | Dayjs // 预计自动退款时间 = 审核通过时间 + wait_days
  isManualTransferred: boolean // 是否人工提前退款 0否 1是
  status?: number // 退款状态(0-待审核,1-已通过,2-已拒绝)
  approvedAt: string | Dayjs // 审核通过时间
  waitDays: number // 退款等待天数(冗余保存配置，如33)
  transferStatus: number // 转账状态(0-未转账,1-已转账)
  remark: string // 备注
}

// 保证金转入余额订单 API
export const DepositTransferApi = {
  // 查询保证金转入余额订单分页
  getDepositTransferPage: async (params: any) => {
    return await request.get({ url: `/gamer/deposit-transfer/page`, params })
  },

  // 查询保证金转入余额订单详情
  getDepositTransfer: async (id: number) => {
    return await request.get({ url: `/gamer/deposit-transfer/get?id=${id}` })
  },

  // 新增保证金转入余额订单
  createDepositTransfer: async (data: DepositTransfer) => {
    return await request.post({ url: `/gamer/deposit-transfer/create`, data })
  },

  // 修改保证金转入余额订单
  updateDepositTransfer: async (data: DepositTransfer) => {
    return await request.put({ url: `/gamer/deposit-transfer/update`, data })
  },

  // 删除保证金转入余额订单
  deleteDepositTransfer: async (id: number) => {
    return await request.delete({ url: `/gamer/deposit-transfer/delete?id=${id}` })
  },

  /** 批量删除保证金转入余额订单 */
  deleteDepositTransferList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/deposit-transfer/delete-list?ids=${ids.join(',')}` })
  },

  // 导出保证金转入余额订单 Excel
  exportDepositTransfer: async (params) => {
    return await request.download({ url: `/gamer/deposit-transfer/export-excel`, params })
  },
}

/**
 * 审核保证金转账申请
 * @param {object} params 管理后台 - 保证金转账申请审核 Request VO
 * @param {number} params.id 转账单ID
 * @param {number} params.status 审核状态(1-已通过,2-已拒绝)
 * @param {string} params.remark 审核备注
 * @returns
 */
export function DepositTransfer_approveDepositTransfer(params: any) {
  return request.post({ url: `/gamer/deposit-transfer/approve`, data: params })
}


/** 
 * 手动执行保证金转账
 * @param {object} params 管理后台 - 手动执行保证金转账 Request VO
 * @param {number} params.id 转账单ID
 * @param {string} params.remark 执行备注
 * @param {boolean} params.isManual 是否手动执行
 * @returns
 */
export function DepositTransfer_executeDepositTransfer(params: any) {
  return request.post({ url: `/gamer/deposit-transfer/execute`, data: params })
}

import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 会员保证金充值信息 */
export interface DepositRecharge {
          id: number; // 编号
          no?: string; // 流水号
          userId?: number; // 用户编号
          totalPrice?: number; // 用户实际到账余额，例如充 100 送 20，则该值是 120
          payPrice?: number; // 实际支付金额
          bonusPrice?: number; // 钱包赠送金额
          packageId: number; // 充值套餐编号
          payStatus?: boolean; // 是否已支付：[0:未支付 1:已经支付过]
          payOrderId: number; // 支付订单编号
          payChannelCode: string; // 支付成功的支付渠道
          payTime: string | Dayjs; // 订单支付时间
          payRefundId: number; // 支付退款单编号
          refundTotalPrice?: number; // 退款金额，包含赠送金额
          refundPayPrice?: number; // 退款支付金额
          refundBonusPrice?: number; // 退款钱包赠送金额
          refundTime: string | Dayjs; // 退款时间
          refundStatus?: number; // 退款状态
  }

// 会员保证金充值 API
export const DepositRechargeApi = {
  // 查询会员保证金充值分页
  getDepositRechargePage: async (params: any) => {
    return await request.get({ url: `/gamer/deposit-recharge/page`, params })
  },

  // 查询会员保证金充值详情
  getDepositRecharge: async (id: number) => {
    return await request.get({ url: `/gamer/deposit-recharge/get?id=` + id })
  },

  // 新增会员保证金充值
  createDepositRecharge: async (data: DepositRecharge) => {
    return await request.post({ url: `/gamer/deposit-recharge/create`, data })
  },

  // 修改会员保证金充值
  updateDepositRecharge: async (data: DepositRecharge) => {
    return await request.put({ url: `/gamer/deposit-recharge/update`, data })
  },

  // 删除会员保证金充值
  deleteDepositRecharge: async (id: number) => {
    return await request.delete({ url: `/gamer/deposit-recharge/delete?id=` + id })
  },

  /** 批量删除会员保证金充值 */
  deleteDepositRechargeList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/deposit-recharge/delete-list?ids=${ids.join(',')}` })
  },

  // 导出会员保证金充值 Excel
  exportDepositRecharge: async (params) => {
    return await request.download({ url: `/gamer/deposit-recharge/export-excel`, params })
  }
}
import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 礼物赠送订单信息 */
export interface GiftOrder {
          id: number; // 订单ID
          orderNo?: string; // 订单编号
          senderId?: number; // 赠送人ID
          receiverId?: number; // 被赠送人ID
          giftId?: number; // 礼物ID
          giftName?: string; // 礼物名称
          giftImage: string; // 礼物图片URL
          giftRate?: number; // 平台抽成比例
          quantity: number; // 数量
          totalAmount?: number; // 订单总金额，单位：分
          couponAmount?: number; // 优惠券优惠金额，单位：分
          actualAmount?: number; // 实际支付金额，单位：分
          platformFee?: number; // 平台抽成费用，单位：分
          expireTime?: string | Dayjs; // 订单过期时间
          payStatus?: number; // 支付状态：0-未支付 1-已支付 2-已退款
          payTime: string | Dayjs; // 支付时间
          payChannelCode: string; // 支付渠道编码
          payOrderId: number; // 支付订单ID
          refundStatus: number; // 退款状态
          refundApplyReason: string; // 退款申请原因
          refundApplyTime: string | Dayjs; // 退款申请时间
          refundAmount: number; // 退款金额，单位：分
          refundTime: string | Dayjs; // 退款时间
          payRefundId: number; // 退款订单ID
          bizId: number; // 关联业务ID
          bizType?: number; // 业务来源类型(10-打手主页,20-服务订单,30-服务订单私聊,40-私聊)
  }

// 礼物赠送订单 API
export const GiftOrderApi = {
  // 查询礼物赠送订单分页
  getGiftOrderPage: async (params: any) => {
    return await request.get({ url: `/gamer/gift-order/page`, params })
  },

  // 查询礼物赠送订单详情
  getGiftOrder: async (id: number) => {
    return await request.get({ url: `/gamer/gift-order/get?id=` + id })
  },

  // 新增礼物赠送订单
  createGiftOrder: async (data: GiftOrder) => {
    return await request.post({ url: `/gamer/gift-order/create`, data })
  },

  // 修改礼物赠送订单
  updateGiftOrder: async (data: GiftOrder) => {
    return await request.put({ url: `/gamer/gift-order/update`, data })
  },

  // 删除礼物赠送订单
  deleteGiftOrder: async (id: number) => {
    return await request.delete({ url: `/gamer/gift-order/delete?id=` + id })
  },

  /** 批量删除礼物赠送订单 */
  deleteGiftOrderList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/gift-order/delete-list?ids=${ids.join(',')}` })
  },

  // 导出礼物赠送订单 Excel
  exportGiftOrder: async (params) => {
    return await request.download({ url: `/gamer/gift-order/export-excel`, params })
  }
}
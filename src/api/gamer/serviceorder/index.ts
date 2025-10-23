import type { Dayjs } from 'dayjs'

import request from '@/config/axios'

/** 用户订单信息 */
export interface ServiceOrder {
  id: number // 订单ID，主键
  orderNo?: string // 订单号
  userId?: number // 下单用户ID
  acceptorId: number // 接单人用户ID
  acceptTime: string | Dayjs // 接单时间
  productId?: number // 商品ID
  productName?: string // 商品名称
  productPicUrl: string // 商品图片URL
  productPrice?: number // 商品价格
  orderStatus?: number // 订单状态：0-待支付 1-已支付待接单 2-进行中 3-已完成 4-已取消 5-退款中 6-已退款
  totalAmount?: number // 订单总金额
  discountAmount?: number // 优惠金额
  couponAmount?: number // 优惠券优惠金额
  actualAmount?: number // 实际支付金额
  platformFee?: number // 平台手续费
  acceptorAmount?: number // 接单人获得金额
  userCouponId: number // 使用的用户优惠券ID
  couponId: number // 优惠券ID
  deadlineTime: string | Dayjs // 订单截止时间(预留字段)
  startTime: string | Dayjs // 订单开始执行时间
  completeTime: string | Dayjs // 接单人完成时间(状态变为3时记录)
  confirmTime: string | Dayjs // 用户确认完成时间(状态变为4时记录)
  payStatus?: number // 支付状态：0-未支付 1-已支付 2-已退款
  payTime: string | Dayjs // 支付时间
  payChannelCode: string // 支付渠道编码
  payOrderId: number // 支付订单ID
  categoryType: number // 订单类型
  categoryId: number // 订单类型ID
  cancelReason: string // 取消原因
  cancelTime: string | Dayjs // 取消时间
  cancelUserId: number // 取消操作人ID
  refundApplyReason: string // 退款申请原因
  refundApplyTime: string | Dayjs // 退款申请时间
  refundAuditStatus: number // 退款审核状态：1-审核通过 2-审核拒绝
  refundAuditReason: string // 退款审核原因(拒绝时填写)
  refundAuditTime: string | Dayjs // 退款审核时间
  refundAuditUserId: number // 退款审核人ID
  refundAmount: number // 退款金额
  refundTime: string | Dayjs // 退款时间
  payRefundId: number // 退款订单ID
}

/**
 * 指定接单人接受订单
 * @param {object} params 指定服务订单接单人的接受参数
 * @param {string} params.captchaVerification 验证码，验证码开启时，需要传递
 * @param {number} params.orderId 订单ID
 * @param {number} params.teamId 队伍ID（组队接单时必填）
 * @param {string} params.remark 备注信息
 * @param {number} params.userId 接单人的用户编号
 * @returns
 */
export function acceptOrder(data: any) {
  return request.post({ url: `/gamer/service-order/accept-order`, data })
}
// 用户订单 API
export const ServiceOrderApi = {
  // 查询用户订单分页
  getServiceOrderPage: async (params: any) => {
    return await request.get({ url: `/gamer/service-order/page`, params })
  },

  // 查询用户订单详情
  getServiceOrder: async (id: number) => {
    return await request.get({ url: `/gamer/service-order/get?id=${id}` })
  },

  // 新增用户订单
  createServiceOrder: async (data: ServiceOrder) => {
    return await request.post({ url: `/gamer/service-order/create`, data })
  },

  // 修改用户订单
  updateServiceOrder: async (data: ServiceOrder) => {
    return await request.put({ url: `/gamer/service-order/update`, data })
  },

  // 删除用户订单
  deleteServiceOrder: async (id: number) => {
    return await request.delete({ url: `/gamer/service-order/delete?id=${id}` })
  },

  /** 批量删除用户订单 */
  deleteServiceOrderList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/service-order/delete-list?ids=${ids.join(',')}` })
  },

  // 导出用户订单 Excel
  exportServiceOrder: async (params) => {
    return await request.download({ url: `/gamer/service-order/export-excel`, params })
  },

  // 审核退款
  auditRefund: async (data: { orderId: number, auditStatus: 1 | 2, auditReason?: string }) => {
    return await request.post({ url: `/gamer/service-order/audit-refund`, data })
  },

}

/**
 * 更新订单为已退款
 * @param {object} params PayRefundNotifyReqDTO
 * @param {string} params.merchantOrderId
 * @param {string} params.merchantRefundId
 * @param {number} params.payRefundId
 * @returns
 */
export function ServiceOrder_updateOrderRefunded(data: any) {
  return request.post({ url: `/gamer/service-order/refund-order`, data })
}


/** 
 * 取消接单
 * @param {object} params CancelAcceptOrderVO
 * @param {number} params.orderId 订单编号
 * @returns
 */
export function ServiceOrder_cancelAcceptOrder(data: any) {
  return request.post({ url: `/gamer/service-order/cancel-accept-order`, data })
}

/** 
 * 审核订单完成
 * @param {object} params RestoreOrderReqVO
 * @param {number} params.orderId 订单编号
 * @param {boolean} params.retoreToUnComplete 是否恢复到打手未完成状态
 * @returns
 */
export function ServiceOrder_auditOrderComplete(params: any) {
  return request.post({ url: `/gamer/service-order/audit-order-complete`, data: params });
}

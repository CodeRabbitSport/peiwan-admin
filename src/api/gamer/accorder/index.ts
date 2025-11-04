import type { Dayjs } from 'dayjs'

import request from '@/config/axios'

/** 用户陪玩订单信息 */
export interface AccOrder {
  id: number // 订单ID，主键
  orderNo?: string // 订单号，唯一标识
  userId?: number // 下单用户ID
  categoryId?: number // 分类ID
  levelDecided: number // 接单人等级,0代表未接单
  productPrice?: number // 商品价格，单位：分
  productPriceDifference?: number // 订单差价，单位：分
  productDuration?: number // 商品数量(时长,小时制)
  orderStatus?: number // 订单状态：0-待支付 1-已支付待接单 2-进行中 3-待确认 4-已完成 6-已取消 6-退款中 7-已退款
  orderRemark: string // 订单备注
  totalAmount?: number // 订单总金额，单位：分
  discountAmount?: number // 优惠金额，单位：分
  couponAmount?: number // 优惠券优惠金额，单位：分
  actualAmount?: number // 实际支付金额，单位：分
  differenceAmount?: number // 订单差价(用户确认完成订单后)，单位：分
  platformFee?: number // 平台手续费，单位：分
  parentId: number // 上级ID
  parentFee?: number // 上级可获得分佣，单位：分
  parentFeeRate?: number // 上级可获得分佣比例
  acceptorAmount?: number // 接单人获得金额，单位：分
  userCouponId: number // 使用的用户优惠券ID
  couponId: number // 优惠券ID
  deadlineTime: string | Dayjs // 订单截止时间
  startTime: string | Dayjs // 订单开始执行时间
  startTimeForCustomer: string | Dayjs // 订单开始执行时间(用户确认开始服务时间)
  completeTime: string | Dayjs // 接单人完成时间(状态变为3时记录)
  completeVoucher: string // 结单凭证
  confirmTime: string | Dayjs // 用户确认完成时间(状态变为4时记录)
  expireTime?: string | Dayjs // 订单过期时间(支付)
  payStatus?: number // 支付状态：0-未支付 1-已支付 2-已退款
  payTime: string | Dayjs // 支付时间
  payChannelCode: string // 支付渠道编码
  payOrderId: number // 支付订单ID
  cancelReason: string // 取消原因
  cancelTime: string | Dayjs // 取消时间
  cancelUserId: number // 取消操作人ID
  refundStatus: number // 退款状态
  refundApplyReason: string // 退款申请原因
  refundApplyTime: string | Dayjs // 退款申请时间
  refundAuditStatus: number // 退款审核状态：0-待审核 1-审核通过 2-审核拒绝
  refundAuditReason: string // 退款审核原因(拒绝时填写)
  refundAuditTime: string | Dayjs // 退款审核时间
  refundAuditUserId: number // 退款审核人ID
  refundAmount: number // 退款金额，单位：分
  refundTime: string | Dayjs // 退款时间
  payRefundId: number // 退款订单ID
  complaintStatus: boolean // 投诉状态(0-未投诉,1-处理中,2-处理完成)
  gameRegion: string // 区服
  userPickLevel: string // 用户选择的陪玩等级(支持多选,多个以,号分割)
  transferChannelPackageInfo: string // 转账渠道包信息
  acceptorStatus: number // 接单状态：0-派单中, 1-已确认接单
  acceptConfirmTime: string | Dayjs // 确认接单时间
  captainId: number // 队长ID
}

// 用户陪玩订单 API
export const AccOrderApi = {
  // 查询用户陪玩订单分页
  getAccOrderPage: async (params: any) => {
    return await request.get({ url: `/gamer/acc-order/page`, params })
  },

  // 查询用户陪玩订单详情
  getAccOrder: async (id: number) => {
    return await request.get({ url: `/gamer/acc-order/get?id=${id}` })
  },

  // 新增用户陪玩订单
  createAccOrder: async (data: AccOrder) => {
    return await request.post({ url: `/gamer/acc-order/create`, data })
  },

  // 修改用户陪玩订单
  updateAccOrder: async (data: AccOrder) => {
    return await request.put({ url: `/gamer/acc-order/update`, data })
  },

  // 删除用户陪玩订单
  deleteAccOrder: async (id: number) => {
    return await request.delete({ url: `/gamer/acc-order/delete?id=${id}` })
  },

  /** 批量删除用户陪玩订单 */
  deleteAccOrderList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/acc-order/delete-list?ids=${ids.join(',')}` })
  },

  // 导出用户陪玩订单 Excel
  exportAccOrder: async (params) => {
    return await request.download({ url: `/gamer/acc-order/export-excel`, params })
  },

  // 审核退款
  auditRefund: async (data: { orderId: number, auditStatus: 1 | 2, auditReason?: string }) => {
    return await request.post({ url: `/gamer/acc-order/audit-refund`, data })
  },
}

/**
 * 指定接单人接受订单
 * @param {object} params 指定陪玩订单接单人的接受参数
 * @param {string} params.captchaVerification 验证码，验证码开启时，需要传递
 * @param {number} params.orderId 订单ID
 * @param {number} params.teamId 队伍ID（组队接单时必填）
 * @param {string} params.remark 备注信息
 * @param {number} params.userId 接单人的用户编号
 * @returns
 */
export function AccOrder_acceptOrder(data: any) {
  return request.post({ url: `/gamer/acc-order/accept-order`, data })
}

/**
 * 更新订单为已退款
 * @param {object} params PayRefundNotifyReqDTO
 * @param {string} params.merchantOrderId
 * @param {string} params.merchantRefundId
 * @param {number} params.payRefundId
 * @returns
 */
export function AccOrder_updateOrderRefunded(data: any) {
  return request.post({ url: `/gamer/acc-order/refund-order`, data })
}

/**
 * 取消接单
 * @param {object} params CancelAcceptOrderVO
 * @param {number} params.orderId 订单编号
 * @returns
 */
export function AccOrder_cancelAcceptOrder(data: any) {
  return request.post({ url: `/gamer/acc-order/cancel-accept-order`, data })
}

/**
 * 审核订单完成
 * @param {object} params RestoreOrderReqVO
 * @param {number} params.orderId 订单编号
 * @param {boolean} params.retoreToUnComplete 是否恢复到陪玩未完成状态
 * @returns
 */
export function AccOrder_auditOrderComplete(params: any) {
  return request.post({ url: `/gamer/acc-order/audit-order-complete`, data: params })
}

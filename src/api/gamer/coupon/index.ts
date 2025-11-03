import request from '@/config/axios'

/** 优惠券信息 */
export interface Coupon {
  id: number // 编号
  couponName?: string // 优惠券名称
  couponType?: number // 优惠券类型: 1-满减券, 2-折扣券, 3-无门槛券(即min_order_amount为0)
  couponAmount?: number // 优惠金额/折扣比例(折扣券为小数如0.9表示9折)
  couponMinOrderAmount: number // 最低订单金额要求(满多少可用)
  validityDays?: number // 有效天数(从领取开始计算)
  couponDesc: string // 优惠券描述
  /**
   * 是否可以前台领取
   */
  indexGet: boolean
  /**
   * 最大领取次数
   */
  maxIndexGet: number
}

// 优惠券 API
export const CouponApi = {
  // 查询优惠券分页
  getCouponPage: async (params: any) => {
    return await request.get({ url: `/gamer/coupon/page`, params })
  },

  // 查询优惠券详情
  getCoupon: async (id: number) => {
    return await request.get({ url: `/gamer/coupon/get?id=${id}` })
  },

  // 新增优惠券
  createCoupon: async (data: Coupon) => {
    return await request.post({ url: `/gamer/coupon/create`, data })
  },

  // 修改优惠券
  updateCoupon: async (data: Coupon) => {
    return await request.put({ url: `/gamer/coupon/update`, data })
  },

  // 删除优惠券
  deleteCoupon: async (id: number) => {
    return await request.delete({ url: `/gamer/coupon/delete?id=${id}` })
  },

  /** 批量删除优惠券 */
  deleteCouponList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/coupon/delete-list?ids=${ids.join(',')}` })
  },

  // 导出优惠券 Excel
  exportCoupon: async (params) => {
    return await request.download({ url: `/gamer/coupon/export-excel`, params })
  },
}

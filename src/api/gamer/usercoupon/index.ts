import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 用户优惠券信息 */
export interface UserCoupon {
          id: number; // 记录ID
          userId?: number; // 用户ID
          couponId?: number; // 优惠券ID
          couponCode?: string; // 优惠券唯一编码
          couponName?: string; // 优惠券名称(冗余存储，防止优惠券删除后无法显示)
          couponType?: number; // 优惠券类型: 1-满减券, 2-折扣券, 3-无门槛券(即min_order_amount为0)
          couponAmount?: number; // 优惠金额/折扣比例
          couponMinOrderAmount: number; // 最低订单金额要求
          status?: number; // 状态: 0-未使用, 1-已使用, 2-已过期
          receivedAt?: string | Dayjs; // 领取时间
          usedAt: string | Dayjs; // 使用时间
          bizId: number; // 业务ID
          validUntil?: string | Dayjs; // 有效期至(领取时间+有效天数)
  }

// 用户优惠券 API
export const UserCouponApi = {
  // 查询用户优惠券分页
  getUserCouponPage: async (params: any) => {
    return await request.get({ url: `/gamer/user-coupon/page`, params })
  },

  // 查询用户优惠券详情
  getUserCoupon: async (id: number) => {
    return await request.get({ url: `/gamer/user-coupon/get?id=` + id })
  },

  // 新增用户优惠券
  createUserCoupon: async (data: UserCoupon) => {
    return await request.post({ url: `/gamer/user-coupon/create`, data })
  },

  // 修改用户优惠券
  updateUserCoupon: async (data: UserCoupon) => {
    return await request.put({ url: `/gamer/user-coupon/update`, data })
  },

  // 删除用户优惠券
  deleteUserCoupon: async (id: number) => {
    return await request.delete({ url: `/gamer/user-coupon/delete?id=` + id })
  },

  /** 批量删除用户优惠券 */
  deleteUserCouponList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/user-coupon/delete-list?ids=${ids.join(',')}` })
  },

  // 导出用户优惠券 Excel
  exportUserCoupon: async (params) => {
    return await request.download({ url: `/gamer/user-coupon/export-excel`, params })
  }
}
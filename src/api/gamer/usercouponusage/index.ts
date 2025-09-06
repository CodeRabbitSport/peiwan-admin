import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 优惠券使用记录信息 */
export interface UserCouponUsage {
          id: number; // 记录ID
          userCouponId?: number; // 用户优惠券ID
          userId?: number; // 用户ID
          couponId?: number; // 优惠券ID
          couponName?: string; // 优惠券名称
          couponType?: number; // 优惠券类型
          couponAmount?: number; // 优惠金额/折扣比例
          couponMinOrderAmount: number; // 最低订单金额要求
          bizId?: number; // 业务ID
          bizAmount?: number; // 业务金额
          discountAmount?: number; // 优惠金额
          usedAt?: string | Dayjs; // 使用时间
  }

// 优惠券使用记录 API
export const UserCouponUsageApi = {
  // 查询优惠券使用记录分页
  getUserCouponUsagePage: async (params: any) => {
    return await request.get({ url: `/gamer/user-coupon-usage/page`, params })
  },

  // 查询优惠券使用记录详情
  getUserCouponUsage: async (id: number) => {
    return await request.get({ url: `/gamer/user-coupon-usage/get?id=` + id })
  },

  // 新增优惠券使用记录
  createUserCouponUsage: async (data: UserCouponUsage) => {
    return await request.post({ url: `/gamer/user-coupon-usage/create`, data })
  },

  // 修改优惠券使用记录
  updateUserCouponUsage: async (data: UserCouponUsage) => {
    return await request.put({ url: `/gamer/user-coupon-usage/update`, data })
  },

  // 删除优惠券使用记录
  deleteUserCouponUsage: async (id: number) => {
    return await request.delete({ url: `/gamer/user-coupon-usage/delete?id=` + id })
  },

  /** 批量删除优惠券使用记录 */
  deleteUserCouponUsageList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/user-coupon-usage/delete-list?ids=${ids.join(',')}` })
  },

  // 导出优惠券使用记录 Excel
  exportUserCouponUsage: async (params) => {
    return await request.download({ url: `/gamer/user-coupon-usage/export-excel`, params })
  }
}
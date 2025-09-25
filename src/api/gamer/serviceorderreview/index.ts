import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 订单评价信息 */
export interface ServiceOrderReview {
          id: number; // 主键ID
          orderId?: number; // 订单ID
          userId?: number; // 评价人ID
          acceptorId?: number; // 接单人ID
          star?: number; // 星级评分 1-5
          commentTag: string; // 标签
          commentContent: string; // 评价内容
  }

// 订单评价 API
export const ServiceOrderReviewApi = {
  // 查询订单评价分页
  getServiceOrderReviewPage: async (params: any) => {
    return await request.get({ url: `/gamer/service-order-review/page`, params })
  },

  // 查询订单评价详情
  getServiceOrderReview: async (id: number) => {
    return await request.get({ url: `/gamer/service-order-review/get?id=` + id })
  },

  // 新增订单评价
  createServiceOrderReview: async (data: ServiceOrderReview) => {
    return await request.post({ url: `/gamer/service-order-review/create`, data })
  },

  // 修改订单评价
  updateServiceOrderReview: async (data: ServiceOrderReview) => {
    return await request.put({ url: `/gamer/service-order-review/update`, data })
  },

  // 删除订单评价
  deleteServiceOrderReview: async (id: number) => {
    return await request.delete({ url: `/gamer/service-order-review/delete?id=` + id })
  },

  /** 批量删除订单评价 */
  deleteServiceOrderReviewList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/service-order-review/delete-list?ids=${ids.join(',')}` })
  },

  // 导出订单评价 Excel
  exportServiceOrderReview: async (params) => {
    return await request.download({ url: `/gamer/service-order-review/export-excel`, params })
  }
}
import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 陪玩订单评价信息 */
export interface AccOrderReview {
          id: number; // 主键ID
          orderId?: number; // 订单ID
          userId?: number; // 评价人ID
          acceptorId?: number; // 接单人ID
          star?: boolean; // 星级评分 1-5
          commentTag: string; // 标签
          commentContent: string; // 评价内容
  }

// 陪玩订单评价 API
export const AccOrderReviewApi = {
  // 查询陪玩订单评价分页
  getAccOrderReviewPage: async (params: any) => {
    return await request.get({ url: `/gamer/acc-order-review/page`, params })
  },

  // 查询陪玩订单评价详情
  getAccOrderReview: async (id: number) => {
    return await request.get({ url: `/gamer/acc-order-review/get?id=` + id })
  },

  // 新增陪玩订单评价
  createAccOrderReview: async (data: AccOrderReview) => {
    return await request.post({ url: `/gamer/acc-order-review/create`, data })
  },

  // 修改陪玩订单评价
  updateAccOrderReview: async (data: AccOrderReview) => {
    return await request.put({ url: `/gamer/acc-order-review/update`, data })
  },

  // 删除陪玩订单评价
  deleteAccOrderReview: async (id: number) => {
    return await request.delete({ url: `/gamer/acc-order-review/delete?id=` + id })
  },

  /** 批量删除陪玩订单评价 */
  deleteAccOrderReviewList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/acc-order-review/delete-list?ids=${ids.join(',')}` })
  },

  // 导出陪玩订单评价 Excel
  exportAccOrderReview: async (params) => {
    return await request.download({ url: `/gamer/acc-order-review/export-excel`, params })
  }
}
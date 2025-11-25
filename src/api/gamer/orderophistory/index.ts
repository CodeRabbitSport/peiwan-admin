import type { Dayjs } from 'dayjs'

import request from '@/config/axios'

/** 订单操作历史记录信息 */
export interface OrderOpHistory {
  id: number // 主键ID
  orderId?: number // 订单ID
  orderType?: number // 订单类型: 1=陪玩订单, 2=打手订单
  operateTime?: string | Dayjs // 操作时间
  operateContent?: string // 操作内容
  operatorId: number // 操作人ID
  operatorType: number // 操作人类型: 1=customer, 2=acceptor, 3=admin, 4=system
  operatorName: string // 操作人名称
}

// 订单操作历史记录 API
export const OrderOpHistoryApi = {
  // 查询订单操作历史记录分页
  getOrderOpHistoryPage: async (params: any) => {
    return await request.get({ url: `/gamer/order-op-history/page`, params })
  },

  getOrderOpHistoryList: async (params: any) => {
    return await request.get({ url: `/gamer/order-op-history/list`, params })
  },
  // 查询订单操作历史记录详情
  getOrderOpHistory: async (id: number) => {
    return await request.get({ url: `/gamer/order-op-history/get?id=${id}` })
  },

  // 新增订单操作历史记录
  createOrderOpHistory: async (data: OrderOpHistory) => {
    return await request.post({ url: `/gamer/order-op-history/create`, data })
  },

  // 修改订单操作历史记录
  updateOrderOpHistory: async (data: OrderOpHistory) => {
    return await request.put({ url: `/gamer/order-op-history/update`, data })
  },

  // 删除订单操作历史记录
  deleteOrderOpHistory: async (id: number) => {
    return await request.delete({ url: `/gamer/order-op-history/delete?id=${id}` })
  },

  /** 批量删除订单操作历史记录 */
  deleteOrderOpHistoryList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/order-op-history/delete-list?ids=${ids.join(',')}` })
  },

  // 导出订单操作历史记录 Excel
  exportOrderOpHistory: async (params) => {
    return await request.download({ url: `/gamer/order-op-history/export-excel`, params })
  },
}

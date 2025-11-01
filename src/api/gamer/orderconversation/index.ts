import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 服务订单会话信息 */
export interface OrderConversation {
          id: number; // 会话编号
          orderId?: number; // 订单ID
          customerId?: number; // 客户ID
          sellerId?: number; // 接单人ID
          lastMessageId: number; // 最新消息ID
          lastMessageAt: string | Dayjs; // 最新消息时间
  }

// 服务订单会话 API
export const OrderConversationApi = {
  // 查询服务订单会话分页
  getOrderConversationPage: async (params: any) => {
    return await request.get({ url: `/gamer/order-conversation/page`, params })
  },

  // 查询服务订单会话详情
  getOrderConversation: async (id: number) => {
    return await request.get({ url: `/gamer/order-conversation/get?id=` + id })
  },

  // 新增服务订单会话
  createOrderConversation: async (data: OrderConversation) => {
    return await request.post({ url: `/gamer/order-conversation/create`, data })
  },

  // 修改服务订单会话
  updateOrderConversation: async (data: OrderConversation) => {
    return await request.put({ url: `/gamer/order-conversation/update`, data })
  },

  // 删除服务订单会话
  deleteOrderConversation: async (id: number) => {
    return await request.delete({ url: `/gamer/order-conversation/delete?id=` + id })
  },

  /** 批量删除服务订单会话 */
  deleteOrderConversationList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/order-conversation/delete-list?ids=${ids.join(',')}` })
  },

  // 导出服务订单会话 Excel
  exportOrderConversation: async (params) => {
    return await request.download({ url: `/gamer/order-conversation/export-excel`, params })
  }
}
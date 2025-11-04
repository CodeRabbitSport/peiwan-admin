import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 陪玩订单会话信息 */
export interface AccOrderConversation {
          id: number; // 会话编号
          orderId?: number; // 订单ID
          customerId?: number; // 客户ID
          sellerId?: number; // 接单人ID
          lastMessageId: number; // 最新消息ID
          lastMessageAt: string | Dayjs; // 最新消息时间
  }

// 陪玩订单会话 API
export const AccOrderConversationApi = {
  // 查询陪玩订单会话分页
  getAccOrderConversationPage: async (params: any) => {
    return await request.get({ url: `/gamer/acc-order-conversation/page`, params })
  },

  // 查询陪玩订单会话详情
  getAccOrderConversation: async (id: number) => {
    return await request.get({ url: `/gamer/acc-order-conversation/get?id=` + id })
  },

  // 新增陪玩订单会话
  createAccOrderConversation: async (data: AccOrderConversation) => {
    return await request.post({ url: `/gamer/acc-order-conversation/create`, data })
  },

  // 修改陪玩订单会话
  updateAccOrderConversation: async (data: AccOrderConversation) => {
    return await request.put({ url: `/gamer/acc-order-conversation/update`, data })
  },

  // 删除陪玩订单会话
  deleteAccOrderConversation: async (id: number) => {
    return await request.delete({ url: `/gamer/acc-order-conversation/delete?id=` + id })
  },

  /** 批量删除陪玩订单会话 */
  deleteAccOrderConversationList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/acc-order-conversation/delete-list?ids=${ids.join(',')}` })
  },

  // 导出陪玩订单会话 Excel
  exportAccOrderConversation: async (params) => {
    return await request.download({ url: `/gamer/acc-order-conversation/export-excel`, params })
  }
}
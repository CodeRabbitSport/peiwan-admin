import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 私聊会话信息 */
export interface Conversation {
          id: number; // 会话编号
          user1Id?: number; // 用户ID1(入库原则:必须比user2_id小)
          user2Id?: number; // 用户ID2(入库原则:必须比user1_id大)
          lastMessageId: number; // 最新消息ID
          lastMessageAt: string | Dayjs; // 最新消息时间
  }

// 私聊会话 API
export const ConversationApi = {
  // 查询私聊会话分页
  getConversationPage: async (params: any) => {
    return await request.get({ url: `/gamer/conversation/page`, params })
  },

  // 查询私聊会话详情
  getConversation: async (id: number) => {
    return await request.get({ url: `/gamer/conversation/get?id=` + id })
  },

  // 新增私聊会话
  createConversation: async (data: Conversation) => {
    return await request.post({ url: `/gamer/conversation/create`, data })
  },

  // 修改私聊会话
  updateConversation: async (data: Conversation) => {
    return await request.put({ url: `/gamer/conversation/update`, data })
  },

  // 删除私聊会话
  deleteConversation: async (id: number) => {
    return await request.delete({ url: `/gamer/conversation/delete?id=` + id })
  },

  /** 批量删除私聊会话 */
  deleteConversationList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/conversation/delete-list?ids=${ids.join(',')}` })
  },

  // 导出私聊会话 Excel
  exportConversation: async (params) => {
    return await request.download({ url: `/gamer/conversation/export-excel`, params })
  }
}
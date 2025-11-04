import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 陪玩订单会话消息信息 */
export interface AccOrderConversationMessage {
          id: number; // 消息ID
          orderId?: number; // 订单ID
          conversationId?: number; // 会话ID
          senderId?: number; // 发送人ID
          senderType?: number; // 1=customer, 2=seller, 3=admin, 4=system
          messageType?: number; // 1=text, 2=image, 3=file, 4=audio, 5=video
          messageContent: string; // 消息内容
          fileUrl: string; // 附件链接
          fileName: string; // 原始文件名
          fileSize: number; // 文件大小(字节)
          mimeType: string; // 文件MIME类型
          isRead: boolean; // 是否已读
          readAt: string | Dayjs; // 已读时间
  }

// 陪玩订单会话消息 API
export const AccOrderConversationMessageApi = {
  // 查询陪玩订单会话消息分页
  getAccOrderConversationMessagePage: async (params: any) => {
    return await request.get({ url: `/gamer/acc-order-conversation-message/page`, params })
  },

  // 查询陪玩订单会话消息详情
  getAccOrderConversationMessage: async (id: number) => {
    return await request.get({ url: `/gamer/acc-order-conversation-message/get?id=` + id })
  },

  // 新增陪玩订单会话消息
  createAccOrderConversationMessage: async (data: AccOrderConversationMessage) => {
    return await request.post({ url: `/gamer/acc-order-conversation-message/create`, data })
  },

  // 修改陪玩订单会话消息
  updateAccOrderConversationMessage: async (data: AccOrderConversationMessage) => {
    return await request.put({ url: `/gamer/acc-order-conversation-message/update`, data })
  },

  // 删除陪玩订单会话消息
  deleteAccOrderConversationMessage: async (id: number) => {
    return await request.delete({ url: `/gamer/acc-order-conversation-message/delete?id=` + id })
  },

  /** 批量删除陪玩订单会话消息 */
  deleteAccOrderConversationMessageList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/acc-order-conversation-message/delete-list?ids=${ids.join(',')}` })
  },

  // 导出陪玩订单会话消息 Excel
  exportAccOrderConversationMessage: async (params) => {
    return await request.download({ url: `/gamer/acc-order-conversation-message/export-excel`, params })
  }
}
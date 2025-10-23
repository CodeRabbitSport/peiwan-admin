import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 会话消息信息 */
export interface ConversationMessage {
          id: number; // 消息ID
          conversationId?: number; // 会话ID
          senderId?: number; // 发送人ID
          senderType?: number; // 发送人类型(1-系统,2-用户)
          messageType?: number; // 1=text, 2=image, 3=file, 4=audio, 5=video
          messageContent: string; // 消息内容
          fileUrl: string; // 附件链接
          fileName: string; // 原始文件名
          fileSize: number; // 文件大小(字节)
          mimeType: string; // 文件MIME类型
          isRead: boolean; // 是否已读
          readAt: string | Dayjs; // 已读时间
  }

// 会话消息 API
export const ConversationMessageApi = {
  // 查询会话消息分页
  getConversationMessagePage: async (params: any) => {
    return await request.get({ url: `/gamer/conversation-message/page`, params })
  },

  // 查询会话消息详情
  getConversationMessage: async (id: number) => {
    return await request.get({ url: `/gamer/conversation-message/get?id=` + id })
  },

  // 新增会话消息
  createConversationMessage: async (data: ConversationMessage) => {
    return await request.post({ url: `/gamer/conversation-message/create`, data })
  },

  // 修改会话消息
  updateConversationMessage: async (data: ConversationMessage) => {
    return await request.put({ url: `/gamer/conversation-message/update`, data })
  },

  // 删除会话消息
  deleteConversationMessage: async (id: number) => {
    return await request.delete({ url: `/gamer/conversation-message/delete?id=` + id })
  },

  /** 批量删除会话消息 */
  deleteConversationMessageList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/conversation-message/delete-list?ids=${ids.join(',')}` })
  },

  // 导出会话消息 Excel
  exportConversationMessage: async (params) => {
    return await request.download({ url: `/gamer/conversation-message/export-excel`, params })
  }
}
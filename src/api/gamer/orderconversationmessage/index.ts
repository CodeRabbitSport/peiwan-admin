import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 服务订单会话消息信息 */
export interface OrderConversationMessage {
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
  }

// 服务订单会话消息 API
export const OrderConversationMessageApi = {
  // 查询服务订单会话消息分页
  getOrderConversationMessagePage: async (params: any) => {
    return await request.get({ url: `/gamer/order-conversation-message/page`, params })
  },

  // 查询服务订单会话消息详情
  getOrderConversationMessage: async (id: number) => {
    return await request.get({ url: `/gamer/order-conversation-message/get?id=` + id })
  },

  // 新增服务订单会话消息
  createOrderConversationMessage: async (data: OrderConversationMessage) => {
    return await request.post({ url: `/gamer/order-conversation-message/create`, data })
  },

  // 修改服务订单会话消息
  updateOrderConversationMessage: async (data: OrderConversationMessage) => {
    return await request.put({ url: `/gamer/order-conversation-message/update`, data })
  },

  // 删除服务订单会话消息
  deleteOrderConversationMessage: async (id: number) => {
    return await request.delete({ url: `/gamer/order-conversation-message/delete?id=` + id })
  },

  /** 批量删除服务订单会话消息 */
  deleteOrderConversationMessageList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/order-conversation-message/delete-list?ids=${ids.join(',')}` })
  },

  // 导出服务订单会话消息 Excel
  exportOrderConversationMessage: async (params) => {
    return await request.download({ url: `/gamer/order-conversation-message/export-excel`, params })
  }
}
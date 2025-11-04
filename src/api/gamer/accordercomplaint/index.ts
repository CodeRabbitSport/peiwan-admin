import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 陪玩订单投诉内容信息 */
export interface AccOrderComplaint {
          id: number; // 主键
          orderId?: number; // 订单ID
          userId: number; // 用户ID
          userType?: number; // 用户类型(1-会员,2-管理员)
          content: string; // 回复内容
          images: string; // 图片列表
  }

// 陪玩订单投诉内容 API
export const AccOrderComplaintApi = {
  // 查询陪玩订单投诉内容分页
  getAccOrderComplaintPage: async (params: any) => {
    return await request.get({ url: `/gamer/acc-order-complaint/page`, params })
  },

  // 查询陪玩订单投诉内容详情
  getAccOrderComplaint: async (id: number) => {
    return await request.get({ url: `/gamer/acc-order-complaint/get?id=` + id })
  },

  // 新增陪玩订单投诉内容
  createAccOrderComplaint: async (data: AccOrderComplaint) => {
    return await request.post({ url: `/gamer/acc-order-complaint/create`, data })
  },

  // 修改陪玩订单投诉内容
  updateAccOrderComplaint: async (data: AccOrderComplaint) => {
    return await request.put({ url: `/gamer/acc-order-complaint/update`, data })
  },

  // 删除陪玩订单投诉内容
  deleteAccOrderComplaint: async (id: number) => {
    return await request.delete({ url: `/gamer/acc-order-complaint/delete?id=` + id })
  },

  /** 批量删除陪玩订单投诉内容 */
  deleteAccOrderComplaintList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/acc-order-complaint/delete-list?ids=${ids.join(',')}` })
  },

  // 导出陪玩订单投诉内容 Excel
  exportAccOrderComplaint: async (params) => {
    return await request.download({ url: `/gamer/acc-order-complaint/export-excel`, params })
  }
}
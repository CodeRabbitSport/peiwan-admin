import request from '@/config/axios'

/** 订单投诉内容信息 */
export interface ServiceOrderComplaint {
  id: number // 主键
  orderId?: number // 订单ID
  userId: number // 用户ID
  userType?: boolean // 用户类型(1-会员,2-管理员)
  content: string // 回复内容
  images: string // 图片列表
}

// 订单投诉内容 API
export const ServiceOrderComplaintApi = {
  // 查询订单投诉内容分页
  getServiceOrderComplaintPage: async (params: any) => {
    return await request.get({ url: `/gamer/service-order-complaint/page`, params })
  },

  // 查询订单投诉内容详情
  getServiceOrderComplaint: async (id: number) => {
    return await request.get({ url: `/gamer/service-order-complaint/get?id=${id}` })
  },

  // 新增订单投诉内容
  createServiceOrderComplaint: async (data: ServiceOrderComplaint) => {
    return await request.post({ url: `/gamer/service-order-complaint/create`, data })
  },
  // 新增订单投诉内容
  ServiceOrderComplaint_completeComplaint: async (data: ServiceOrderComplaint) => {
    return await request.post({ url: `/gamer/service-order-complaint/complete`, data })
  },

  // 修改订单投诉内容
  updateServiceOrderComplaint: async (data: ServiceOrderComplaint) => {
    return await request.put({ url: `/gamer/service-order-complaint/update`, data })
  },

  // 删除订单投诉内容
  deleteServiceOrderComplaint: async (id: number) => {
    return await request.delete({ url: `/gamer/service-order-complaint/delete?id=${id}` })
  },

  /** 批量删除订单投诉内容 */
  deleteServiceOrderComplaintList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/service-order-complaint/delete-list?ids=${ids.join(',')}` })
  },

  // 导出订单投诉内容 Excel
  exportServiceOrderComplaint: async (params) => {
    return await request.download({ url: `/gamer/service-order-complaint/export-excel`, params })
  },
}

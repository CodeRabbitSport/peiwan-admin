import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 用户订单接单人信息 */
export interface ServiceOrderAcceptor {
          id: number; // 编号
          orderId?: number; // 订单ID
          acceptorId?: number; // 接单人用户ID
          acceptorType?: number; // 接单类型：1-个人接单, 2-组队接单
          acceptorStatus: number; // 接单状态：1-抢单中, 2-已确认接单, 3-已取消接单
          isLeader: boolean; // 是否是队长
          teamId: number; // 队伍ID
          tempTeamId: string; // 临时队伍ID
          teamName: string; // 队伍名称
          grabTime?: string | Dayjs; // 抢单时间
          confirmTime: string | Dayjs; // 确认接单时间
          acceptorAmount: number; // 该接单人应得金额(分)
          shareRatio: number; // 分成比例
          cancelTime: string | Dayjs; // 取消接单时间
          cancelReason: string; // 取消接单原因
          remark: string; // 备注
  }

// 用户订单接单人 API
export const ServiceOrderAcceptorApi = {
  // 查询用户订单接单人分页
  getServiceOrderAcceptorPage: async (params: any) => {
    return await request.get({ url: `/gamer/service-order-acceptor/page`, params })
  },

  // 查询用户订单接单人详情
  getServiceOrderAcceptor: async (id: number) => {
    return await request.get({ url: `/gamer/service-order-acceptor/get?id=` + id })
  },

  // 新增用户订单接单人
  createServiceOrderAcceptor: async (data: ServiceOrderAcceptor) => {
    return await request.post({ url: `/gamer/service-order-acceptor/create`, data })
  },

  // 修改用户订单接单人
  updateServiceOrderAcceptor: async (data: ServiceOrderAcceptor) => {
    return await request.put({ url: `/gamer/service-order-acceptor/update`, data })
  },

  // 删除用户订单接单人
  deleteServiceOrderAcceptor: async (id: number) => {
    return await request.delete({ url: `/gamer/service-order-acceptor/delete?id=` + id })
  },

  /** 批量删除用户订单接单人 */
  deleteServiceOrderAcceptorList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/service-order-acceptor/delete-list?ids=${ids.join(',')}` })
  },

  // 导出用户订单接单人 Excel
  exportServiceOrderAcceptor: async (params) => {
    return await request.download({ url: `/gamer/service-order-acceptor/export-excel`, params })
  }
}
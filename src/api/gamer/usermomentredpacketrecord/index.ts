import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 用户动态红包领取记录信息 */
export interface UserMomentRedPacketRecord {
          id: number; // 领取记录ID
          momentId?: number; // 动态ID
          userId?: number; // 领取用户
          amount?: number; // 领取金额
  }

// 用户动态红包领取记录 API
export const UserMomentRedPacketRecordApi = {
  // 查询用户动态红包领取记录分页
  getUserMomentRedPacketRecordPage: async (params: any) => {
    return await request.get({ url: `/gamer/user-moment-red-packet-record/page`, params })
  },

  // 查询用户动态红包领取记录详情
  getUserMomentRedPacketRecord: async (id: number) => {
    return await request.get({ url: `/gamer/user-moment-red-packet-record/get?id=` + id })
  },

  // 新增用户动态红包领取记录
  createUserMomentRedPacketRecord: async (data: UserMomentRedPacketRecord) => {
    return await request.post({ url: `/gamer/user-moment-red-packet-record/create`, data })
  },

  // 修改用户动态红包领取记录
  updateUserMomentRedPacketRecord: async (data: UserMomentRedPacketRecord) => {
    return await request.put({ url: `/gamer/user-moment-red-packet-record/update`, data })
  },

  // 删除用户动态红包领取记录
  deleteUserMomentRedPacketRecord: async (id: number) => {
    return await request.delete({ url: `/gamer/user-moment-red-packet-record/delete?id=` + id })
  },

  /** 批量删除用户动态红包领取记录 */
  deleteUserMomentRedPacketRecordList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/user-moment-red-packet-record/delete-list?ids=${ids.join(',')}` })
  },

  // 导出用户动态红包领取记录 Excel
  exportUserMomentRedPacketRecord: async (params) => {
    return await request.download({ url: `/gamer/user-moment-red-packet-record/export-excel`, params })
  }
}
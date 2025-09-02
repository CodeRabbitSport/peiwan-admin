import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 用户动态红包信息 */
export interface UserMomentRedPacket {
          id: number; // 主键ID
          momentId?: number; // 动态ID
          amount?: number; // 红包总金额
          totalCount?: number; // 红包个数
          packetType: number; // 红包类型: 1=普通,2=拼手气
          message: string; // 祝福语
          expireTime: string | Dayjs; // 过期时间
  }

// 用户动态红包 API
export const UserMomentRedPacketApi = {
  // 查询用户动态红包分页
  getUserMomentRedPacketPage: async (params: any) => {
    return await request.get({ url: `/gamer/user-moment-red-packet/page`, params })
  },

  // 查询用户动态红包详情
  getUserMomentRedPacket: async (id: number) => {
    return await request.get({ url: `/gamer/user-moment-red-packet/get?id=` + id })
  },

  // 新增用户动态红包
  createUserMomentRedPacket: async (data: UserMomentRedPacket) => {
    return await request.post({ url: `/gamer/user-moment-red-packet/create`, data })
  },

  // 修改用户动态红包
  updateUserMomentRedPacket: async (data: UserMomentRedPacket) => {
    return await request.put({ url: `/gamer/user-moment-red-packet/update`, data })
  },

  // 删除用户动态红包
  deleteUserMomentRedPacket: async (id: number) => {
    return await request.delete({ url: `/gamer/user-moment-red-packet/delete?id=` + id })
  },

  /** 批量删除用户动态红包 */
  deleteUserMomentRedPacketList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/user-moment-red-packet/delete-list?ids=${ids.join(',')}` })
  },

  // 导出用户动态红包 Excel
  exportUserMomentRedPacket: async (params) => {
    return await request.download({ url: `/gamer/user-moment-red-packet/export-excel`, params })
  }
}
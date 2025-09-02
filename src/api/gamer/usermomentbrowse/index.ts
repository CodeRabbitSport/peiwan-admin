import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 用户动态浏览记录信息 */
export interface UserMomentBrowse {
          id: number; // 浏览ID
          momentId?: number; // 动态ID
          userId?: number; // 浏览用户ID
  }

// 用户动态浏览记录 API
export const UserMomentBrowseApi = {
  // 查询用户动态浏览记录分页
  getUserMomentBrowsePage: async (params: any) => {
    return await request.get({ url: `/gamer/user-moment-browse/page`, params })
  },

  // 查询用户动态浏览记录详情
  getUserMomentBrowse: async (id: number) => {
    return await request.get({ url: `/gamer/user-moment-browse/get?id=` + id })
  },

  // 新增用户动态浏览记录
  createUserMomentBrowse: async (data: UserMomentBrowse) => {
    return await request.post({ url: `/gamer/user-moment-browse/create`, data })
  },

  // 修改用户动态浏览记录
  updateUserMomentBrowse: async (data: UserMomentBrowse) => {
    return await request.put({ url: `/gamer/user-moment-browse/update`, data })
  },

  // 删除用户动态浏览记录
  deleteUserMomentBrowse: async (id: number) => {
    return await request.delete({ url: `/gamer/user-moment-browse/delete?id=` + id })
  },

  /** 批量删除用户动态浏览记录 */
  deleteUserMomentBrowseList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/user-moment-browse/delete-list?ids=${ids.join(',')}` })
  },

  // 导出用户动态浏览记录 Excel
  exportUserMomentBrowse: async (params) => {
    return await request.download({ url: `/gamer/user-moment-browse/export-excel`, params })
  }
}
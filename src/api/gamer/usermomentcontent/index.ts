import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 用户动态内容信息 */
export interface UserMomentContent {
          id: number; // 主键ID
          momentId?: number; // 动态ID
          content: string; // 文字内容
          images: string; // 图片数组 JSON字符串
  }

// 用户动态内容 API
export const UserMomentContentApi = {
  // 查询用户动态内容分页
  getUserMomentContentPage: async (params: any) => {
    return await request.get({ url: `/gamer/user-moment-content/page`, params })
  },

  // 查询用户动态内容详情
  getUserMomentContent: async (id: number) => {
    return await request.get({ url: `/gamer/user-moment-content/get?id=` + id })
  },

  // 新增用户动态内容
  createUserMomentContent: async (data: UserMomentContent) => {
    return await request.post({ url: `/gamer/user-moment-content/create`, data })
  },

  // 修改用户动态内容
  updateUserMomentContent: async (data: UserMomentContent) => {
    return await request.put({ url: `/gamer/user-moment-content/update`, data })
  },

  // 删除用户动态内容
  deleteUserMomentContent: async (id: number) => {
    return await request.delete({ url: `/gamer/user-moment-content/delete?id=` + id })
  },

  /** 批量删除用户动态内容 */
  deleteUserMomentContentList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/user-moment-content/delete-list?ids=${ids.join(',')}` })
  },

  // 导出用户动态内容 Excel
  exportUserMomentContent: async (params) => {
    return await request.download({ url: `/gamer/user-moment-content/export-excel`, params })
  }
}
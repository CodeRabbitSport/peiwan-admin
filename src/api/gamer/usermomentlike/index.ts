import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 用户动态点赞记录信息 */
export interface UserMomentLike {
          id: number; // 点赞ID
          momentId?: number; // 动态ID
          userId?: number; // 点赞用户ID
  }

// 用户动态点赞记录 API
export const UserMomentLikeApi = {
  // 查询用户动态点赞记录分页
  getUserMomentLikePage: async (params: any) => {
    return await request.get({ url: `/gamer/user-moment-like/page`, params })
  },

  // 查询用户动态点赞记录详情
  getUserMomentLike: async (id: number) => {
    return await request.get({ url: `/gamer/user-moment-like/get?id=` + id })
  },

  // 新增用户动态点赞记录
  createUserMomentLike: async (data: UserMomentLike) => {
    return await request.post({ url: `/gamer/user-moment-like/create`, data })
  },

  // 修改用户动态点赞记录
  updateUserMomentLike: async (data: UserMomentLike) => {
    return await request.put({ url: `/gamer/user-moment-like/update`, data })
  },

  // 删除用户动态点赞记录
  deleteUserMomentLike: async (id: number) => {
    return await request.delete({ url: `/gamer/user-moment-like/delete?id=` + id })
  },

  /** 批量删除用户动态点赞记录 */
  deleteUserMomentLikeList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/user-moment-like/delete-list?ids=${ids.join(',')}` })
  },

  // 导出用户动态点赞记录 Excel
  exportUserMomentLike: async (params) => {
    return await request.download({ url: `/gamer/user-moment-like/export-excel`, params })
  }
}
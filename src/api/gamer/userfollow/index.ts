import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 用户关注关系信息 */
export interface UserFollow {
          id: number; // 主键ID
          followerId?: number; // 关注者ID
          followedId?: number; // 被关注者ID
  }

// 用户关注关系 API
export const UserFollowApi = {
  // 查询用户关注关系分页
  getUserFollowPage: async (params: any) => {
    return await request.get({ url: `/gamer/user-follow/page`, params })
  },

  // 查询用户关注关系详情
  getUserFollow: async (id: number) => {
    return await request.get({ url: `/gamer/user-follow/get?id=` + id })
  },

  // 新增用户关注关系
  createUserFollow: async (data: UserFollow) => {
    return await request.post({ url: `/gamer/user-follow/create`, data })
  },

  // 修改用户关注关系
  updateUserFollow: async (data: UserFollow) => {
    return await request.put({ url: `/gamer/user-follow/update`, data })
  },

  // 删除用户关注关系
  deleteUserFollow: async (id: number) => {
    return await request.delete({ url: `/gamer/user-follow/delete?id=` + id })
  },

  /** 批量删除用户关注关系 */
  deleteUserFollowList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/user-follow/delete-list?ids=${ids.join(',')}` })
  },

  // 导出用户关注关系 Excel
  exportUserFollow: async (params) => {
    return await request.download({ url: `/gamer/user-follow/export-excel`, params })
  }
}
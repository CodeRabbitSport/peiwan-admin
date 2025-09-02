import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 用户动态评论信息 */
export interface UserMomentComment {
          id: number; // 评论ID
          momentId?: number; // 动态ID
          userId?: number; // 评论用户ID
          content?: string; // 评论内容
          parentId: number; // 父评论ID
          location: string; // 发布地点
          publishIp: string; // 发布IP
  }

// 用户动态评论 API
export const UserMomentCommentApi = {
  // 查询用户动态评论分页
  getUserMomentCommentPage: async (params: any) => {
    return await request.get({ url: `/gamer/user-moment-comment/page`, params })
  },

  // 查询用户动态评论详情
  getUserMomentComment: async (id: number) => {
    return await request.get({ url: `/gamer/user-moment-comment/get?id=` + id })
  },

  // 新增用户动态评论
  createUserMomentComment: async (data: UserMomentComment) => {
    return await request.post({ url: `/gamer/user-moment-comment/create`, data })
  },

  // 修改用户动态评论
  updateUserMomentComment: async (data: UserMomentComment) => {
    return await request.put({ url: `/gamer/user-moment-comment/update`, data })
  },

  // 删除用户动态评论
  deleteUserMomentComment: async (id: number) => {
    return await request.delete({ url: `/gamer/user-moment-comment/delete?id=` + id })
  },

  /** 批量删除用户动态评论 */
  deleteUserMomentCommentList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/user-moment-comment/delete-list?ids=${ids.join(',')}` })
  },

  // 导出用户动态评论 Excel
  exportUserMomentComment: async (params) => {
    return await request.download({ url: `/gamer/user-moment-comment/export-excel`, params })
  }
}
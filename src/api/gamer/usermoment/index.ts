import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 用户动态信息 */
export interface UserMoment {
          id: number; // 动态ID
          userId?: number; // 发布用户ID
          momentType?: number; // 动态类型: 1=文字/图片,2=语音,3=投票,4=红包
          topic: string; // 话题(多个使用#分割)
          location: string; // 发布地点
          publishIp: string; // 发布IP
          priority: number; // 优先级: 0=普通,1=置顶
          priorityExpireTime: string | Dayjs; // 优先级过期时间
          lastRefreshTime: string | Dayjs; // 最后刷新时间
          likeCount: number; // 点赞数
          browseCount: number; // 浏览数
          commentCount: number; // 评论数
          shareCount: number; // 分享数
          status: number; // 状态: 0=待审核,1=审核通过,2=审核不通过
          auditTime: string | Dayjs; // 审核时间
          auditReason: string; // 拒绝原因
  }

// 用户动态 API
export const UserMomentApi = {
  // 查询用户动态分页
  getUserMomentPage: async (params: any) => {
    return await request.get({ url: `/gamer/user-moment/page`, params })
  },

  // 查询用户动态详情
  getUserMoment: async (id: number) => {
    return await request.get({ url: `/gamer/user-moment/get?id=` + id })
  },

  // 新增用户动态
  createUserMoment: async (data: UserMoment) => {
    return await request.post({ url: `/gamer/user-moment/create`, data })
  },

  // 修改用户动态
  updateUserMoment: async (data: UserMoment) => {
    return await request.put({ url: `/gamer/user-moment/update`, data })
  },

  // 删除用户动态
  deleteUserMoment: async (id: number) => {
    return await request.delete({ url: `/gamer/user-moment/delete?id=` + id })
  },

  /** 批量删除用户动态 */
  deleteUserMomentList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/user-moment/delete-list?ids=${ids.join(',')}` })
  },

  // 导出用户动态 Excel
  exportUserMoment: async (params) => {
    return await request.download({ url: `/gamer/user-moment/export-excel`, params })
  }
}
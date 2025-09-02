import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 用户投票信息 */
export interface UserMomentVote {
          id: number; // 主键ID
          momentId?: number; // 动态ID
          question?: string; // 投票问题
          multiple: number; // 是否多选: 0=单选,1=多选
          deadline: string | Dayjs; // 截止时间
  }

// 用户投票 API
export const UserMomentVoteApi = {
  // 查询用户投票分页
  getUserMomentVotePage: async (params: any) => {
    return await request.get({ url: `/gamer/user-moment-vote/page`, params })
  },

  // 查询用户投票详情
  getUserMomentVote: async (id: number) => {
    return await request.get({ url: `/gamer/user-moment-vote/get?id=` + id })
  },

  // 新增用户投票
  createUserMomentVote: async (data: UserMomentVote) => {
    return await request.post({ url: `/gamer/user-moment-vote/create`, data })
  },

  // 修改用户投票
  updateUserMomentVote: async (data: UserMomentVote) => {
    return await request.put({ url: `/gamer/user-moment-vote/update`, data })
  },

  // 删除用户投票
  deleteUserMomentVote: async (id: number) => {
    return await request.delete({ url: `/gamer/user-moment-vote/delete?id=` + id })
  },

  /** 批量删除用户投票 */
  deleteUserMomentVoteList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/user-moment-vote/delete-list?ids=${ids.join(',')}` })
  },

  // 导出用户投票 Excel
  exportUserMomentVote: async (params) => {
    return await request.download({ url: `/gamer/user-moment-vote/export-excel`, params })
  }
}
import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 用户投票选项信息 */
export interface UserMomentVoteOption {
          id: number; // 选项ID
          voteId?: number; // 投票ID
          momentId?: number; // 动态ID
          optionText?: string; // 选项内容
  }

// 用户投票选项 API
export const UserMomentVoteOptionApi = {
  // 查询用户投票选项分页
  getUserMomentVoteOptionPage: async (params: any) => {
    return await request.get({ url: `/gamer/user-moment-vote-option/page`, params })
  },

  // 查询用户投票选项详情
  getUserMomentVoteOption: async (id: number) => {
    return await request.get({ url: `/gamer/user-moment-vote-option/get?id=` + id })
  },

  // 新增用户投票选项
  createUserMomentVoteOption: async (data: UserMomentVoteOption) => {
    return await request.post({ url: `/gamer/user-moment-vote-option/create`, data })
  },

  // 修改用户投票选项
  updateUserMomentVoteOption: async (data: UserMomentVoteOption) => {
    return await request.put({ url: `/gamer/user-moment-vote-option/update`, data })
  },

  // 删除用户投票选项
  deleteUserMomentVoteOption: async (id: number) => {
    return await request.delete({ url: `/gamer/user-moment-vote-option/delete?id=` + id })
  },

  /** 批量删除用户投票选项 */
  deleteUserMomentVoteOptionList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/user-moment-vote-option/delete-list?ids=${ids.join(',')}` })
  },

  // 导出用户投票选项 Excel
  exportUserMomentVoteOption: async (params) => {
    return await request.download({ url: `/gamer/user-moment-vote-option/export-excel`, params })
  }
}
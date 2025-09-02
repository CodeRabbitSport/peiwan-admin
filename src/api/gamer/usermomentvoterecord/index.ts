import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 用户投票纪录信息 */
export interface UserMomentVoteRecord {
          id: number; // 投票记录ID
          momentId?: number; // 动态ID
          voteId?: number; // 投票ID
          optionId?: number; // 选项ID
          userId?: number; // 投票用户
  }

// 用户投票纪录 API
export const UserMomentVoteRecordApi = {
  // 查询用户投票纪录分页
  getUserMomentVoteRecordPage: async (params: any) => {
    return await request.get({ url: `/gamer/user-moment-vote-record/page`, params })
  },

  // 查询用户投票纪录详情
  getUserMomentVoteRecord: async (id: number) => {
    return await request.get({ url: `/gamer/user-moment-vote-record/get?id=` + id })
  },

  // 新增用户投票纪录
  createUserMomentVoteRecord: async (data: UserMomentVoteRecord) => {
    return await request.post({ url: `/gamer/user-moment-vote-record/create`, data })
  },

  // 修改用户投票纪录
  updateUserMomentVoteRecord: async (data: UserMomentVoteRecord) => {
    return await request.put({ url: `/gamer/user-moment-vote-record/update`, data })
  },

  // 删除用户投票纪录
  deleteUserMomentVoteRecord: async (id: number) => {
    return await request.delete({ url: `/gamer/user-moment-vote-record/delete?id=` + id })
  },

  /** 批量删除用户投票纪录 */
  deleteUserMomentVoteRecordList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/user-moment-vote-record/delete-list?ids=${ids.join(',')}` })
  },

  // 导出用户投票纪录 Excel
  exportUserMomentVoteRecord: async (params) => {
    return await request.download({ url: `/gamer/user-moment-vote-record/export-excel`, params })
  }
}
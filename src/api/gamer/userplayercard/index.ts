import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 用戶游戏名片信息 */
export interface UserPlayerCard {
          id: number; // 名片ID
          categoryId?: number; // 游戏分类ID
          userId?: number; // 用户ID
          cardInfo?: string; // 名片信息(JSON字符串)
  }

// 用戶游戏名片 API
export const UserPlayerCardApi = {
  // 查询用戶游戏名片分页
  getUserPlayerCardPage: async (params: any) => {
    return await request.get({ url: `/gamer/user-player-card/page`, params })
  },

  // 查询用戶游戏名片详情
  getUserPlayerCard: async (id: number) => {
    return await request.get({ url: `/gamer/user-player-card/get?id=` + id })
  },

  // 新增用戶游戏名片
  createUserPlayerCard: async (data: UserPlayerCard) => {
    return await request.post({ url: `/gamer/user-player-card/create`, data })
  },

  // 修改用戶游戏名片
  updateUserPlayerCard: async (data: UserPlayerCard) => {
    return await request.put({ url: `/gamer/user-player-card/update`, data })
  },

  // 删除用戶游戏名片
  deleteUserPlayerCard: async (id: number) => {
    return await request.delete({ url: `/gamer/user-player-card/delete?id=` + id })
  },

  /** 批量删除用戶游戏名片 */
  deleteUserPlayerCardList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/user-player-card/delete-list?ids=${ids.join(',')}` })
  },

  // 导出用戶游戏名片 Excel
  exportUserPlayerCard: async (params) => {
    return await request.download({ url: `/gamer/user-player-card/export-excel`, params })
  }
}
import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 奖品配置信息 */
export interface Prize {
          id: number; // 主键
          groupId?: number; // 分组ID
          prizeTitle: string; // 奖品标题
          prizeRate: number; // 概率
          prizeDesc: string; // 描述
          prizeCover: string; // 封面图
  }

// 奖品配置 API
export const PrizeApi = {
  // 查询奖品配置分页
  getPrizePage: async (params?: any) => {
    return await request.get({ url: `/gamer/prize/page`, params })
  },

  // 查询奖品配置详情
  getPrize: async (id: number) => {
    return await request.get({ url: `/gamer/prize/get?id=` + id })
  },

  // 新增奖品配置
  createPrize: async (data: Prize) => {
    return await request.post({ url: `/gamer/prize/create`, data })
  },

  // 修改奖品配置
  updatePrize: async (data: Prize) => {
    return await request.put({ url: `/gamer/prize/update`, data })
  },

  // 删除奖品配置
  deletePrize: async (id: number) => {
    return await request.delete({ url: `/gamer/prize/delete?id=` + id })
  },

  /** 批量删除奖品配置 */
  deletePrizeList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/prize/delete-list?ids=${ids.join(',')}` })
  },

  // 导出奖品配置 Excel
  exportPrize: async (params) => {
    return await request.download({ url: `/gamer/prize/export-excel`, params })
  }
}
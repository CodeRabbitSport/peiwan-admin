import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 奖品分组信息 */
export interface PrizeGroup {
  id: number; // 主键
  groupTitle: string; // 分组名称
}

// 奖品分组 API
export const PrizeGroupApi = {
  // 查询奖品分组分页
  getPrizeGroupPage: async (params?: any) => {
    return await request.get({ url: `/gamer/prize-group/page`, params })
  },

  // 查询奖品分组详情
  getPrizeGroup: async (id: number) => {
    return await request.get({ url: `/gamer/prize-group/get?id=` + id })
  },

  // 新增奖品分组
  createPrizeGroup: async (data: PrizeGroup) => {
    return await request.post({ url: `/gamer/prize-group/create`, data })

  },

  // 修改奖品分组
  updatePrizeGroup: async (data: PrizeGroup) => {
    return await request.put({ url: `/gamer/prize-group/update`, data })
  },

  // 删除奖品分组
  deletePrizeGroup: async (id: number) => {
    return await request.delete({ url: `/gamer/prize-group/delete?id=` + id })
  },

  /** 批量删除奖品分组 */
  deletePrizeGroupList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/prize-group/delete-list?ids=${ids.join(',')}` })
  },

  // 导出奖品分组 Excel
  exportPrizeGroup: async (params) => {
    return await request.download({ url: `/gamer/prize-group/export-excel`, params })
  }
}

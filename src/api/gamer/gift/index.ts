import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 礼物信息 */
export interface Gift {
          id: number; // 礼物ID
          giftName?: string; // 礼物名称
          giftImage: string; // 礼物图片URL
          giftRate?: number; // 平台抽成比例
          price?: number; // 礼物价格(分)
          status: boolean; // 状态:1启用,0禁用
  }

// 礼物 API
export const GiftApi = {
  // 查询礼物分页
  getGiftPage: async (params: any) => {
    return await request.get({ url: `/gamer/gift/page`, params })
  },

  // 查询礼物详情
  getGift: async (id: number) => {
    return await request.get({ url: `/gamer/gift/get?id=` + id })
  },

  // 新增礼物
  createGift: async (data: Gift) => {
    return await request.post({ url: `/gamer/gift/create`, data })
  },

  // 修改礼物
  updateGift: async (data: Gift) => {
    return await request.put({ url: `/gamer/gift/update`, data })
  },

  // 删除礼物
  deleteGift: async (id: number) => {
    return await request.delete({ url: `/gamer/gift/delete?id=` + id })
  },

  /** 批量删除礼物 */
  deleteGiftList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/gift/delete-list?ids=${ids.join(',')}` })
  },

  // 导出礼物 Excel
  exportGift: async (params) => {
    return await request.download({ url: `/gamer/gift/export-excel`, params })
  }
}
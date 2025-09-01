import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 產品分類信息 */
export interface ProductCategory {
  id: number; // 主鍵
  categoryName: string; // 類別名稱
  categoryType?: number; // 類型(1陪玩2護航)
  categoryIcon: string; // 類別圖標
  categoryDemo: string; // 演示圖
  gameCard: string; // 游戲名片(存儲json字符串)
  orderReceivingStatus: boolean; // 是否啓用接單大區
  orderReceivingRegion: string; // 接單大區(多個使用@分割)
  skilledPositionStatus: boolean; // 是否开启擅长位置
  skilledPosition: string; // 擅长位置(多个使用@分割)
  accompanyTypeStatus: boolean; // 是否啓用陪玩類型
  accompanyType: string; // 陪玩類型(多個使用@分割)
  sortOrder: number; // 排序
  gameType: number; // 1端游2手游
}

// 產品分類 API
export const ProductCategoryApi = {
  // 查询產品分類分页
  getProductCategoryPage: async (params?: any) => {
    return await request.get({ url: `/gamer/product-category/page`, params })
  },

  // 查询產品分類详情
  getProductCategory: async (id: number) => {
    return await request.get({ url: `/gamer/product-category/get?id=` + id })
  },

  // 新增產品分類
  createProductCategory: async (data: ProductCategory) => {
    return await request.post({ url: `/gamer/product-category/create`, data })
  },

  // 修改產品分類
  updateProductCategory: async (data: ProductCategory) => {
    return await request.put({ url: `/gamer/product-category/update`, data })
  },

  // 删除產品分類
  deleteProductCategory: async (id: number) => {
    return await request.delete({ url: `/gamer/product-category/delete?id=` + id })
  },

  /** 批量删除產品分類 */
  deleteProductCategoryList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/product-category/delete-list?ids=${ids.join(',')}` })
  },

  // 导出產品分類 Excel
  exportProductCategory: async (params) => {
    return await request.download({ url: `/gamer/product-category/export-excel`, params })
  }
}

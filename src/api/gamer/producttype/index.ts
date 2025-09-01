import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 商品類型信息 */
export interface ProductType {
  id: number; // 主鍵
  typeName: string; // 類型名稱
  categoryId?: number; // 商品分類ID
  isShow: boolean; // 是否顯示
  sortOrder: number; // 排序
}

// 商品類型 API
export const ProductTypeApi = {
  // 查询商品類型分页
  getProductTypePage: async (params?: any) => {
    return await request.get({ url: `/gamer/product-type/page`, params })
  },

  // 查询商品類型详情
  getProductType: async (id: number) => {
    return await request.get({ url: `/gamer/product-type/get?id=` + id })
  },

  // 新增商品類型
  createProductType: async (data: ProductType) => {
    return await request.post({ url: `/gamer/product-type/create`, data })
  },

  // 修改商品類型
  updateProductType: async (data: ProductType) => {
    return await request.put({ url: `/gamer/product-type/update`, data })
  },

  // 删除商品類型
  deleteProductType: async (id: number) => {
    return await request.delete({ url: `/gamer/product-type/delete?id=` + id })
  },

  /** 批量删除商品類型 */
  deleteProductTypeList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/product-type/delete-list?ids=${ids.join(',')}` })
  },

  // 导出商品類型 Excel
  exportProductType: async (params) => {
    return await request.download({ url: `/gamer/product-type/export-excel`, params })
  }
}

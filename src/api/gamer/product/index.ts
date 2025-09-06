import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 商品信息 */
export interface Product {
  id: number; // 主鍵
  productTitle?: string; // 商品标题
  productDesc: string; // 描述
  productStock: number; // 商品库存(-1代表不限制)
  productPrice: number; // 商品价格
  productLevel: string; // 商品等级
  productDetailCover: string; // 详情图
  productMainCover: string; // 主页图
  productContent: string; // 商品内容(富文本)
  productPrizeGroupId: number; // 绑定奖品组
  categoryId: number; // 分类ID
  typeId: number; // 商品类型
  scoreThreshold: number; // 接单分数门槛
  accompanyTimeoutCancel: number; // 派單超時自動取消(分鐘),-1代表無限制
  accompanySettting: number; // 陪陪分配置(預留字段)
  maxBuyNum: number; // 最低购买数量
  commissionRate?: number; // 抽成比例(陪玩到手比例)
  refundSupported: boolean; // 是否支持退款
  virtualSales: number; // 虚拟销量
  virtualPrice: number; // 虚拟价格
  estimateAccompanyTime: number; // 预估陪玩时长(分钟)
  saleStatus: boolean; // 上下架状态
}

// 商品 API
export const ProductApi = {
  // 查询商品分页
  getProductPage: async (params?: any) => {
    return await request.get({ url: `/gamer/product/page`, params })
  },

  // 查询商品详情
  getProduct: async (id: number) => {
    return await request.get({ url: `/gamer/product/get?id=` + id })
  },

  // 新增商品
  createProduct: async (data: Product) => {
    return await request.post({ url: `/gamer/product/create`, data })
  },

  // 修改商品
  updateProduct: async (data: Product) => {
    return await request.put({ url: `/gamer/product/update`, data })
  },

  // 删除商品
  deleteProduct: async (id: number) => {
    return await request.delete({ url: `/gamer/product/delete?id=` + id })
  },

  /** 批量删除商品 */
  deleteProductList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/product/delete-list?ids=${ids.join(',')}` })
  },

  // 导出商品 Excel
  exportProduct: async (params) => {
    return await request.download({ url: `/gamer/product/export-excel`, params })
  }
}

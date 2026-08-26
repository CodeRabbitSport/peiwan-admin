import request from '@/config/axios'

/** 商品信息 */
export interface Product {
  id: number // 主鍵
  productTitle?: string // 商品标题
  productDesc: string // 描述
  productStock: number // 商品库存(-1代表不限制)
  productPrice: number // 商品价格
  productLevel: string // 商品等级
  productDetailCover: string // 详情图
  productMainCover: string // 主页图
  productContent: string // 商品内容(富文本)
  productPrizeGroupId: number // 绑定奖品组
  categoryId: number // 分类ID
  typeId: number // 商品类型
  scoreThreshold: number // 接单分数门槛
  accompanyTimeoutCancel: number // 派單超時自動取消(分鐘),-1代表無限制
  accompanySetting: number // 陪陪分配置(預留字段)
  maxBuyNum: number // 最低购买数量
  commissionRate?: number // 抽成比例(陪玩到手比例)
  refundSupported: boolean // 是否支持退款
  virtualSales: number // 虚拟销量
  virtualPrice: number // 虚拟价格
  estimateAccompanyTime: number // 预估陪玩时长(分钟)
  saleStatus: boolean // 上下架状态
  isMiniProgramVisible: boolean // 是否在小程序端显示
  isWebVisible: boolean // 是否在网页端显示
  sortOrder?: number // 商品排序
  createTime?: string
  linkedProductId?: number // 关联商品 ID
  linkedProductTitle?: string // 关联商品标题
  syncLinkedProduct?: boolean // 是否同步编辑关联商品
  syncProductId?: number // 编辑时确认的关联商品 ID
  linkedProductPrice?: number // 关联商品实际售价（分）
  createLinkedProduct?: boolean // 是否同时创建关联商品
  linkedCategoryId?: number // 关联商品分类 ID
  linkedTypeId?: number // 关联商品类型 ID
  orderReceivingStatus?: boolean
  orderReceivingRegion?: string
  popUp?: string
  popUpEnabled?: boolean
  discountConfigList?: string
  discountEnabled?: boolean
}

export interface ProductLinkRequest {
  productId: number
  linkedProductId: number
  replaceExisting?: boolean
}

// 商品 API
export const ProductApi = {
  // 查询商品分页
  getProductPage: async (params?: any) => {
    return await request.get({ url: `/gamer/product/page`, params })
  },

  // 查询商品详情
  getProduct: async (id: number) => {
    return await request.get({ url: `/gamer/product/get?id=${id}` })
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
  deleteProduct: async (id: number, deleteLinked = false) => {
    return await request.delete({ url: `/gamer/product/delete?id=${id}&deleteLinked=${deleteLinked}` })
  },

  /** 批量删除商品 */
  deleteProductList: async (ids: number[], deleteLinked = false) => {
    return await request.delete({ url: `/gamer/product/delete-list?ids=${ids.join(',')}&deleteLinked=${deleteLinked}` })
  },

  // 建立商品一对一关联
  linkProduct: async (data: ProductLinkRequest) => {
    return await request.post({ url: `/gamer/product/link`, data })
  },

  // 解除商品一对一关联
  unlinkProduct: async (id: number) => {
    return await request.delete({ url: `/gamer/product/link?id=${id}` })
  },

  // 导出商品 Excel
  exportProduct: async (params) => {
    return await request.download({ url: `/gamer/product/export-excel`, params })
  },
  /**
   * 审核退款申请
   * @param {number} data.orderId 订单ID
   * @param {number} data.auditStatus 审核状态：1-审核通过 2-审核拒绝
   * @param {string} data.auditReason 审核原因（拒绝时必填）
   * @returns
   */
  auditRefund(data: any) {
    return request.post({ url: `/gamer/service-order/audit-refund`, data })
  },
}

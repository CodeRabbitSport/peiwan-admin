import request from '@/config/axios'

// Response interface
export interface GetWeeklyStaticsRes {

  /* */
  time: string

  /* */
  rechargeAmount: number

  /* */
  commissionAmount: number

  /* */
  orderAmount: number

  /* */
  orderCount: number
}

/**
 * 获取周统计数据
 * @param {string} dateType 1: 本周, 2:上周
 * @param {string} levelType 1:陪玩,2:打手
 * @returns
 */
export function getWeeklyStatics(params: any): Promise<GetWeeklyStaticsRes[]> {
  return request.get({ url: `/gamer/statics/weekly-statics`, params })
}
// Parameter interface

// Response interface
export interface GetUserIncomeRankListRes {

  /* 用户编号 */
  userId: number

  /* 用户昵称 */
  nickname: string

  /* 金额(分) */
  amount: number
}

/**
 * 获取收入排行榜
 * @param {string} dateType 1: 本周, 2:上周
 * @param {string} levelType 1:陪玩,2:打手
 * @returns
 */
export function getUserIncomeRankList(params: any): Promise<GetUserIncomeRankListRes[]> {
  return request.get({ url: `/gamer/statics/user-income-rank`, params })
}

// Parameter interface

// Response interface
export interface GetUserConsumptionRankListRes {

  /* 用户编号 */
  userId: number

  /* 用户昵称 */
  nickname: string

  /* 金额(分) */
  amount: number
}

/**
 * 获取消费排行榜
 * @param {string} dateType 1: 本周, 2:上周
 * @param {string} levelType 1:陪玩,2:打手
 * @returns
 */
export function getUserConsumptionRankList(params: any): Promise<GetUserConsumptionRankListRes[]> {
  return request.get({ url: `/gamer/statics/user-consumption-rank`, params })
}

// Response interface
export interface GetTodayServiceOrderListRes {

  /* 订单ID */
  id: number

  /* 订单编号 */
  categoryId: number

  /* 分类名称 */
  categoryName: string

  /* 用户编号 */
  userId: string

  /* 用户昵称 */
  nickname: string

  /* 用户头像 */
  avatar: string

  /* 队长ID */
  captainId: number

  /* 队长昵称 */
  captainNickname: string

  /* 队长头像 */
  captainAvatar: string
}

/**
 * 获取今日服务订单列表
 * @returns
 */
export function getTodayServiceOrderList(params?: any): Promise<GetTodayServiceOrderListRes[]> {
  return request.get({ url: `/gamer/statics/service-order/today`, params })
}

// Parameter interface

// Response interface

/**
 * 获取复购率
 * @param {string} dateType 1: 本周, 2:上周
 * @param {string} levelType 1:陪玩,2:打手
 * @returns
 */
export function getRepeatPurchaseRate(params: any): Promise<number> {
  return request.get({ url: `/gamer/statics/service-order/repeat-purchase-rate`, params })
}

// Parameter interface

// Response interface

/**
 * 获取退款率
 * @param {string} dateType 1: 本周, 2:上周
 * @param {string} levelType 1:陪玩,2:打手
 * @returns
 */
export function getRefundRate(params: any): Promise<number> {
  return request.get({ url: `/gamer/statics/service-order/refund-rate`, params })
}

// Parameter interface

// Response interface

/**
 * 获取服务订单转化率
 * @param {string} dateType 1: 本周, 2:上周
 * @param {string} levelType 1:陪玩,2:打手
 * @returns
 */
export function getConversationRate(params: any): Promise<number> {
  return request.get({ url: `/gamer/statics/service-order/conversion-rate`, params })
}

// Parameter interface

// Response interface
export interface GetCategoryPercentageListRes {

  /* 分类编号 */
  categoryId: number

  /* 分类名称 */
  categoryName: string

  /* 分类订单统计 */
  orderCount: number

  /* 分类订单占比 */
  percentage: number
}

/**
 * 获取服务订单分类占比
 * @returns
 */
export function getCategoryPercentageList(params: any): Promise<GetCategoryPercentageListRes[]> {
  return request.get({ url: `/gamer/statics/service-order/category-percentage`, params })
}

// Parameter interface

// Response interface

/**
 * 获取充值金额
 * @param {string} dateType 1: 本周, 2:上周 ,3:本月 4 上月 5全部
 * @param {string} levelType 1:陪玩,2:打手
 * @returns
 */
export function getRechargeAmount(params: any): Promise<number> {
  return request.get({ url: `/gamer/statics/recharge/amount`, params })
}

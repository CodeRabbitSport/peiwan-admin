import request from '@/config/axios'

/** 打手/陪玩等级申请信息 */
export interface LevelApply {
  id: number // ID
  userId: number // 用户ID
  productCategoryId?: number // 所属商品分类ID
  levelType?: number // 等级类型(1打手2陪玩)
  level?: number // 级别
  personalIntroduction: string // 个人介绍
  rejectReason: string // 驳回原因
  contact: string // 联系方式(json字符串)
  imageAttachment: string // 图片附件
  attachment: string // 附件
  gameRegion: string // 附件
  auditStatus: number // 审核状态(0待审核1通过2拒绝)
  isRecommended?: boolean // 是否推荐
  userNickname?: string // 用户昵称
  userAvatar?: string // 用户头像
  loginIp?: string // 最后登录IP
  loginDate?: string // 最后登录时间
  roleBanned?: boolean // 当前身份是否封禁
  walletBalance?: number // 钱包可用余额（分）
  levelName?: string // 等级名称
  levelIcon?: string // 等级图标
  voteCount?: number // 当前票数
}

export interface AdjustVoteCountReqVO {
  id: number
  changeCount: number
}

/** 打手数据统计（按接单人聚合，打手+陪玩全算） */
export interface LevelApplyAcceptorStats {
  userId: number
  // 接单单数
  todayAcceptCount: number
  yesterdayAcceptCount: number
  currentWeekAcceptCount: number
  lastWeekAcceptCount: number
  currentMonthAcceptCount: number
  lastMonthAcceptCount: number
  // 退单单数
  todayRefundCount: number
  yesterdayRefundCount: number
  currentWeekRefundCount: number
  lastWeekRefundCount: number
  currentMonthRefundCount: number
  lastMonthRefundCount: number
  // 接单金额（元）
  todayAcceptAmount: number
  yesterdayAcceptAmount: number
  currentWeekAcceptAmount: number
  lastWeekAcceptAmount: number
  currentMonthAcceptAmount: number
  lastMonthAcceptAmount: number
  // 退单金额（元）
  todayRefundAmount: number
  yesterdayRefundAmount: number
  currentWeekRefundAmount: number
  lastWeekRefundAmount: number
  currentMonthRefundAmount: number
  lastMonthRefundAmount: number
  // 评分
  ratedCount: number
  star1Count: number
  star2Count: number
  star3Count: number
  star4Count: number
  star5Count: number
}

// 打手/陪玩等级申请 API
export const LevelApplyApi = {
  // 查询打手/陪玩等级申请分页
  getLevelApplyPage: async (params: any) => {
    return await request.get({ url: `/gamer/level-apply/page`, params })
  },

  // 查询打手/陪玩等级申请详情
  getLevelApply: async (id: number) => {
    return await request.get({ url: `/gamer/level-apply/get?id=${id}` })
  },

  // 查询接单人数据统计；levelType 为 1 仅陪玩，2 仅打手，未传则合计
  getAcceptorStats: async (userId: number, levelType?: number): Promise<LevelApplyAcceptorStats> => {
    return await request.get({
      url: `/gamer/level-apply/acceptor-stats`,
      params: { userId, levelType },
    })
  },

  // 审核打手/陪玩等级申请
  auditLevelApply: async (data: any) => {
    return await request.post({ url: `/gamer/level-apply/audit`, data })
  },

  // 更新打手/陪玩身份封禁状态
  updateRoleBanStatus: async (data: { userId: number, levelType: number, banned: boolean }) => {
    return await request.put({ url: `/gamer/level-apply/role-ban`, data })
  },

  // 新增打手/陪玩等级申请
  createLevelApply: async (data: LevelApply) => {
    return await request.post({ url: `/gamer/level-apply/create`, data })
  },

  // 修改打手/陪玩等级申请
  updateLevelApply: async (data: LevelApply) => {
    return await request.put({ url: `/gamer/level-apply/update`, data })
  },

  // 人工增加或减少票数，changeCount 正数增加、负数减少
  adjustVoteCount: async (data: AdjustVoteCountReqVO) => {
    return await request.put({ url: `/gamer/level-apply/adjust-vote-count`, data })
  },

  // 删除打手/陪玩等级申请
  deleteLevelApply: async (id: number) => {
    return await request.delete({ url: `/gamer/level-apply/delete?id=${id}` })
  },

  /** 批量删除打手/陪玩等级申请 */
  deleteLevelApplyList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/level-apply/delete-list?ids=${ids.join(',')}` })
  },

  // 导出打手/陪玩等级申请 Excel
  exportLevelApply: async (params) => {
    return await request.download({ url: `/gamer/level-apply/export-excel`, params })
  },
}

/**
 * 同步用户游戏区服
 * @param {string} id
 * @returns
 */
export function LevelApply_syncUserGameRegion(id: number) {
  return request.post({ url: `/gamer/level-apply/sync-user-game-region?id=${id}` })
}

/**
 * 同步用户等级
 * @param {string} id
 * @returns
 */
export function LevelApply_syncUserLevel(id: number) {
  return request.post({ url: `/gamer/level-apply/sync-user-level?id=${id}` })
}

// batch-update-all-users-service-status
export function LevelApply_batchUpdateAllUsersServiceStatus() {
  return request.post({ url: `/gamer/level-apply/batch-update-all-users-service-status` })
}

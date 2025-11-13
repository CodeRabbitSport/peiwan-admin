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

  // 审核打手/陪玩等级申请
  auditLevelApply: async (data: any) => {
    return await request.post({ url: `/gamer/level-apply/audit`, data })
  },

  // 新增打手/陪玩等级申请
  createLevelApply: async (data: LevelApply) => {
    return await request.post({ url: `/gamer/level-apply/create`, data })
  },

  // 修改打手/陪玩等级申请
  updateLevelApply: async (data: LevelApply) => {
    return await request.put({ url: `/gamer/level-apply/update`, data })
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

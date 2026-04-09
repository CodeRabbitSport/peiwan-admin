import request from '@/config/axios'

/** 钱包总经验流水信息 */
export interface ExperienceRecord {
  id: number // 编号
  userId?: number // 用户ID
  changeType?: number // 变更类型：1增加 2减少
  changeExperience?: number // 变化经验值，存正数
  beforeTotalExperience?: number // 变化前总经验
  afterTotalExperience?: number // 变化后总经验
  operatorId?: number // 操作人ID
  operatorType?: number // 操作人类型
  operatorName?: string // 操作人名称
  remark?: string // 备注
  createTime?: string // 创建时间
}

// 钱包总经验流水 API
export const ExperienceRecordApi = {
  // 查询钱包总经验流水分页
  getExperienceRecordPage: async (params: any) => {
    return await request.get({ url: `/userCenter/experience-record/page`, params })
  },

  // 查询钱包总经验流水详情
  getExperienceRecord: async (id: number) => {
    return await request.get({ url: `/userCenter/experience-record/get?id=${id}` })
  },

  // 新增钱包总经验流水
  createExperienceRecord: async (data: ExperienceRecord) => {
    return await request.post({ url: `/userCenter/experience-record/create`, data })
  },

  // 修改钱包总经验流水
  updateExperienceRecord: async (data: ExperienceRecord) => {
    return await request.put({ url: `/userCenter/experience-record/update`, data })
  },

  // 删除钱包总经验流水
  deleteExperienceRecord: async (id: number) => {
    return await request.delete({ url: `/userCenter/experience-record/delete?id=${id}` })
  },

  /** 批量删除钱包总经验流水 */
  deleteExperienceRecordList: async (ids: number[]) => {
    return await request.delete({ url: `/userCenter/experience-record/delete-list?ids=${ids.join(',')}` })
  },

  // 导出钱包总经验流水 Excel
  exportExperienceRecord: async (params) => {
    return await request.download({ url: `/userCenter/experience-record/export-excel`, params })
  },
}

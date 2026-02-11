import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 用户等级配置信息 */
export interface UserGrade {
          id: number; // 主键
          levelNumber?: number; // 等级编号
          levelName?: string; // 等级名称
          levelIcon?: string; // 等级图标
          levelCover?: string; // 等级封面
          levelDescription: string; // 等级描述
          levelPrivileges: string; // 等级权益(存json)
          levelUpgradePoints?: number; // 升级所需数
  }

// 用户等级配置 API
export const UserGradeApi = {
  // 查询用户等级配置分页
  getUserGradePage: async (params: any) => {
    return await request.get({ url: `/userCenter/user-grade/page`, params })
  },

  // 查询用户等级配置详情
  getUserGrade: async (id: number) => {
    return await request.get({ url: `/userCenter/user-grade/get?id=` + id })
  },

  // 新增用户等级配置
  createUserGrade: async (data: UserGrade) => {
    return await request.post({ url: `/userCenter/user-grade/create`, data })
  },

  // 修改用户等级配置
  updateUserGrade: async (data: UserGrade) => {
    return await request.put({ url: `/userCenter/user-grade/update`, data })
  },

  // 删除用户等级配置
  deleteUserGrade: async (id: number) => {
    return await request.delete({ url: `/userCenter/user-grade/delete?id=` + id })
  },

  /** 批量删除用户等级配置 */
  deleteUserGradeList: async (ids: number[]) => {
    return await request.delete({ url: `/userCenter/user-grade/delete-list?ids=${ids.join(',')}` })
  },

  // 导出用户等级配置 Excel
  exportUserGrade: async (params) => {
    return await request.download({ url: `/userCenter/user-grade/export-excel`, params })
  }
}
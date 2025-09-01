import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 系统配置信息 */
export interface SystemConfig {
          id: number; // 主键ID
          configKey?: string; // 配置键名
          configValue: string; // 配置值(支持长文本)
          title?: string; // 配置标题
          description: string; // 配置描述
  }

// 系统配置 API
export const SystemConfigApi = {
  // 查询系统配置分页
  getSystemConfigPage: async (params: any) => {
    return await request.get({ url: `/gamer/system-config/page`, params })
  },

  // 查询系统配置详情
  getSystemConfig: async (id: number) => {
    return await request.get({ url: `/gamer/system-config/get?id=` + id })
  },

  // 新增系统配置
  createSystemConfig: async (data: SystemConfig) => {
    return await request.post({ url: `/gamer/system-config/create`, data })
  },

  // 修改系统配置
  updateSystemConfig: async (data: SystemConfig) => {
    return await request.put({ url: `/gamer/system-config/update`, data })
  },

  // 删除系统配置
  deleteSystemConfig: async (id: number) => {
    return await request.delete({ url: `/gamer/system-config/delete?id=` + id })
  },

  /** 批量删除系统配置 */
  deleteSystemConfigList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/system-config/delete-list?ids=${ids.join(',')}` })
  },

  // 导出系统配置 Excel
  exportSystemConfig: async (params) => {
    return await request.download({ url: `/gamer/system-config/export-excel`, params })
  }
}
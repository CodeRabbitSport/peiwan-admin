import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 用户语音信息 */
export interface UserMomentVoice {
          id: number; // 主键ID
          momentId?: number; // 动态ID
          voiceUrl?: string; // 语音文件URL
          duration: number; // 时长，单位秒
  }

// 用户语音 API
export const UserMomentVoiceApi = {
  // 查询用户语音分页
  getUserMomentVoicePage: async (params: any) => {
    return await request.get({ url: `/gamer/user-moment-voice/page`, params })
  },

  // 查询用户语音详情
  getUserMomentVoice: async (id: number) => {
    return await request.get({ url: `/gamer/user-moment-voice/get?id=` + id })
  },

  // 新增用户语音
  createUserMomentVoice: async (data: UserMomentVoice) => {
    return await request.post({ url: `/gamer/user-moment-voice/create`, data })
  },

  // 修改用户语音
  updateUserMomentVoice: async (data: UserMomentVoice) => {
    return await request.put({ url: `/gamer/user-moment-voice/update`, data })
  },

  // 删除用户语音
  deleteUserMomentVoice: async (id: number) => {
    return await request.delete({ url: `/gamer/user-moment-voice/delete?id=` + id })
  },

  /** 批量删除用户语音 */
  deleteUserMomentVoiceList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/user-moment-voice/delete-list?ids=${ids.join(',')}` })
  },

  // 导出用户语音 Excel
  exportUserMomentVoice: async (params) => {
    return await request.download({ url: `/gamer/user-moment-voice/export-excel`, params })
  }
}
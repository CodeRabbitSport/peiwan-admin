import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 用户实名认证申请信息 */
export interface UserAuthVerification {
          id: number; // 编号
          userId?: number; // 用户ID
          realName?: string; // 真实姓名
          idCardNo?: string; // 身份证号码
          frontImageUrl?: string; // 身份证正面图片URL
          status?: number; // 审核状态：0-待审核, 1-审核通过, 2-审核拒绝
          rejectReason: string; // 拒绝原因
          reviewerId: number; // 审核人ID
          reviewedAt: string | Dayjs; // 审核时间
  }

// 用户实名认证申请 API
export const UserAuthVerificationApi = {
  // 查询用户实名认证申请分页
  getUserAuthVerificationPage: async (params: any) => {
    return await request.get({ url: `/gamer/user-auth-verification/page`, params })
  },

  // 查询用户实名认证申请详情
  getUserAuthVerification: async (id: number) => {
    return await request.get({ url: `/gamer/user-auth-verification/get?id=` + id })
  },

  // 新增用户实名认证申请
  createUserAuthVerification: async (data: UserAuthVerification) => {
    return await request.post({ url: `/gamer/user-auth-verification/create`, data })
  },

  // 修改用户实名认证申请
  updateUserAuthVerification: async (data: UserAuthVerification) => {
    return await request.put({ url: `/gamer/user-auth-verification/update`, data })
  },

  // 删除用户实名认证申请
  deleteUserAuthVerification: async (id: number) => {
    return await request.delete({ url: `/gamer/user-auth-verification/delete?id=` + id })
  },

  /** 批量删除用户实名认证申请 */
  deleteUserAuthVerificationList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/user-auth-verification/delete-list?ids=${ids.join(',')}` })
  },

  // 导出用户实名认证申请 Excel
  exportUserAuthVerification: async (params) => {
    return await request.download({ url: `/gamer/user-auth-verification/export-excel`, params })
  }
}
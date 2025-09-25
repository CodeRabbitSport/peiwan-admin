import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 用户提现账户信息 */
export interface UserWithdrawAccount {
          id: number; // 主键ID
          userId?: number; // 用户ID
          channel?: number; // 提现渠道(1微信收款 2支付宝收款 3银行卡收款 4支付宝账号收款)
          phone: string; // 手机号
          realName: string; // 真实姓名
          accountNo: string; // 账号(银行卡号/支付宝账号)
          bankName: string; // 银行名称(仅银行卡)
          qrCodeUrl: string; // 收款二维码URL
          isDefault: boolean; // 是否默认账户 0否 1是
  }

// 用户提现账户 API
export const UserWithdrawAccountApi = {
  // 查询用户提现账户分页
  getUserWithdrawAccountPage: async (params: any) => {
    return await request.get({ url: `/gamer/user-withdraw-account/page`, params })
  },

  // 查询用户提现账户详情
  getUserWithdrawAccount: async (id: number) => {
    return await request.get({ url: `/gamer/user-withdraw-account/get?id=` + id })
  },

  // 新增用户提现账户
  createUserWithdrawAccount: async (data: UserWithdrawAccount) => {
    return await request.post({ url: `/gamer/user-withdraw-account/create`, data })
  },

  // 修改用户提现账户
  updateUserWithdrawAccount: async (data: UserWithdrawAccount) => {
    return await request.put({ url: `/gamer/user-withdraw-account/update`, data })
  },

  // 删除用户提现账户
  deleteUserWithdrawAccount: async (id: number) => {
    return await request.delete({ url: `/gamer/user-withdraw-account/delete?id=` + id })
  },

  /** 批量删除用户提现账户 */
  deleteUserWithdrawAccountList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/user-withdraw-account/delete-list?ids=${ids.join(',')}` })
  },

  // 导出用户提现账户 Excel
  exportUserWithdrawAccount: async (params) => {
    return await request.download({ url: `/gamer/user-withdraw-account/export-excel`, params })
  }
}
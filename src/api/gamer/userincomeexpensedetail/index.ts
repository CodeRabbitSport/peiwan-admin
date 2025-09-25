import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 收入支出明细信息 */
export interface UserIncomeExpenseDetail {
          id: number; // 主键ID
          userId?: number; // 用户ID
          type?: number; // 类型(1:收入 2:支出)
          category?: number; // 分类(1:充值 2:提现 3:订单收入 4:支付)
          amount?: number; // 金额(分)
          balanceBefore?: number; // 变动前余额(分)
          balanceAfter?: number; // 变动后余额(分)
          businessTitle: string; // 业务标题
          businessType: string; // 业务类型
          businessId: number; // 关联业务ID
          orderNo: string; // 订单号
  }

// 收入支出明细 API
export const UserIncomeExpenseDetailApi = {
  // 查询收入支出明细分页
  getUserIncomeExpenseDetailPage: async (params: any) => {
    return await request.get({ url: `/gamer/user-income-expense-detail/page`, params })
  },

  // 查询收入支出明细详情
  getUserIncomeExpenseDetail: async (id: number) => {
    return await request.get({ url: `/gamer/user-income-expense-detail/get?id=` + id })
  },

  // 新增收入支出明细
  createUserIncomeExpenseDetail: async (data: UserIncomeExpenseDetail) => {
    return await request.post({ url: `/gamer/user-income-expense-detail/create`, data })
  },

  // 修改收入支出明细
  updateUserIncomeExpenseDetail: async (data: UserIncomeExpenseDetail) => {
    return await request.put({ url: `/gamer/user-income-expense-detail/update`, data })
  },

  // 删除收入支出明细
  deleteUserIncomeExpenseDetail: async (id: number) => {
    return await request.delete({ url: `/gamer/user-income-expense-detail/delete?id=` + id })
  },

  /** 批量删除收入支出明细 */
  deleteUserIncomeExpenseDetailList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/user-income-expense-detail/delete-list?ids=${ids.join(',')}` })
  },

  // 导出收入支出明细 Excel
  exportUserIncomeExpenseDetail: async (params) => {
    return await request.download({ url: `/gamer/user-income-expense-detail/export-excel`, params })
  }
}
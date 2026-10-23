import request from '@/config/axios'

/** 打手/陪玩罚款 */
export interface UserFine {
  id: number
  no: string
  userId: number
  userNickname?: string
  levelType: number // 身份类型(1陪玩2打手)
  content: string // 罚款内容（富文本）
  amount: number // 罚款金额（分）
  status: number // 状态(0未缴纳1已缴纳2已撤销)
  payTime?: string
  createTime?: string
}

export interface UserFineCreateReqVO {
  userId: number
  levelType: number
  content: string
  amount: number // 分
}

// 罚款 API
export const UserFineApi = {
  // 开罚单
  createUserFine: async (data: UserFineCreateReqVO) => {
    return await request.post({ url: `/gamer/user-fine/create`, data })
  },

  // 撤销罚单
  cancelUserFine: async (id: number) => {
    return await request.put({ url: `/gamer/user-fine/cancel?id=${id}` })
  },

  // 罚款分页
  getUserFinePage: async (params: any) => {
    return await request.get({ url: `/gamer/user-fine/page`, params })
  },
}

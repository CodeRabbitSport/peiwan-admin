import request from '@/config/axios'

/** 用户钱包查询参数 */
export interface PayWalletUserReqVO {
  userId: number
}

/** 钱包 VO */
export interface WalletVO {
  id: number
  userId: number
  userType: number
  balance: number
  depositBalance?: number
  totalExpense: number
  totalRecharge: number
  freezePrice: number
  totalExperience?: number
}

/** 查询用户钱包详情 */
export async function getWallet(params: PayWalletUserReqVO) {
  return await request.get<WalletVO>({ url: `/pay/wallet/get`, params })
}

/** 查询会员钱包列表 */
export async function getWalletPage(params: any) {
  return await request.get({ url: `/pay/wallet/page`, params })
}

/** 修改会员钱包余额 */
export async function updateWalletBalance(data: any) {
  return await request.put({ url: `/pay/wallet/update-balance`, data })
}

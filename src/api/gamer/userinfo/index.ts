import request from '@/config/axios'

/** 用户信息信息 */
export interface UserInfo {
  id: number // 用户ID
  openid: string // 小程序openid
  mpOpenid: string // 公众号微信openid
  unionid: string // 微信unionid
  userCode: string // 用户唯一编号
  phone: string // 手机号
  nickname: string // 用户昵称
  avatar: string // 用户头像
  trueHead: string // 真实头像地址
  sex: boolean // 性别 0未知 1男 2女
  city: string // 城市
  signature: string // 个性签名/简介
  money: number // 余额
  giftMoney: number // 礼物余额
  wealthVal: number // 财富值
  charmVal: number // 魅力值
  davName: string // 达人名称
  voiceAuditStatus: number // 语音审核状态
  isSeeFollow: boolean // 是否允许查看关注 0否 1是
  isSeeFans: boolean // 是否允许查看粉丝 0否 1是
}

// 用户信息 API
export const UserInfoApi = {
  // 查询用户信息分页
  getUserInfoPage: async (params: any) => {
    return await request.get({ url: `/gamer/user-info/page`, params })
  },

  getUserInfoPageByLevel: async (params: any) => {
    return await request.get({ url: `/gamer/user-info/page-by-level`, params })
  },

  // 查询用户信息详情
  getUserInfo: async (id: number) => {
    return await request.get({ url: `/gamer/user-info/get?id=${id}` })
  },

  // 新增用户信息
  createUserInfo: async (data: UserInfo) => {
    return await request.post({ url: `/gamer/user-info/create`, data })
  },

  // 修改用户信息
  updateUserInfo: async (data: UserInfo) => {
    return await request.put({ url: `/gamer/user-info/update`, data })
  },

  // 删除用户信息
  deleteUserInfo: async (id: number) => {
    return await request.delete({ url: `/gamer/user-info/delete?id=${id}` })
  },

  /** 批量删除用户信息 */
  deleteUserInfoList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/user-info/delete-list?ids=${ids.join(',')}` })
  },

  // 导出用户信息 Excel
  exportUserInfo: async (params) => {
    return await request.download({ url: `/gamer/user-info/export-excel`, params })
  },
  toggleUserStatus(data) {
    return request.put({ url: `/gamer/user-info/toggle-status`, data })
  },
}

import request from '@/config/axios'

export interface SocialClientVO {
  id: number
  name: string
  socialType: number
  userType: number
  clientId: string
  clientSecret: string
  agentId: string
  status: number
}

// 查询社交客户端列表
export async function getSocialClientPage(params) {
  return await request.get({ url: `/system/social-client/page`, params })
}

// 查询社交客户端详情
export async function getSocialClient(id: number) {
  return await request.get({ url: `/system/social-client/get?id=${id}` })
}

// 新增社交客户端
export async function createSocialClient(data: SocialClientVO) {
  return await request.post({ url: `/system/social-client/create`, data })
}

// 修改社交客户端
export async function updateSocialClient(data: SocialClientVO) {
  return await request.put({ url: `/system/social-client/update`, data })
}

// 删除社交客户端
export async function deleteSocialClient(id: number) {
  return await request.delete({ url: `/system/social-client/delete?id=${id}` })
}

// 上传授权文件
export async function uploadAuthFile(data: { file: File }) {
  return await request.upload({ url: `/system/social-client/upload-txt`, data })
}

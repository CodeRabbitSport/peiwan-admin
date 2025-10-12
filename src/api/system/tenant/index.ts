import request from '@/config/axios'

export interface TenantVO {
  id: number
  name: string
  contactName: string
  contactMobile: string
  status: number
  domain: string
  packageId: number
  username: string
  password: string
  expireTime: Date
  accountCount: number
  websites: string[]
  createTime: Date
}

export interface TenantPageReqVO extends PageParam {
  name?: string
  contactName?: string
  contactMobile?: string
  status?: number
  createTime?: Date[]
}

export interface TenantExportReqVO {
  name?: string
  contactName?: string
  contactMobile?: string
  status?: number
  createTime?: Date[]
}

// 查询租户列表
export function getTenantPage(params: TenantPageReqVO) {
  return request.get({ url: '/system/tenant-new/page', params })
}

// 查询租户详情
export function getTenant(id: number) {
  return request.get({ url: `/system/tenant/get?id=${id}` })
}

// 获取租户精简信息列表
export function getTenantList() {
  return request.get({ url: '/system/tenant/simple-list' })
}

// 新增租户
export function createTenant(data: TenantVO) {
  return request.post({ url: '/system/tenant/create', data })
}

// 修改租户
export function updateTenant(data: TenantVO) {
  return request.put({ url: '/system/tenant/update', data })
}

// 删除租户
export function deleteTenant(id: number) {
  return request.delete({ url: `/system/tenant/delete?id=${id}` })
}

// 批量删除租户
export function deleteTenantList(ids: number[]) {
  return request.delete({ url: '/system/tenant/delete-list', params: { ids: ids.join(',') } })
}

// 导出租户
export function exportTenant(params: TenantExportReqVO) {
  return request.download({ url: '/system/tenant/export-excel', params })
}

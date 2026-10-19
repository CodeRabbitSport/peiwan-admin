import request from '@/config/axios'

export interface SensitiveWordVO {
  id?: number
  word: string
  status: number
  remark: string
  createTime?: string
}

export function getSensitiveWordPage(params: PageParam & { word?: string, status?: number }) {
  return request.get({ url: '/gamer/sensitive-word/page', params })
}

export function getSensitiveWord(id: number): Promise<SensitiveWordVO> {
  return request.get({ url: '/gamer/sensitive-word/get', params: { id } })
}

export function createSensitiveWord(data: SensitiveWordVO) {
  return request.post({ url: '/gamer/sensitive-word/create', data })
}

export function updateSensitiveWord(data: SensitiveWordVO) {
  return request.put({ url: '/gamer/sensitive-word/update', data })
}

export function deleteSensitiveWord(id: number) {
  return request.delete({ url: '/gamer/sensitive-word/delete', params: { id } })
}

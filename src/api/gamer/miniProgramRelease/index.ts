import request from '@/config/axios'

export interface MiniProgramCiConfig {
  tenantId: number
  tenantWebsite?: string
  appId?: string
  appSecretConfigured: boolean
  privateKeyConfigured: boolean
  keyFingerprint?: string
  robot: number
  fixedEgressIp?: string
}

export interface MiniProgramVersion {
  id: number
  version: string
  changelog: string
  fileName: string
  fileSize: number
  createTime: number
}

export type MiniProgramUploadStatus = 'QUEUED' | 'UPLOADING' | 'SUCCESS' | 'FAILED'

export interface MiniProgramUpload {
  id: number
  versionId: number
  appId: string
  version: string
  changelog: string
  status: MiniProgramUploadStatus
  errorMessage?: string
  startedAt?: number
  finishedAt?: number
  createTime: number
}

export interface MiniProgramReleaseOverview {
  config: MiniProgramCiConfig
  versions: MiniProgramVersion[]
  uploads: MiniProgramUpload[]
  currentUploadedVersion?: MiniProgramUpload
}

export interface MiniProgramCiConfigSaveReq {
  appId: string
  appSecret?: string
  privateKey?: string
  robot: number
}

export const MiniProgramReleaseApi = {
  getOverview: () =>
    request.get<MiniProgramReleaseOverview>({
      url: '/gamer/mini-program-release/overview',
    }),

  saveConfig: (data: MiniProgramCiConfigSaveReq) =>
    request.put({
      url: '/gamer/mini-program-release/config',
      data,
    }),

  uploadVersion: async (data: FormData) => {
    const response = await request.upload({
      url: '/gamer/mini-program-release/version',
      data,
      timeout: 5 * 60 * 1000,
    })
    return response.data as number
  },

  createUploadTask: (versionId: number) =>
    request.post<number>({
      url: '/gamer/mini-program-release/upload',
      params: { versionId },
    }),
}

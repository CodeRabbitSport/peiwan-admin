<script setup lang="ts">
import type { UploadFile, UploadUserFile } from 'element-plus'

import type {
  MiniProgramReleaseOverview,
  MiniProgramUploadStatus,
  MiniProgramVersion,
} from '@/api/gamer/miniProgramRelease'
import { MiniProgramReleaseApi } from '@/api/gamer/miniProgramRelease'

defineOptions({ name: 'MiniProgramRelease' })

const message = useMessage()
const loading = ref(false)
const savingConfig = ref(false)
const uploadingArtifact = ref(false)
const creatingTaskVersionId = ref<number>()
const overview = ref<MiniProgramReleaseOverview>()
const artifactFile = ref<File>()
const artifactFileList = ref<UploadUserFile[]>([])
const uploadFailureDialogVisible = ref(false)
const uploadFailureReason = ref('')
let pollTimer: ReturnType<typeof setTimeout> | undefined
let componentUnmounted = false

const configForm = reactive({
  appId: '',
  appSecret: '',
  privateKey: '',
  robot: 1,
})
const versionForm = reactive({
  version: '',
  changelog: '',
})

const domainRows = [
  { type: 'request', values: ['https://api.zszs5.cn'] },
  { type: 'uploadFile', values: ['https://api.zszs5.cn'] },
  {
    type: 'downloadFile',
    values: ['https://api.zszs5.cn', 'https://kuaiyoudj.oss-cn-beijing.aliyuncs.com'],
  },
  { type: 'socket', values: ['wss://api.zszs5.cn'] },
]

const statusMap: Record<
  MiniProgramUploadStatus,
  { label: string, type: 'info' | 'warning' | 'success' | 'danger' }
> = {
  QUEUED: { label: '排队中', type: 'info' },
  UPLOADING: { label: '上传中', type: 'warning' },
  SUCCESS: { label: '上传成功', type: 'success' },
  FAILED: { label: '上传失败', type: 'danger' },
}

const isSystemTenant = computed(() => overview.value?.config.tenantId === 1)
const currentUploadedVersion = computed(() => overview.value?.currentUploadedVersion)
const latestVersion = computed(() => overview.value?.versions?.[0])
const hasNewVersion = computed(() => Boolean(
  latestVersion.value
  && latestVersion.value.id !== currentUploadedVersion.value?.versionId,
))
const hasActiveTask = computed(() =>
  overview.value?.uploads.some(item => isActiveStatus(item.status)) || false,
)
const configReady = computed(() => {
  const config = overview.value?.config
  return Boolean(
    config?.appId
    && config.appSecretConfigured
    && config.privateKeyConfigured,
  )
})

function syncConfigForm(data: MiniProgramReleaseOverview) {
  configForm.appId = data.config.appId || ''
  configForm.appSecret = ''
  configForm.privateKey = ''
  configForm.robot = data.config.robot || 1
}

async function fetchOverview(silent = false, syncForm = false) {
  if (!silent)
    loading.value = true
  try {
    const hadOverview = Boolean(overview.value)
    const data = await MiniProgramReleaseApi.getOverview()
    overview.value = data
    if (!hadOverview || syncForm)
      syncConfigForm(data)
  }
  finally {
    loading.value = false
    schedulePolling()
  }
}

function schedulePolling() {
  if (pollTimer)
    clearTimeout(pollTimer)
  pollTimer = undefined
  if (!componentUnmounted && hasActiveTask.value) {
    pollTimer = setTimeout(() => {
      fetchOverview(true)
    }, 3000)
  }
}

function isActiveStatus(status: MiniProgramUploadStatus) {
  return status === 'QUEUED' || status === 'UPLOADING'
}

function getLatestUpload(versionId: number) {
  return overview.value?.uploads.find(item => item.versionId === versionId)
}

function isCurrentVersion(versionId: number) {
  return currentUploadedVersion.value?.versionId === versionId
}

function formatTime(value?: number) {
  if (!value)
    return '-'
  return new Date(value).toLocaleString('zh-CN', { hour12: false })
}

function formatFileSize(size?: number) {
  if (!size)
    return '-'
  if (size < 1024 * 1024)
    return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

async function copyText(value: string) {
  await navigator.clipboard.writeText(value)
  message.success('已复制')
}

async function readPrivateKeyFile(uploadFile: UploadFile) {
  if (!uploadFile.raw)
    return
  if (uploadFile.raw.size > 10000) {
    configForm.privateKey = ''
    message.error('代码上传密钥文件不能超过 10KB')
    return
  }
  configForm.privateKey = await uploadFile.raw.text()
}

async function saveConfig() {
  const appId = configForm.appId.trim()
  if (!/^wx[a-zA-Z0-9]{16}$/.test(appId)) {
    message.error('请输入正确的小程序 AppID')
    return
  }
  const appIdChanged = Boolean(overview.value?.config.appId && overview.value.config.appId !== appId)
  if ((!overview.value?.config.appSecretConfigured || appIdChanged) && !configForm.appSecret.trim()) {
    message.error(appIdChanged ? '修改 AppID 时需要重新填写 AppSecret' : '首次配置需要填写 AppSecret')
    return
  }
  if ((!overview.value?.config.appId
    || !overview.value.config.privateKeyConfigured
    || appIdChanged) && !configForm.privateKey.trim()) {
    message.error(appIdChanged ? '修改 AppID 时需要重新选择代码上传密钥' : '首次配置需要选择代码上传密钥文件')
    return
  }

  savingConfig.value = true
  try {
    await MiniProgramReleaseApi.saveConfig({
      appId,
      appSecret: configForm.appSecret.trim() || undefined,
      privateKey: configForm.privateKey.trim() || undefined,
      robot: configForm.robot,
    })
    message.success('小程序配置已保存')
    await fetchOverview(true, true)
  }
  finally {
    savingConfig.value = false
  }
}

function handleArtifactChange(uploadFile: UploadFile) {
  if (!uploadFile.raw)
    return
  if (!uploadFile.name.toLowerCase().endsWith('.zip')) {
    artifactFileList.value = []
    artifactFile.value = undefined
    message.error('只支持 ZIP 产物文件')
    return
  }
  if (uploadFile.raw.size > 100 * 1024 * 1024) {
    artifactFileList.value = []
    artifactFile.value = undefined
    message.error('ZIP 产物不能超过 100MB')
    return
  }
  artifactFile.value = uploadFile.raw
}

function handleArtifactRemove() {
  artifactFile.value = undefined
}

async function uploadArtifact() {
  if (!/^[0-9A-Z][\w.-]{0,63}$/i.test(versionForm.version.trim())) {
    message.error('请输入正确的版本号')
    return
  }
  if (!versionForm.changelog.trim()) {
    message.error('请输入更新日志')
    return
  }
  if (!artifactFile.value) {
    message.error('请选择构建产物 ZIP')
    return
  }

  const data = new FormData()
  data.append('version', versionForm.version.trim())
  data.append('changelog', versionForm.changelog.trim())
  data.append('file', artifactFile.value)
  uploadingArtifact.value = true
  try {
    await MiniProgramReleaseApi.uploadVersion(data)
    message.success('版本产物已发布')
    versionForm.version = ''
    versionForm.changelog = ''
    artifactFile.value = undefined
    artifactFileList.value = []
    await fetchOverview(true)
  }
  finally {
    uploadingArtifact.value = false
  }
}

async function createUploadTask(version: MiniProgramVersion) {
  if (!configReady.value) {
    message.error('请先保存完整的小程序配置')
    return
  }
  try {
    await message.confirm(`确认把 ${version.version} 上传到当前租户的小程序平台？`)
  }
  catch {
    return
  }

  creatingTaskVersionId.value = version.id
  try {
    await MiniProgramReleaseApi.createUploadTask(version.id)
    message.success('已加入上传队列')
    await fetchOverview(true)
  }
  finally {
    creatingTaskVersionId.value = undefined
  }
}

function openWechatPlatform() {
  window.open('https://mp.weixin.qq.com/', '_blank', 'noopener,noreferrer')
}

function showUploadFailure(errorMessage?: string) {
  uploadFailureReason.value = errorMessage?.trim() || '未记录具体失败原因'
  uploadFailureDialogVisible.value = true
}

onMounted(() => fetchOverview())
onBeforeUnmount(() => {
  componentUnmounted = true
  if (pollTimer)
    clearTimeout(pollTimer)
})
</script>

<template>
  <div v-loading="loading" class="mini-program-release">
    <section class="release-section release-summary">
      <div class="summary-item">
        <span class="summary-label">当前租户</span>
        <strong>{{ overview?.config.tenantName || '-' }}</strong>
        <small>{{ overview?.config.tenantWebsite || '未配置租户网站' }}</small>
      </div>
      <div class="summary-item">
        <span class="summary-label">最新可用版本</span>
        <strong>{{ latestVersion?.version || '-' }}</strong>
        <small>{{ latestVersion ? formatTime(latestVersion.createTime) : '暂无统一产物' }}</small>
        <el-tag v-if="hasNewVersion" size="small" type="warning" effect="plain">
          有更新
        </el-tag>
      </div>
      <div class="summary-item">
        <span class="summary-label">当前已上传开发版</span>
        <strong>{{ currentUploadedVersion?.version || '-' }}</strong>
        <small>{{ currentUploadedVersion ? formatTime(currentUploadedVersion.finishedAt) : '尚未上传' }}</small>
      </div>
      <div class="summary-item">
        <span class="summary-label">审核与发布</span>
        <strong>需在微信后台查看</strong>
        <el-button link type="primary" @click="openWechatPlatform">
          <Icon icon="ep:link" />
          前往查看
        </el-button>
      </div>
    </section>

    <section class="release-section">
      <div class="section-title-row">
        <div>
          <h4>小程序上传配置</h4>
          <p>AppID 用于运行时识别租户，代码上传密钥仅加密保存在服务端。</p>
        </div>
        <el-tag :type="configReady ? 'success' : 'warning'" effect="plain">
          {{ configReady ? '配置完整' : '待配置' }}
        </el-tag>
      </div>

      <el-form class="config-form" label-position="top">
        <el-form-item label="小程序 AppID">
          <el-input
            v-model="configForm.appId"
            aria-label="小程序 AppID"
            maxlength="18"
            placeholder="wx 开头的 18 位 AppID"
          />
        </el-form-item>
        <el-form-item label="AppSecret">
          <el-input
            v-model="configForm.appSecret"
            aria-label="小程序 AppSecret"
            autocomplete="new-password"
            show-password
            type="password"
            :placeholder="overview?.config.appSecretConfigured ? '已配置，留空则不修改' : '请输入 AppSecret'"
          />
        </el-form-item>
        <el-form-item label="CI 机器人编号">
          <el-input-number
            v-model="configForm.robot"
            aria-label="CI 机器人编号"
            :min="1"
            :max="30"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="代码上传密钥">
          <div class="key-upload-row">
            <el-upload
              :auto-upload="false"
              :show-file-list="false"
              accept=".key,.pem,.txt"
              :on-change="readPrivateKeyFile"
            >
              <el-button>
                <Icon icon="ep:key" />
                选择密钥文件
              </el-button>
            </el-upload>
            <span v-if="configForm.privateKey">已选择新密钥</span>
            <span v-else-if="overview?.config.privateKeyConfigured">
              已配置 · {{ overview.config.keyFingerprint }}
            </span>
            <span v-else>未配置</span>
          </div>
        </el-form-item>
      </el-form>

      <div class="config-meta-row">
        <span>CI 出口 IP</span>
        <code>{{ overview?.config.fixedEgressIp || '部署时配置 MINI_PROGRAM_CI_EGRESS_IP' }}</code>
        <el-tooltip v-if="overview?.config.fixedEgressIp" content="复制出口 IP">
          <el-button
            circle
            aria-label="复制 CI 出口 IP"
            @click="copyText(overview.config.fixedEgressIp)"
          >
            <Icon icon="ep:copy-document" />
          </el-button>
        </el-tooltip>
      </div>
      <div class="section-actions">
        <el-button type="primary" :loading="savingConfig" @click="saveConfig">
          <Icon icon="ep:check" />
          保存小程序配置
        </el-button>
      </div>
    </section>

    <section class="release-section">
      <div class="section-title-row">
        <div>
          <h4>微信服务器域名</h4>
          <p>当前 production 产物使用的域名，需在每个 AppID 的微信公众平台中配置。</p>
        </div>
      </div>
      <div class="domain-list">
        <div v-for="row in domainRows" :key="row.type" class="domain-row">
          <strong>{{ row.type }}</strong>
          <div>
            <code v-for="value in row.values" :key="value">{{ value }}</code>
          </div>
        </div>
      </div>
    </section>

    <section v-if="isSystemTenant" class="release-section">
      <div class="section-title-row">
        <div>
          <h4>发布统一版本产物</h4>
          <p>上传本地已构建完成、包含 project.config.json 的微信小程序 ZIP。</p>
        </div>
        <el-tag effect="plain">
          租户 1
        </el-tag>
      </div>
      <el-form class="artifact-form" label-position="top">
        <el-form-item label="版本号">
          <el-input
            v-model="versionForm.version"
            aria-label="版本号"
            maxlength="64"
            placeholder="例如 1.4.0"
          />
        </el-form-item>
        <el-form-item label="更新日志">
          <el-input
            v-model="versionForm.changelog"
            aria-label="更新日志"
            maxlength="1024"
            :rows="3"
            show-word-limit
            type="textarea"
          />
        </el-form-item>
        <el-form-item class="artifact-file-field" label="构建产物">
          <el-upload
            v-model:file-list="artifactFileList"
            :auto-upload="false"
            :limit="1"
            accept=".zip"
            drag
            :on-change="handleArtifactChange"
            :on-remove="handleArtifactRemove"
          >
            <Icon class="artifact-upload-icon" icon="ep:upload-filled" />
            <div class="el-upload__text">
              选择或拖入 ZIP 产物
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div class="section-actions">
        <el-button type="primary" :loading="uploadingArtifact" @click="uploadArtifact">
          <Icon icon="ep:upload" />
          发布版本产物
        </el-button>
      </div>
    </section>

    <section class="release-section">
      <div class="section-title-row">
        <div>
          <h4>可用版本</h4>
          <p>选择版本后，系统会把统一产物上传为当前 AppID 的开发版。</p>
        </div>
        <el-button :loading="loading" @click="fetchOverview(false, true)">
          <Icon icon="ep:refresh" />
          刷新
        </el-button>
      </div>
      <el-table :data="overview?.versions || []" empty-text="暂无可用版本">
        <el-table-column label="版本" min-width="130">
          <template #default="{ row }">
            <div class="version-cell">
              <strong>{{ row.version }}</strong>
              <el-tag v-if="isCurrentVersion(row.id)" size="small" type="success" effect="plain">
                当前开发版
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="changelog" label="更新日志" min-width="260" show-overflow-tooltip />
        <el-table-column label="产物" min-width="180">
          <template #default="{ row }">
            <span>{{ row.fileName }} · {{ formatFileSize(row.fileSize) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" min-width="170">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="租户上传状态" min-width="130">
          <template #default="{ row }">
            <el-tag
              v-if="getLatestUpload(row.id)"
              :type="statusMap[getLatestUpload(row.id)!.status].type"
              effect="plain"
            >
              {{ statusMap[getLatestUpload(row.id)!.status].label }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column align="right" label="操作" min-width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              :disabled="!configReady || hasActiveTask || isCurrentVersion(row.id)"
              :loading="creatingTaskVersionId === row.id"
              @click="createUploadTask(row)"
            >
              <Icon icon="ep:upload" />
              {{ isCurrentVersion(row.id) ? '已上传' : '上传到微信' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <section class="release-section release-section--last">
      <div class="section-title-row">
        <div>
          <h4>上传记录</h4>
          <p>这里只记录系统上传开发版的结果，审核和正式发布状态以微信公众平台为准。</p>
        </div>
      </div>
      <el-table :data="overview?.uploads || []" empty-text="暂无上传记录">
        <el-table-column prop="version" label="版本" width="120" />
        <el-table-column prop="appId" label="AppID" min-width="190" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status].type" effect="plain">
              {{ statusMap[row.status].label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="170">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="完成时间" min-width="170">
          <template #default="{ row }">
            {{ formatTime(row.finishedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="结果" min-width="260">
          <template #default="{ row }">
            <span v-if="row.status === 'SUCCESS'" class="upload-success-result">
              <Icon icon="ep:circle-check-filled" />
              上传成功，请去开发者平台发布审核
            </span>
            <el-button
              v-else-if="row.status === 'FAILED'"
              plain
              size="small"
              type="danger"
              @click="showUploadFailure(row.errorMessage)"
            >
              <Icon icon="ep:warning-filled" />
              查看失败原因
            </el-button>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-dialog
      v-model="uploadFailureDialogVisible"
      append-to-body
      title="上传失败原因"
      width="min(640px, calc(100vw - 32px))"
    >
      <div class="upload-failure-reason">
        {{ uploadFailureReason }}
      </div>
      <template #footer>
        <el-button type="primary" @click="uploadFailureDialogVisible = false">
          关闭
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.mini-program-release {
  min-height: 560px;
}

.upload-success-result {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--el-color-success);
  line-height: 20px;
}

.upload-failure-reason {
  max-height: min(50vh, 420px);
  overflow: auto;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-extra-light);
  color: var(--el-text-color-primary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  line-height: 1.6;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.release-section {
  padding: 24px 0 28px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  &--last {
    border-bottom: 0;
  }
}

.release-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding-top: 26px;
}

.summary-item {
  min-width: 0;
  min-height: 82px;
  padding: 0 20px;
  border-right: 1px solid var(--el-border-color-lighter);

  &:first-child {
    padding-left: 0;
  }

  &:last-child {
    border-right: 0;
  }

  .summary-label,
  strong,
  small {
    display: block;
  }

  .summary-label,
  small {
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  strong {
    overflow-wrap: anywhere;
    margin: 7px 0 5px;
    font-size: 18px;
    line-height: 24px;
  }

  :deep(.el-button) {
    height: 20px;
    padding: 0;
  }

  > :deep(.el-tag) {
    margin-top: 6px;
  }
}

.section-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;

  h4,
  p {
    margin: 0;
  }

  h4 {
    font-size: 15px;
    line-height: 22px;
  }

  p {
    margin-top: 4px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    line-height: 19px;
  }
}

.config-form {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(220px, 1fr) 160px;
  gap: 0 18px;
}

.config-form :deep(.el-form-item:last-child) {
  grid-column: 1 / -1;
}

.key-upload-row,
.config-meta-row,
.section-actions,
.version-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.key-upload-row span,
.config-meta-row span {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.config-meta-row {
  min-height: 44px;
  padding: 0 12px;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-extra-light);

  code {
    min-width: 0;
    overflow-wrap: anywhere;
    color: var(--el-text-color-primary);
  }

  :deep(.el-button) {
    margin-left: auto;
  }
}

.section-actions {
  justify-content: flex-end;
  margin-top: 18px;
}

.domain-list {
  border-top: 1px solid var(--el-border-color-lighter);
}

.domain-row {
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr);
  gap: 20px;
  padding: 13px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);

  strong {
    font-size: 13px;
  }

  div {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 20px;
  }

  code {
    overflow-wrap: anywhere;
    color: var(--el-text-color-regular);
  }
}

.artifact-form {
  display: grid;
  grid-template-columns: minmax(180px, 0.55fr) minmax(300px, 1fr);
  gap: 0 18px;
}

.artifact-file-field {
  grid-column: 1 / -1;
}

.artifact-file-field :deep(.el-upload),
.artifact-file-field :deep(.el-upload-dragger) {
  width: 100%;
}

.artifact-file-field :deep(.el-upload-dragger) {
  padding: 24px;
  border-radius: 4px;
}

.artifact-upload-icon {
  width: 28px;
  height: 28px;
  margin-bottom: 6px;
  color: var(--el-text-color-secondary);
}

.version-cell {
  flex-wrap: wrap;
}

.error-text {
  color: var(--el-color-danger);
  overflow-wrap: anywhere;
}

@media (max-width: 960px) {
  .release-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .summary-item:nth-child(2) {
    border-right: 0;
  }

  .summary-item:nth-child(n + 3) {
    margin-top: 20px;
  }

  .config-form {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .release-summary,
  .config-form,
  .artifact-form,
  .domain-row {
    grid-template-columns: minmax(0, 1fr);
  }

  .summary-item {
    margin-top: 18px;
    padding: 0;
    border-right: 0;
  }

  .summary-item:first-child {
    margin-top: 0;
  }

  .config-form :deep(.el-form-item:last-child),
  .artifact-file-field {
    grid-column: auto;
  }

  .section-title-row,
  .key-upload-row,
  .config-meta-row {
    align-items: stretch;
    flex-direction: column;
  }

  .config-meta-row {
    padding: 12px;
  }

  .config-meta-row :deep(.el-button) {
    margin-left: 0;
  }
}
</style>

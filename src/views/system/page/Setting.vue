<script setup lang="ts">
import type { SystemConfig } from '@/api/gamer/systemconfig'
import { SystemConfigApi } from '@/api/gamer/systemconfig'

const message = useMessage()

const activeTab = ref('basic')
const saving = ref(false)

// 配置键定义（与后端常量保持一致）
const CONFIG_KEYS = {
  // 站点配置
  siteLogoUrl: 'siteConfigLogoUrl',
  siteName: 'siteConfigSiteName',
  sitePrivacyContent: 'siteConfigPrivacyContent',
  siteIndexDialogContent: 'siteConfigIndexDialogContent',
  siteEnableRecycle: 'recycleConfigEnableRecycle',
  siteEnableVoiceRoom: 'siteConfigEnableVoiceRoom',
  siteCreateOrderContent: 'siteConfigCreateOrderContent',
  siteOrderDetailContent: 'siteConfigOrderDetailContent',
  siteFighterCenterContent: 'siteConfigFighterCenterContent',
  siteClubCenterContent: 'siteConfigClubCenterContent',
  siteHelpCenterContent: 'siteConfigHelpCenterContent',
  // 协议与保护
  userRegistrationAgreement: 'siteConfigUserRegisterAgreementContent',
  protectionOfMinors: 'siteConfigProtectionAgreementContent',
  // 服务订单配置
  orderVirtualCount: 'serviceOrderConfigVirtualCount',
  // 回收配置
  recyclingRuleDetail: 'recycleConfigRuleDetail',
  recyclingQrCode: 'recycleConfigQrCode',
} as const

// 每个 Tab 对应需要保存的 Key
const TAB_KEYS: Record<string, string[]> = {
  basic: [CONFIG_KEYS.siteLogoUrl, CONFIG_KEYS.siteName],
  home: [CONFIG_KEYS.siteEnableRecycle, CONFIG_KEYS.orderVirtualCount, CONFIG_KEYS.siteIndexDialogContent],
  mine: [CONFIG_KEYS.siteEnableVoiceRoom],
  privacy: [CONFIG_KEYS.sitePrivacyContent, CONFIG_KEYS.userRegistrationAgreement, CONFIG_KEYS.protectionOfMinors],
  order: [CONFIG_KEYS.siteCreateOrderContent],
  orderDetail: [CONFIG_KEYS.siteOrderDetailContent],
  fighterCenter: [CONFIG_KEYS.siteFighterCenterContent],
  clubCenter: [CONFIG_KEYS.siteClubCenterContent],
  helpCenter: [CONFIG_KEYS.siteHelpCenterContent],
  recycle: [CONFIG_KEYS.recyclingRuleDetail, CONFIG_KEYS.recyclingQrCode],
}

// 标题与描述（用于配置项的标题）
const TITLE_MAP: Record<string, string> = {
  [CONFIG_KEYS.siteLogoUrl]: '客户端 LOGO',
  [CONFIG_KEYS.siteName]: '网站名称',
  [CONFIG_KEYS.siteEnableRecycle]: '首页-是否开启回收',
  [CONFIG_KEYS.orderVirtualCount]: '首页-虚拟订单数量',
  [CONFIG_KEYS.siteIndexDialogContent]: '首页-弹窗内容',
  [CONFIG_KEYS.siteEnableVoiceRoom]: '是否开启语音房',
  [CONFIG_KEYS.sitePrivacyContent]: '隐私协议内容',
  [CONFIG_KEYS.userRegistrationAgreement]: '用户注册协议',
  [CONFIG_KEYS.protectionOfMinors]: '未成年人保护',
  [CONFIG_KEYS.siteCreateOrderContent]: '下单页面内容',
  [CONFIG_KEYS.siteOrderDetailContent]: '订单详情页内容',
  [CONFIG_KEYS.siteFighterCenterContent]: '打手中心页内容',
  [CONFIG_KEYS.siteClubCenterContent]: '俱乐部中心页内容',
  [CONFIG_KEYS.siteHelpCenterContent]: '帮助中心页内容',
  [CONFIG_KEYS.recyclingRuleDetail]: '回收规则详情',
  [CONFIG_KEYS.recyclingQrCode]: '回收二维码',
}

// 已存在配置的 map，便于 update
const existingMap = ref<Record<string, SystemConfig>>({})

// 表单数据
const form = reactive({
  siteLogoUrl: '' as string,
  siteName: '' as string,
  siteEnableRecycle: false as boolean,
  orderVirtualCount: 0 as number,
  siteIndexDialogContent: '' as string,
  siteEnableVoiceRoom: false as boolean,
  sitePrivacyContent: '' as string,
  userRegistrationAgreement: '' as string,
  protectionOfMinors: '' as string,
  siteCreateOrderContent: '' as string,
  siteOrderDetailContent: '' as string,
  siteFighterCenterContent: '' as string,
  siteClubCenterContent: '' as string,
  siteHelpCenterContent: '' as string,
  recyclingRuleDetail: '' as string,
  recyclingQrCode: '' as string,
})

// 工具：字符串 => 布尔
function toBool(val: any) {
  if (typeof val === 'boolean') return val
  if (val === 1 || val === '1' || val === 'true' || val === 'TRUE') return true
  return false
}

// 读取所有配置
async function fetchAll() {
  try {
    const data = await SystemConfigApi.getSystemConfigPage()
    const list: SystemConfig[] = data || []
    const map: Record<string, SystemConfig> = {}
    list.forEach((item) => {
      if (item.configKey) map[item.configKey] = item
    })
    existingMap.value = map

    // 回填表单
    if (map[CONFIG_KEYS.siteLogoUrl]) {
      form.siteLogoUrl = map[CONFIG_KEYS.siteLogoUrl].configValue || ''
    }
    if (map[CONFIG_KEYS.siteName]) {
      form.siteName = map[CONFIG_KEYS.siteName].configValue || ''
    }
    if (map[CONFIG_KEYS.siteEnableRecycle]) {
      form.siteEnableRecycle = toBool(map[CONFIG_KEYS.siteEnableRecycle].configValue)
    }
    if (map[CONFIG_KEYS.orderVirtualCount]) {
      const v = Number(map[CONFIG_KEYS.orderVirtualCount].configValue)
      form.orderVirtualCount = Number.isNaN(v) ? 0 : v
    }
    if (map[CONFIG_KEYS.siteIndexDialogContent]) {
      form.siteIndexDialogContent = map[CONFIG_KEYS.siteIndexDialogContent].configValue || ''
    }
    if (map[CONFIG_KEYS.siteEnableVoiceRoom]) {
      form.siteEnableVoiceRoom = toBool(map[CONFIG_KEYS.siteEnableVoiceRoom].configValue)
    }
    if (map[CONFIG_KEYS.sitePrivacyContent]) {
      form.sitePrivacyContent = map[CONFIG_KEYS.sitePrivacyContent].configValue || ''
    }
    if (map[CONFIG_KEYS.userRegistrationAgreement]) {
      form.userRegistrationAgreement = map[CONFIG_KEYS.userRegistrationAgreement].configValue || ''
    }
    if (map[CONFIG_KEYS.protectionOfMinors]) {
      form.protectionOfMinors = map[CONFIG_KEYS.protectionOfMinors].configValue || ''
    }
    if (map[CONFIG_KEYS.siteCreateOrderContent]) {
      form.siteCreateOrderContent = map[CONFIG_KEYS.siteCreateOrderContent].configValue || ''
    }
    if (map[CONFIG_KEYS.siteOrderDetailContent]) {
      form.siteOrderDetailContent = map[CONFIG_KEYS.siteOrderDetailContent].configValue || ''
    }
    if (map[CONFIG_KEYS.siteFighterCenterContent]) {
      form.siteFighterCenterContent = map[CONFIG_KEYS.siteFighterCenterContent].configValue || ''
    }
    if (map[CONFIG_KEYS.siteClubCenterContent]) {
      form.siteClubCenterContent = map[CONFIG_KEYS.siteClubCenterContent].configValue || ''
    }
    if (map[CONFIG_KEYS.siteHelpCenterContent]) {
      form.siteHelpCenterContent = map[CONFIG_KEYS.siteHelpCenterContent].configValue || ''
    }
    if (map[CONFIG_KEYS.recyclingRuleDetail]) {
      form.recyclingRuleDetail = map[CONFIG_KEYS.recyclingRuleDetail].configValue || ''
    }
    if (map[CONFIG_KEYS.recyclingQrCode]) {
      form.recyclingQrCode = map[CONFIG_KEYS.recyclingQrCode].configValue || ''
    }
  }
  catch (err) {
    console.error('加载配置失败:', err)
  }
}

// 根据配置键推断分组键
function resolveGroupKey(configKey: string): string | undefined {
  if (
    configKey === CONFIG_KEYS.siteLogoUrl
    || configKey === CONFIG_KEYS.siteName
    || configKey === CONFIG_KEYS.sitePrivacyContent
    || configKey === CONFIG_KEYS.userRegistrationAgreement
    || configKey === CONFIG_KEYS.protectionOfMinors
    || configKey === CONFIG_KEYS.siteIndexDialogContent
    || configKey === CONFIG_KEYS.siteEnableRecycle
    || configKey === CONFIG_KEYS.siteEnableVoiceRoom
    || configKey === CONFIG_KEYS.siteCreateOrderContent
    || configKey === CONFIG_KEYS.siteOrderDetailContent
    || configKey === CONFIG_KEYS.siteFighterCenterContent
    || configKey === CONFIG_KEYS.siteClubCenterContent
    || configKey === CONFIG_KEYS.siteHelpCenterContent
  ) {
    return 'siteConfig'
  }
  if (
    configKey === CONFIG_KEYS.recyclingRuleDetail
    || configKey === CONFIG_KEYS.recyclingQrCode
  ) {
    return 'recycleConfig'
  }
  return undefined
}

// 构造保存数据
function buildConfigs(keys: string[]): Partial<SystemConfig>[] {
  const payload: Partial<SystemConfig>[] = []
  keys.forEach((key) => {
    let value = ''
    switch (key) {
      case CONFIG_KEYS.siteLogoUrl:
        value = form.siteLogoUrl || ''
        break
      case CONFIG_KEYS.siteName:
        value = form.siteName || ''
        break
      case CONFIG_KEYS.userRegistrationAgreement:
        value = form.userRegistrationAgreement || ''
        break
      case CONFIG_KEYS.protectionOfMinors:
        value = form.protectionOfMinors || ''
        break
      case CONFIG_KEYS.siteEnableRecycle:
        value = form.siteEnableRecycle ? '1' : '0'
        break
      case CONFIG_KEYS.orderVirtualCount:
        value = String(form.orderVirtualCount ?? 0)
        break
      case CONFIG_KEYS.siteIndexDialogContent:
        value = form.siteIndexDialogContent || ''
        break
      case CONFIG_KEYS.siteEnableVoiceRoom:
        value = form.siteEnableVoiceRoom ? '1' : '0'
        break
      case CONFIG_KEYS.sitePrivacyContent:
        value = form.sitePrivacyContent || ''
        break
      case CONFIG_KEYS.siteCreateOrderContent:
        value = form.siteCreateOrderContent || ''
        break
      case CONFIG_KEYS.siteOrderDetailContent:
        value = form.siteOrderDetailContent || ''
        break
      case CONFIG_KEYS.siteFighterCenterContent:
        value = form.siteFighterCenterContent || ''
        break
      case CONFIG_KEYS.siteClubCenterContent:
        value = form.siteClubCenterContent || ''
        break
      case CONFIG_KEYS.siteHelpCenterContent:
        value = form.siteHelpCenterContent || ''
        break
      case CONFIG_KEYS.recyclingRuleDetail:
        value = form.recyclingRuleDetail || ''
        break
      case CONFIG_KEYS.recyclingQrCode:
        value = form.recyclingQrCode || ''
        break
    }

    const existing = existingMap.value[key]
    const configGroupKey = resolveGroupKey(key)
    if (existing) {
      payload.push({
        id: existing.id,
        configKey: key,
        configValue: value,
        configGroupKey,
        title: TITLE_MAP[key],
        description: existing.description,
      })
    }
    else {
      payload.push({
        configKey: key,
        configValue: value,
        configGroupKey,
        title: TITLE_MAP[key],
        description: '',
      })
    }
  })
  return payload
}

// 保存当前 Tab
async function saveCurrentTab() {
  const keys = TAB_KEYS[activeTab.value] || []
  await doSave(keys)
}

// 保存全部
async function saveAll() {
  const keys = Object.values(CONFIG_KEYS)
  await doSave(keys)
}

async function doSave(keys: string[]) {
  if (!keys.length) return
  saving.value = true
  try {
    const payload = buildConfigs(keys)
    // 拆分 update 与 create
    const tasks: Promise<any>[] = []
    payload.forEach((item) => {
      const params: any = {
        title: item.title,
        configKey: item.configKey,
        configValue: item.configValue,
      }
      if (item.id) {
        params.id = item.id
      }
      tasks.push(SystemConfigApi.updateSystem(item as SystemConfig))
    })
    await Promise.all(tasks)
    message.success('保存成功')
    await fetchAll()
  }
  catch (err) {
    console.error('保存失败:', err)
    message.error('保存失败')
  }
  finally {
    saving.value = false
  }
}

const reload = () => fetchAll()

onMounted(() => {
  fetchAll()
})
</script>

<template>
  <ContentWrap>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="基础配置" name="basic">
        <el-form label-width="140px" class="max-w-[900px]">
          <el-form-item label="客户端 LOGO">
            <UploadImg v-model="form.siteLogoUrl" />
          </el-form-item>
          <el-form-item label="网站名称">
            <el-input v-model="form.siteName" placeholder="请输入网站名称" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="首页配置" name="home">
        <el-form label-width="180px" class="max-w-[900px]">
          <el-form-item label="是否开启回收">
            <el-switch v-model="form.siteEnableRecycle" />
          </el-form-item>
          <el-form-item label="虚拟订单数量">
            <el-input-number v-model="form.orderVirtualCount" :min="0" class="!w-full" />
          </el-form-item>
          <el-form-item label="首页弹窗内容">
            <Editor v-model="form.siteIndexDialogContent" height="220px" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="“我的”页面配置" name="mine">
        <el-form label-width="180px" class="max-w-[900px]">
          <el-form-item label="是否开启语音房功能">
            <el-switch v-model="form.siteEnableVoiceRoom" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="隐私协议配置" name="privacy">
        <el-form label-width="140px" class="max-w-[900px]">
          <el-form-item label="隐私协议">
            <Editor v-model="form.sitePrivacyContent" height="300px" />
          </el-form-item>
          <el-form-item label="用户注册协议">
            <Editor v-model="form.userRegistrationAgreement" height="300px" />
          </el-form-item>
          <el-form-item label="未成年人保护">
            <Editor v-model="form.protectionOfMinors" height="300px" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="下单页面配置" name="order">
        <Editor v-model="form.siteCreateOrderContent" height="350px" />
      </el-tab-pane>

      <el-tab-pane label="订单详情页配置" name="orderDetail">
        <Editor v-model="form.siteOrderDetailContent" height="350px" />
      </el-tab-pane>

      <el-tab-pane label="打手中心页配置" name="fighterCenter">
        <Editor v-model="form.siteFighterCenterContent" height="350px" />
      </el-tab-pane>

      <el-tab-pane label="俱乐部中心页配置" name="clubCenter">
        <Editor v-model="form.siteClubCenterContent" height="350px" />
      </el-tab-pane>

      <el-tab-pane label="帮助中心页配置" name="helpCenter">
        <Editor v-model="form.siteHelpCenterContent" height="350px" />
      </el-tab-pane>

      <el-tab-pane label="回收配置" name="recycle">
        <el-form label-width="180px" class="max-w-[900px]">
          <el-form-item label="回收规则详情">
            <Editor v-model="form.recyclingRuleDetail" height="260px" />
          </el-form-item>
          <el-form-item label="回收二维码">
            <UploadImg v-model="form.recyclingQrCode" />
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <div class="mt-4 flex gap-2">
      <el-button type="primary" :loading="saving" @click="saveCurrentTab">
        保存当前
      </el-button>
      <el-button :loading="saving" @click="saveAll">
        保存全部
      </el-button>
      <el-button @click="reload">
        刷新
      </el-button>
    </div>
  </ContentWrap>
</template>

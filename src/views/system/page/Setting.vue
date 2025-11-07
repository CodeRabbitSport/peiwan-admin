<script setup lang="ts">
import type { SystemConfig } from '@/api/gamer/systemconfig'
import { SystemConfigApi } from '@/api/gamer/systemconfig'
import { TenantNew_getAssessmentCode, TenantNew_refreshAssessmentCode } from '@/api/system/tenant'
import { useAppStore } from '@/store/modules/app'

const message = useMessage()
const appStore = useAppStore()

const activeTab = ref('basic')
const saving = ref(false)
const assessmentCode = ref<string>('')

// 配置键定义（与后端常量保持一致）
const CONFIG_KEYS = {
  // 站点配置
  siteLogoUrl: 'siteConfigLogoUrl',
  siteName: 'siteConfigSiteName',
  sitePrivacyContent: 'siteConfigPrivacyContent',
  siteIndexDialogContent: 'siteConfigIndexDialogContent',
  siteConfigEnableIndexDialog: 'siteConfigEnableIndexDialog',
  siteEnableRecycle: 'recycleConfigEnableRecycle',
  siteEnableVoiceRoom: 'siteConfigEnableVoiceRoom',
  siteCreateOrderContent: 'siteConfigCreateOrderContent',
  siteOrderDetailContent: 'siteConfigOrderDetailContent',
  siteFighterCenterContent: 'siteConfigFighterCenterContent',
  siteClubCenterContent: 'siteConfigClubCenterContent',
  siteHelpCenterContent: 'siteConfigHelpCenterContent',
  // 新增-富文本协议
  aboutUsContent: 'siteConfigAboutUsContent',
  employmentAgreementContent: 'siteConfigEmploymentAgreementContent',
  pickOrderAgreementContent: 'siteConfigPickOrderAgreementContent',
  // 协议与保护
  userRegistrationAgreement: 'siteConfigUserRegisterAgreementContent',
  protectionOfMinors: 'siteConfigProtectionAgreementContent',
  // 服务订单配置
  orderVirtualCount: 'serviceOrderConfigVirtualCount',
  // 回收配置
  recyclingRuleDetail: 'recycleConfigRuleDetail',
  recyclingQrCode: 'recycleConfigQrCode',
  siteConfigGlobalProductPlacementMap: 'siteConfigGlobalProductPlacementMap',
  siteConfigEnableAssessmentCode: 'siteConfigEnableAssessmentCode',
  siteConfigAssessmentGroupQrCode: 'siteConfigAssessmentGroupQrCode',
  siteConfigBlindBoxAnnouncement: 'siteConfigBlindBoxAnnouncement',
} as const

// 每个 Tab 对应需要保存的 Key（按语义细分分组）
const TAB_KEYS: Record<string, string[]> = {
  basic: [
    CONFIG_KEYS.siteLogoUrl,
    CONFIG_KEYS.siteName,
    CONFIG_KEYS.siteConfigGlobalProductPlacementMap,
    CONFIG_KEYS.siteConfigEnableAssessmentCode,
    CONFIG_KEYS.siteConfigAssessmentGroupQrCode,
  ],
  home: [CONFIG_KEYS.orderVirtualCount, CONFIG_KEYS.siteIndexDialogContent, CONFIG_KEYS.siteConfigEnableIndexDialog, CONFIG_KEYS.siteConfigBlindBoxAnnouncement],
  mine: [CONFIG_KEYS.siteEnableVoiceRoom],
  // 页面内容细分
  orderPages: [CONFIG_KEYS.siteCreateOrderContent, CONFIG_KEYS.siteOrderDetailContent],
  centerPages: [CONFIG_KEYS.siteFighterCenterContent, CONFIG_KEYS.siteClubCenterContent],
  helpCenterPage: [CONFIG_KEYS.siteHelpCenterContent],
  // 协议与说明细分
  userAgreementTab: [CONFIG_KEYS.userRegistrationAgreement],
  privacyProtectionTab: [CONFIG_KEYS.sitePrivacyContent, CONFIG_KEYS.protectionOfMinors],
  aboutTab: [CONFIG_KEYS.aboutUsContent],
  rulesTab: [CONFIG_KEYS.employmentAgreementContent, CONFIG_KEYS.pickOrderAgreementContent],
  recycle: [CONFIG_KEYS.siteEnableRecycle, CONFIG_KEYS.recyclingRuleDetail, CONFIG_KEYS.recyclingQrCode],
}

// 获取当前考核码
async function fetchAssessmentCode() {
  try {
    await TenantNew_refreshAssessmentCode({})
    assessmentCode.value = await TenantNew_getAssessmentCode({})
  }
  catch (err) {
    console.error('获取考核码失败:', err)
    message.error('获取考核码失败')
  }
}

// 标题与描述（用于配置项的标题）
const TITLE_MAP: Record<string, string> = {
  [CONFIG_KEYS.siteLogoUrl]: '客户端 LOGO',
  [CONFIG_KEYS.siteName]: '网站名称',
  [CONFIG_KEYS.siteConfigGlobalProductPlacementMap]: '商品全局底部图',
  [CONFIG_KEYS.siteEnableRecycle]: '首页-是否开启回收',
  [CONFIG_KEYS.orderVirtualCount]: '首页-虚拟订单数量',
  [CONFIG_KEYS.siteIndexDialogContent]: '首页-弹窗内容',
  [CONFIG_KEYS.siteConfigEnableIndexDialog]: '首页-是否开启弹窗',
  [CONFIG_KEYS.siteEnableVoiceRoom]: '是否开启语音房',
  [CONFIG_KEYS.sitePrivacyContent]: '隐私协议内容',
  [CONFIG_KEYS.userRegistrationAgreement]: '用户注册协议',
  [CONFIG_KEYS.protectionOfMinors]: '未成年人保护',
  [CONFIG_KEYS.siteCreateOrderContent]: '下单页面内容',
  [CONFIG_KEYS.siteOrderDetailContent]: '订单详情页内容',
  [CONFIG_KEYS.siteFighterCenterContent]: '打手中心页内容',
  [CONFIG_KEYS.siteClubCenterContent]: '俱乐部中心页内容',
  [CONFIG_KEYS.siteHelpCenterContent]: '帮助中心页内容',
  [CONFIG_KEYS.aboutUsContent]: '关于我们',
  [CONFIG_KEYS.employmentAgreementContent]: '入职陪玩协议',
  [CONFIG_KEYS.pickOrderAgreementContent]: '接单规则',
  [CONFIG_KEYS.recyclingRuleDetail]: '回收规则详情',
  [CONFIG_KEYS.recyclingQrCode]: '回收二维码',
  [CONFIG_KEYS.siteConfigEnableAssessmentCode]: '是否开启考核码',
  [CONFIG_KEYS.siteConfigAssessmentGroupQrCode]: '考核群二维码',
  [CONFIG_KEYS.siteConfigBlindBoxAnnouncement]: '盲盒公告',
}

// 已存在配置的 map，便于 update
const existingMap = ref<Record<string, SystemConfig>>({})

// 表单数据
const form = reactive({
  siteLogoUrl: '' as string,
  siteName: '' as string,
  siteConfigGlobalProductPlacementMap: '' as string,
  siteConfigEnableAssessmentCode: false as boolean,
  siteConfigAssessmentGroupQrCode: '' as string,
  siteEnableRecycle: false as boolean,
  orderVirtualCount: '' as string,
  siteIndexDialogContent: '' as string,
  siteConfigEnableIndexDialog: false as boolean,
  siteEnableVoiceRoom: false as boolean,
  sitePrivacyContent: '' as string,
  userRegistrationAgreement: '' as string,
  protectionOfMinors: '' as string,
  siteCreateOrderContent: '' as string,
  siteOrderDetailContent: '' as string,
  siteFighterCenterContent: '' as string,
  siteClubCenterContent: '' as string,
  siteHelpCenterContent: '' as string,
  aboutUsContent: '' as string,
  employmentAgreementContent: '' as string,
  pickOrderAgreementContent: '' as string,
  recyclingRuleDetail: '' as string,
  recyclingQrCode: '' as string,
  siteConfigBlindBoxAnnouncement: '' as string,
})

// 工具：字符串 => 布尔
function toBool(val: any) {
  if (typeof val === 'boolean') return val
  if (val === 1 || val === 'true' || val === 'true' || val === 'TRUE') return true
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
      form.orderVirtualCount = map[CONFIG_KEYS.orderVirtualCount].configValue || ''
    }
    if (map[CONFIG_KEYS.siteIndexDialogContent]) {
      form.siteIndexDialogContent = map[CONFIG_KEYS.siteIndexDialogContent].configValue || ''
    }
    if (map[CONFIG_KEYS.siteConfigGlobalProductPlacementMap]) {
      form.siteConfigGlobalProductPlacementMap = map[CONFIG_KEYS.siteConfigGlobalProductPlacementMap].configValue || ''
    }
    if (map[CONFIG_KEYS.siteConfigEnableAssessmentCode]) {
      form.siteConfigEnableAssessmentCode = toBool(map[CONFIG_KEYS.siteConfigEnableAssessmentCode].configValue)
    }
    if (map[CONFIG_KEYS.siteConfigAssessmentGroupQrCode]) {
      form.siteConfigAssessmentGroupQrCode = map[CONFIG_KEYS.siteConfigAssessmentGroupQrCode].configValue || ''
    }
    if (map[CONFIG_KEYS.siteConfigEnableIndexDialog]) {
      form.siteConfigEnableIndexDialog = toBool(map[CONFIG_KEYS.siteConfigEnableIndexDialog].configValue)
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
    if (map[CONFIG_KEYS.aboutUsContent]) {
      form.aboutUsContent = map[CONFIG_KEYS.aboutUsContent].configValue || ''
    }
    if (map[CONFIG_KEYS.employmentAgreementContent]) {
      form.employmentAgreementContent = map[CONFIG_KEYS.employmentAgreementContent].configValue || ''
    }
    if (map[CONFIG_KEYS.pickOrderAgreementContent]) {
      form.pickOrderAgreementContent = map[CONFIG_KEYS.pickOrderAgreementContent].configValue || ''
    }
    if (map[CONFIG_KEYS.recyclingRuleDetail]) {
      form.recyclingRuleDetail = map[CONFIG_KEYS.recyclingRuleDetail].configValue || ''
    }
    if (map[CONFIG_KEYS.recyclingQrCode]) {
      form.recyclingQrCode = map[CONFIG_KEYS.recyclingQrCode].configValue || ''
    }
    if (map[CONFIG_KEYS.siteConfigBlindBoxAnnouncement]) {
      form.siteConfigBlindBoxAnnouncement = map[CONFIG_KEYS.siteConfigBlindBoxAnnouncement].configValue || ''
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
    || configKey === CONFIG_KEYS.siteConfigEnableIndexDialog
    || configKey === CONFIG_KEYS.siteConfigGlobalProductPlacementMap
    || configKey === CONFIG_KEYS.siteConfigEnableAssessmentCode
    || configKey === CONFIG_KEYS.siteConfigAssessmentGroupQrCode
    || configKey === CONFIG_KEYS.siteEnableRecycle
    || configKey === CONFIG_KEYS.siteEnableVoiceRoom
    || configKey === CONFIG_KEYS.siteCreateOrderContent
    || configKey === CONFIG_KEYS.siteOrderDetailContent
    || configKey === CONFIG_KEYS.siteFighterCenterContent
    || configKey === CONFIG_KEYS.siteClubCenterContent
    || configKey === CONFIG_KEYS.siteHelpCenterContent
    || configKey === CONFIG_KEYS.aboutUsContent
    || configKey === CONFIG_KEYS.employmentAgreementContent
    || configKey === CONFIG_KEYS.pickOrderAgreementContent
    || configKey === CONFIG_KEYS.siteConfigBlindBoxAnnouncement
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
        value = form.siteEnableRecycle ? 'true' : 'false'
        break
      case CONFIG_KEYS.orderVirtualCount:
        value = String(form.orderVirtualCount ?? 0)
        break
      case CONFIG_KEYS.siteIndexDialogContent:
        value = form.siteIndexDialogContent || ''
        break
      case CONFIG_KEYS.siteConfigGlobalProductPlacementMap:
        value = form.siteConfigGlobalProductPlacementMap || ''
        break
      case CONFIG_KEYS.siteConfigEnableAssessmentCode:
        value = form.siteConfigEnableAssessmentCode ? 'true' : 'false'
        break
      case CONFIG_KEYS.siteConfigAssessmentGroupQrCode:
        value = form.siteConfigAssessmentGroupQrCode || ''
        break
      case CONFIG_KEYS.siteConfigEnableIndexDialog:
        value = form.siteConfigEnableIndexDialog ? 'true' : 'false'
        break
      case CONFIG_KEYS.siteEnableVoiceRoom:
        value = form.siteEnableVoiceRoom ? 'true' : 'false'
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
      case CONFIG_KEYS.aboutUsContent:
        value = form.aboutUsContent || ''
        break
      case CONFIG_KEYS.employmentAgreementContent:
        value = form.employmentAgreementContent || ''
        break
      case CONFIG_KEYS.pickOrderAgreementContent:
        value = form.pickOrderAgreementContent || ''
        break
      case CONFIG_KEYS.recyclingRuleDetail:
        value = form.recyclingRuleDetail || ''
        break
      case CONFIG_KEYS.recyclingQrCode:
        value = form.recyclingQrCode || ''
        break
      case CONFIG_KEYS.siteConfigBlindBoxAnnouncement:
        value = form.siteConfigBlindBoxAnnouncement || ''
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

    // 如果保存的是 Logo 或网站名称，同步更新 app store
    if (keys.includes(CONFIG_KEYS.siteLogoUrl) && form.siteLogoUrl) {
      appStore.setSiteLogoUrl(form.siteLogoUrl)
    }
    if (keys.includes(CONFIG_KEYS.siteName) && form.siteName) {
      appStore.setSiteName(form.siteName)
    }
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
  fetchAssessmentCode()
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
          <el-form-item label="商品全局底部图">
            <UploadImg v-model="form.siteConfigGlobalProductPlacementMap" />
          </el-form-item>
          <el-form-item label="是否开启考核码">
            <el-switch v-model="form.siteConfigEnableAssessmentCode" />
          </el-form-item>
          <el-form-item label="考核群二维码">
            <UploadImg v-model="form.siteConfigAssessmentGroupQrCode" />
          </el-form-item>
          <el-form-item label="当前考核码">
            <div class="w-full flex items-center gap-2">
              <el-input v-model="assessmentCode" disabled />
              <el-button size="small" @click="fetchAssessmentCode">
                刷新
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="首页配置" name="home">
        <el-form label-width="180px" class="max-w-[900px]">
          <el-form-item label="是否启用首页弹窗">
            <el-switch v-model="form.siteConfigEnableIndexDialog" />
          </el-form-item>
          <el-form-item label="首页弹窗图片">
            <UploadImg v-model="form.siteIndexDialogContent" />
          </el-form-item>
          <el-form-item label="首页通知内容">
            <Editor v-model="form.orderVirtualCount" height="250px" />
          </el-form-item>
          <!-- 抽奖公告 -->
          <el-form-item label="盲盒公告">
            <Editor v-model="form.siteConfigBlindBoxAnnouncement" height="250px" />
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

      <el-tab-pane label="下单与订单页面" name="orderPages">
        <el-form label-width="140px" class="max-w-[900px]">
          <el-form-item label="下单页面内容">
            <Editor v-model="form.siteCreateOrderContent" height="350px" />
          </el-form-item>
          <el-form-item label="订单详情页内容">
            <Editor v-model="form.siteOrderDetailContent" height="350px" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="中心页面配置" name="centerPages">
        <el-form label-width="140px" class="max-w-[900px]">
          <el-form-item label="打手中心页内容">
            <Editor v-model="form.siteFighterCenterContent" height="350px" />
          </el-form-item>
          <el-form-item label="俱乐部中心页内容">
            <Editor v-model="form.siteClubCenterContent" height="350px" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="帮助中心页面" name="helpCenterPage">
        <el-form label-width="140px" class="max-w-[900px]">
          <el-form-item label="帮助中心页内容">
            <Editor v-model="form.siteHelpCenterContent" height="350px" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="用户协议" name="userAgreementTab">
        <el-form label-width="140px" class="max-w-[900px]">
          <el-form-item label="用户注册协议">
            <Editor v-model="form.userRegistrationAgreement" height="300px" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="隐私与保护" name="privacyProtectionTab">
        <el-form label-width="140px" class="max-w-[900px]">
          <el-form-item label="隐私协议">
            <Editor v-model="form.sitePrivacyContent" height="300px" />
          </el-form-item>
          <el-form-item label="未成年人保护">
            <Editor v-model="form.protectionOfMinors" height="300px" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="关于我们" name="aboutTab">
        <el-form label-width="140px" class="max-w-[900px]">
          <el-form-item label="关于我们">
            <Editor v-model="form.aboutUsContent" height="300px" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="规则与说明" name="rulesTab">
        <el-form label-width="140px" class="max-w-[900px]">
          <el-form-item label="入职陪玩协议">
            <Editor v-model="form.employmentAgreementContent" height="300px" />
          </el-form-item>
          <el-form-item label="接单规则">
            <Editor v-model="form.pickOrderAgreementContent" height="300px" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="回收配置" name="recycle">
        <el-form label-width="180px" class="max-w-[900px]">
          <el-form-item label="是否开启回收">
            <el-switch v-model="form.siteEnableRecycle" />
          </el-form-item>
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

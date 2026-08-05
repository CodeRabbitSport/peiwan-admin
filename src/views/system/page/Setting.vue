<script setup lang="ts">
import type { PageDecorationPreview, SystemConfig } from '@/api/gamer/systemconfig'
import { SystemConfigApi } from '@/api/gamer/systemconfig'
import { getTenant, TenantNew_getAssessmentCode, TenantNew_refreshAssessmentCode } from '@/api/system/tenant'
import UploadImg from '@/components/UploadFile/src/UploadImg.vue'
import { useAppStore } from '@/store/modules/app'
import { getTenantId } from '@/utils/auth'

import MiniProgramRelease from './components/MiniProgramRelease.vue'

defineOptions({ name: 'PageSetting' })

const message = useMessage()
const appStore = useAppStore()
const route = useRoute()

const activeSection = ref('site')
const activeDecorationPage = ref('home')
const saving = ref(false)
const loading = ref(false)
const assessmentCode = ref('')

const CONFIG_KEYS = {
  siteLogoUrl: 'siteConfigLogoUrl',
  siteName: 'siteConfigSiteName',
  sitePrivacyContent: 'siteConfigPrivacyContent',
  siteIndexDialogContent: 'siteConfigIndexDialogContent',
  siteConfigEnableIndexDialog: 'siteConfigEnableIndexDialog',
  siteIndexDialogFrequency: 'siteConfigIndexDialogFrequency',
  siteConfigEnableEveryEnterIndexDialog: 'siteConfigEnableEveryEnterIndexDialog',
  siteEnableRecycle: 'recycleConfigEnableRecycle',
  siteEnableVoiceRoom: 'siteConfigEnableVoiceRoom',
  siteCreateOrderContent: 'siteConfigCreateOrderContent',
  siteOrderDetailContent: 'siteConfigOrderDetailContent',
  siteFighterCenterContent: 'siteConfigFighterCenterContent',
  siteClubCenterContent: 'siteConfigClubCenterContent',
  siteHelpCenterContent: 'siteConfigHelpCenterContent',
  aboutUsContent: 'siteConfigAboutUsContent',
  employmentAgreementContent: 'siteConfigEmploymentAgreementContent',
  pickOrderAgreementContent: 'siteConfigPickOrderAgreementContent',
  userRegistrationAgreement: 'siteConfigUserRegisterAgreementContent',
  protectionOfMinors: 'siteConfigProtectionAgreementContent',
  orderVirtualCount: 'serviceOrderConfigVirtualCount',
  recyclingRuleDetail: 'recycleConfigRuleDetail',
  recyclingQrCode: 'recycleConfigQrCode',
  siteConfigGlobalProductPlacementMap: 'siteConfigGlobalProductPlacementMap',
  siteConfigEnableAssessmentCode: 'siteConfigEnableAssessmentCode',
  siteConfigAssessmentGroupQrCode: 'siteConfigAssessmentGroupQrCode',
  siteConfigBlindBoxAnnouncement: 'siteConfigBlindBoxAnnouncement',
  decorationThemeColor: 'decorationConfigThemeColor',
  decorationThemeTokens: 'decorationConfigThemeTokens',
  decorationThemeConfig: 'decorationConfigTheme',
  decorationHomeBackground: 'decorationConfigHomeBackground',
  decorationMineBackground: 'decorationConfigMineBackground',
  decorationOrderBackground: 'decorationConfigOrderBackground',
  decorationRankBackground: 'decorationConfigRankBackground',
  decorationApplyBackground: 'decorationConfigApplyBackground',
  decorationApplyButton: 'decorationConfigApplyButton',
  escortText: 'copywritingConfigEscortText',
  companionText: 'copywritingConfigCompanionText',
  rankText: 'copywritingConfigRankText',
} as const

type ConfigKey = (typeof CONFIG_KEYS)[keyof typeof CONFIG_KEYS]
type FormField = keyof typeof form

interface NavItem {
  key: string
  label: string
  description: string
  icon: string
  count: number
}

const topSections: NavItem[] = [
  {
    key: 'site',
    label: '站点基础',
    description: '品牌、考核与通用素材',
    icon: 'ep:monitor',
    count: 7,
  },
  {
    key: 'home',
    label: '首页运营',
    description: '弹窗、公告与功能开关',
    icon: 'ep:house',
    count: 6,
  },
  {
    key: 'mine',
    label: '我的页面',
    description: '个人中心功能开关',
    icon: 'ep:user',
    count: 1,
  },
  {
    key: 'decoration',
    label: '页面装修',
    description: '主题、背景图与页面文案',
    icon: 'ep:brush',
    count: 10,
  },
  {
    key: 'content',
    label: '页面内容',
    description: '订单、中心与帮助页内容',
    icon: 'ep:document',
    count: 5,
  },
  {
    key: 'agreement',
    label: '协议说明',
    description: '协议、隐私与平台规则',
    icon: 'ep:tickets',
    count: 6,
  },
  {
    key: 'miniProgram',
    label: '小程序',
    description: '统一产物与微信上传',
    icon: 'ep:promotion',
    count: 4,
  },
  {
    key: 'recycle',
    label: '回收配置',
    description: '回收入口、规则与二维码',
    icon: 'ep:refresh-left',
    count: 3,
  },
]

function getRouteSection() {
  const metaQuery = route.meta.query as Record<string, unknown> | undefined
  const section = route.query.section ?? metaQuery?.section
  return typeof section === 'string' ? section : ''
}

watch(
  getRouteSection,
  (section) => {
    activeSection.value = topSections.some(item => item.key === section) ? section : 'site'
  },
  { immediate: true },
)

const decorationPages = [
  { key: 'home', label: '首页', description: '顶部视觉与导航文案', icon: 'ep:house' },
  { key: 'mine', label: '我的', description: '个人中心顶部背景', icon: 'ep:user' },
  { key: 'order', label: '陪玩下单', description: '快速派单页面背景', icon: 'ep:shopping-bag' },
  { key: 'rank', label: '排行榜', description: '榜单顶部主视觉', icon: 'ep:trophy' },
  { key: 'apply', label: '申请接单', description: '小程序招募页素材', icon: 'ep:promotion' },
]

const DEFAULT_DECORATION = {
  decorationThemeColor: '#FEC328',
  decorationHomeBackground: '',
  decorationMineBackground: '',
  decorationOrderBackground: '',
  decorationRankBackground: '',
  decorationApplyBackground: '',
  decorationApplyButton: '',
  escortText: '护航',
  companionText: '陪玩',
  rankText: '排行榜',
} as const

/**
 * 主题色系通过一个 JSON 配置保存，方便客户端新增 token 时保持向后兼容。
 * 单色 decorationConfigThemeColor 仍然保留，作为 primaryColor 的兼容来源；
 * 主题 JSON 同时写入 decorationConfigThemeTokens（新键）和 decorationConfigTheme（旧别名）。
 */
const DEFAULT_DECORATION_THEME = {
  primaryColor: '#FEC328',
  accentColor: '#FEC328',
  primaryTextColor: '#48371E',
  textColor: '#48371E',
  textSecondaryColor: '#806D4E',
  textMutedColor: '#9C8C71',
  textPlaceholderColor: '#B8AD9C',
  pageBackgroundColor: '#FDFDFB',
  surfaceColor: '#FFFDF8',
  surfaceMutedColor: '#FBF5E5',
  surfaceDeepColor: '#F5E5BB',
  surfaceWarmColor: '#FDFAF2',
  surfaceHighlightColor: '#FFF7DF',
  surfaceCoolColor: '#D9FBFF',
  borderColor: '#FFE8B8',
  borderStrongColor: '#F2C55D',
  darkColor: '#48371E',
  lightTextColor: '#FFFAF2',
  headerGradientStartColor: '#FDE081',
  headerGradientEndColor: 'rgb(253 224 129 / 0%)',
  shadowColor: 'rgb(72 55 30 / 16%)',
  overlayColor: 'rgb(72 55 30 / 62%)',
  successColor: '#25A969',
  warningColor: '#FB7F18',
  dangerColor: '#E65A4F',
  genderFemaleColor: '#F287C0',
  buttonPrimaryColor: '#FEC328',
  buttonPrimaryTextColor: '#48371E',
  buttonHighlightColor: 'rgb(255 255 255 / 35%)',
  buttonHighlightSubtleColor: 'rgb(255 255 255 / 12%)',
  buttonOutlineColor: '#FFFDF8',
  buttonDarkColor: '#48371E',
  buttonDarkTextColor: '#FFFAF2',
  popupBackgroundColor: '#FFF8E6',
  navbarTextColor: '#48371E',
  navbarBackgroundColor: 'transparent',
  navbarBorderColor: '#FFE8B8',
  pageBackgroundImage: '',
  headerBackgroundImage: '/static/ui-v2/header-bg.png',
  loginBackgroundImage: '/static/ui-v2/login/login-bg.png',
  popupBackgroundImage: '',
} as const

type DecorationThemeConfig = Record<keyof typeof DEFAULT_DECORATION_THEME, string>

const MOBILE_PREVIEW_ASSET_BASE = 'https://kuaiyoudj.oss-cn-beijing.aliyuncs.com/static'
const previewAssets = {
  homeBackground: `${MOBILE_PREVIEW_ASSET_BASE}/images/index/top.png`,
  noticeBackground: `${MOBILE_PREVIEW_ASSET_BASE}/noticeBar.png`,
  rankBackground: `${MOBILE_PREVIEW_ASSET_BASE}/rank/rank-top-background.png`,
  rankPodium: `${MOBILE_PREVIEW_ASSET_BASE}/rank/rank-podium.png`,
  podiumFirst: `${MOBILE_PREVIEW_ASSET_BASE}/rank/podium-first.png`,
  podiumSecond: `${MOBILE_PREVIEW_ASSET_BASE}/rank/podium-second.png`,
  podiumThird: `${MOBILE_PREVIEW_ASSET_BASE}/rank/podium-third.png`,
  mineSettings: `${MOBILE_PREVIEW_ASSET_BASE}/me-redesign/settings.png`,
  mineWealth: `${MOBILE_PREVIEW_ASSET_BASE}/me-redesign/wealth.png`,
  mineCharm: `${MOBILE_PREVIEW_ASSET_BASE}/me-redesign/charm.png`,
  mineCrown: `${MOBILE_PREVIEW_ASSET_BASE}/me-redesign/crown.png`,
  mineBalance: `${MOBILE_PREVIEW_ASSET_BASE}/me-redesign/balance.png`,
  mineCoupon: `${MOBILE_PREVIEW_ASSET_BASE}/me-redesign/coupon-round.png`,
  mineOrder: `${MOBILE_PREVIEW_ASSET_BASE}/me-redesign/order-round.png`,
  applyBackground: 'https://cdnel.ttgongju.com/elongapp_images/shenqing_bg4.png',
  applyButton: 'https://cdnel.ttgongju.com/elongapp_images/shenqing_button.png',
}
const previewRankPlayers = [
  { rank: 2, score: 286, name: '星河', frame: previewAssets.podiumSecond },
  { rank: 1, score: 520, name: '清风', frame: previewAssets.podiumFirst },
  { rank: 3, score: 198, name: '小鹿', frame: previewAssets.podiumThird },
]

const TITLE_MAP: Record<ConfigKey, string> = {
  [CONFIG_KEYS.siteLogoUrl]: '客户端 LOGO',
  [CONFIG_KEYS.siteName]: '网站名称',
  [CONFIG_KEYS.sitePrivacyContent]: '隐私协议',
  [CONFIG_KEYS.siteIndexDialogContent]: '首页弹窗图片',
  [CONFIG_KEYS.siteConfigEnableIndexDialog]: '首页弹窗开关',
  [CONFIG_KEYS.siteIndexDialogFrequency]: '首页弹窗频率',
  [CONFIG_KEYS.siteConfigEnableEveryEnterIndexDialog]: '首页选择游戏弹窗频率',
  [CONFIG_KEYS.siteEnableRecycle]: '首页回收开关',
  [CONFIG_KEYS.siteEnableVoiceRoom]: '语音房开关',
  [CONFIG_KEYS.siteCreateOrderContent]: '下单页面内容',
  [CONFIG_KEYS.siteOrderDetailContent]: '订单详情页内容',
  [CONFIG_KEYS.siteFighterCenterContent]: '打手中心页内容',
  [CONFIG_KEYS.siteClubCenterContent]: '俱乐部中心页内容',
  [CONFIG_KEYS.siteHelpCenterContent]: '帮助中心页内容',
  [CONFIG_KEYS.aboutUsContent]: '关于我们',
  [CONFIG_KEYS.employmentAgreementContent]: '入职陪玩协议',
  [CONFIG_KEYS.pickOrderAgreementContent]: '接单规则',
  [CONFIG_KEYS.userRegistrationAgreement]: '用户注册协议',
  [CONFIG_KEYS.protectionOfMinors]: '未成年人保护',
  [CONFIG_KEYS.orderVirtualCount]: '首页通知内容',
  [CONFIG_KEYS.recyclingRuleDetail]: '回收规则详情',
  [CONFIG_KEYS.recyclingQrCode]: '回收二维码',
  [CONFIG_KEYS.siteConfigGlobalProductPlacementMap]: '商品全局底部图',
  [CONFIG_KEYS.siteConfigEnableAssessmentCode]: '考核码开关',
  [CONFIG_KEYS.siteConfigAssessmentGroupQrCode]: '考核群二维码',
  [CONFIG_KEYS.siteConfigBlindBoxAnnouncement]: '盲盒公告',
  [CONFIG_KEYS.decorationThemeColor]: '客户端主题色',
  [CONFIG_KEYS.decorationThemeTokens]: '客户端主题色系',
  [CONFIG_KEYS.decorationThemeConfig]: '客户端主题色系',
  [CONFIG_KEYS.decorationHomeBackground]: '首页背景图',
  [CONFIG_KEYS.decorationMineBackground]: '我的页面背景图',
  [CONFIG_KEYS.decorationOrderBackground]: '陪玩下单页背景图',
  [CONFIG_KEYS.decorationRankBackground]: '排行榜背景图',
  [CONFIG_KEYS.decorationApplyBackground]: '申请接单页背景图',
  [CONFIG_KEYS.decorationApplyButton]: '申请接单页按钮图',
  [CONFIG_KEYS.escortText]: '护航文字',
  [CONFIG_KEYS.companionText]: '陪玩文字',
  [CONFIG_KEYS.rankText]: '排行榜文字',
}

const FIELD_BY_KEY: Record<ConfigKey, FormField> = {
  [CONFIG_KEYS.siteLogoUrl]: 'siteLogoUrl',
  [CONFIG_KEYS.siteName]: 'siteName',
  [CONFIG_KEYS.sitePrivacyContent]: 'sitePrivacyContent',
  [CONFIG_KEYS.siteIndexDialogContent]: 'siteIndexDialogContent',
  [CONFIG_KEYS.siteConfigEnableIndexDialog]: 'siteConfigEnableIndexDialog',
  [CONFIG_KEYS.siteIndexDialogFrequency]: 'siteIndexDialogFrequency',
  [CONFIG_KEYS.siteConfigEnableEveryEnterIndexDialog]: 'siteConfigEnableEveryEnterIndexDialog',
  [CONFIG_KEYS.siteEnableRecycle]: 'siteEnableRecycle',
  [CONFIG_KEYS.siteEnableVoiceRoom]: 'siteEnableVoiceRoom',
  [CONFIG_KEYS.siteCreateOrderContent]: 'siteCreateOrderContent',
  [CONFIG_KEYS.siteOrderDetailContent]: 'siteOrderDetailContent',
  [CONFIG_KEYS.siteFighterCenterContent]: 'siteFighterCenterContent',
  [CONFIG_KEYS.siteClubCenterContent]: 'siteClubCenterContent',
  [CONFIG_KEYS.siteHelpCenterContent]: 'siteHelpCenterContent',
  [CONFIG_KEYS.aboutUsContent]: 'aboutUsContent',
  [CONFIG_KEYS.employmentAgreementContent]: 'employmentAgreementContent',
  [CONFIG_KEYS.pickOrderAgreementContent]: 'pickOrderAgreementContent',
  [CONFIG_KEYS.userRegistrationAgreement]: 'userRegistrationAgreement',
  [CONFIG_KEYS.protectionOfMinors]: 'protectionOfMinors',
  [CONFIG_KEYS.orderVirtualCount]: 'orderVirtualCount',
  [CONFIG_KEYS.recyclingRuleDetail]: 'recyclingRuleDetail',
  [CONFIG_KEYS.recyclingQrCode]: 'recyclingQrCode',
  [CONFIG_KEYS.siteConfigGlobalProductPlacementMap]: 'siteConfigGlobalProductPlacementMap',
  [CONFIG_KEYS.siteConfigEnableAssessmentCode]: 'siteConfigEnableAssessmentCode',
  [CONFIG_KEYS.siteConfigAssessmentGroupQrCode]: 'siteConfigAssessmentGroupQrCode',
  [CONFIG_KEYS.siteConfigBlindBoxAnnouncement]: 'siteConfigBlindBoxAnnouncement',
  [CONFIG_KEYS.decorationThemeColor]: 'decorationThemeColor',
  [CONFIG_KEYS.decorationThemeTokens]: 'decorationThemeConfig',
  [CONFIG_KEYS.decorationThemeConfig]: 'decorationThemeConfig',
  [CONFIG_KEYS.decorationHomeBackground]: 'decorationHomeBackground',
  [CONFIG_KEYS.decorationMineBackground]: 'decorationMineBackground',
  [CONFIG_KEYS.decorationOrderBackground]: 'decorationOrderBackground',
  [CONFIG_KEYS.decorationRankBackground]: 'decorationRankBackground',
  [CONFIG_KEYS.decorationApplyBackground]: 'decorationApplyBackground',
  [CONFIG_KEYS.decorationApplyButton]: 'decorationApplyButton',
  [CONFIG_KEYS.escortText]: 'escortText',
  [CONFIG_KEYS.companionText]: 'companionText',
  [CONFIG_KEYS.rankText]: 'rankText',
}

const BOOLEAN_KEYS = new Set<ConfigKey>([
  CONFIG_KEYS.siteConfigEnableIndexDialog,
  CONFIG_KEYS.siteConfigEnableEveryEnterIndexDialog,
  CONFIG_KEYS.siteEnableRecycle,
  CONFIG_KEYS.siteEnableVoiceRoom,
  CONFIG_KEYS.siteConfigEnableAssessmentCode,
])

const SECTION_KEYS: Record<string, ConfigKey[]> = {
  site: [
    CONFIG_KEYS.siteLogoUrl,
    CONFIG_KEYS.siteName,
    CONFIG_KEYS.siteConfigGlobalProductPlacementMap,
    CONFIG_KEYS.siteConfigEnableAssessmentCode,
    CONFIG_KEYS.siteConfigAssessmentGroupQrCode,
  ],
  home: [
    CONFIG_KEYS.siteConfigEnableIndexDialog,
    CONFIG_KEYS.siteIndexDialogContent,
    CONFIG_KEYS.siteIndexDialogFrequency,
    CONFIG_KEYS.siteConfigEnableEveryEnterIndexDialog,
    CONFIG_KEYS.orderVirtualCount,
    CONFIG_KEYS.siteConfigBlindBoxAnnouncement,
  ],
  mine: [CONFIG_KEYS.siteEnableVoiceRoom],
  decoration: [
    CONFIG_KEYS.decorationThemeColor,
    CONFIG_KEYS.decorationThemeTokens,
    CONFIG_KEYS.decorationThemeConfig,
    CONFIG_KEYS.decorationHomeBackground,
    CONFIG_KEYS.decorationMineBackground,
    CONFIG_KEYS.decorationOrderBackground,
    CONFIG_KEYS.decorationRankBackground,
    CONFIG_KEYS.decorationApplyBackground,
    CONFIG_KEYS.decorationApplyButton,
    CONFIG_KEYS.escortText,
    CONFIG_KEYS.companionText,
    CONFIG_KEYS.rankText,
  ],
  content: [
    CONFIG_KEYS.siteCreateOrderContent,
    CONFIG_KEYS.siteOrderDetailContent,
    CONFIG_KEYS.siteFighterCenterContent,
    CONFIG_KEYS.siteClubCenterContent,
    CONFIG_KEYS.siteHelpCenterContent,
  ],
  agreement: [
    CONFIG_KEYS.userRegistrationAgreement,
    CONFIG_KEYS.sitePrivacyContent,
    CONFIG_KEYS.protectionOfMinors,
    CONFIG_KEYS.aboutUsContent,
    CONFIG_KEYS.employmentAgreementContent,
    CONFIG_KEYS.pickOrderAgreementContent,
  ],
  recycle: [
    CONFIG_KEYS.siteEnableRecycle,
    CONFIG_KEYS.recyclingRuleDetail,
    CONFIG_KEYS.recyclingQrCode,
  ],
  miniProgram: [],
}

const form = reactive<Record<string, any>>({
  siteLogoUrl: '',
  siteName: '',
  siteConfigGlobalProductPlacementMap: '',
  siteConfigEnableAssessmentCode: true,
  siteConfigAssessmentGroupQrCode: '',
  siteEnableRecycle: false,
  orderVirtualCount: '',
  siteIndexDialogContent: '',
  siteConfigEnableIndexDialog: false,
  siteIndexDialogFrequency: 'daily',
  siteConfigEnableEveryEnterIndexDialog: false,
  siteEnableVoiceRoom: false,
  sitePrivacyContent: '',
  userRegistrationAgreement: '',
  protectionOfMinors: '',
  siteCreateOrderContent: '',
  siteOrderDetailContent: '',
  siteFighterCenterContent: '',
  siteClubCenterContent: '',
  siteHelpCenterContent: '',
  aboutUsContent: '',
  employmentAgreementContent: '',
  pickOrderAgreementContent: '',
  recyclingRuleDetail: '',
  recyclingQrCode: '',
  siteConfigBlindBoxAnnouncement: '',
  ...DEFAULT_DECORATION,
  decorationThemeConfig: { ...DEFAULT_DECORATION_THEME },
})

const existingMap = ref<Record<string, SystemConfig>>({})
const tenantDomain = ref('')
const previewInfo = ref<PageDecorationPreview | null>(null)
const previewFrame = ref<HTMLIFrameElement | null>(null)
const previewFrameReady = ref(false)
const themeDrawerVisible = ref(false)

const currentSection = computed(
  () => topSections.find(item => item.key === activeSection.value) || topSections[0],
)

const currentDecorationPage = computed(
  () =>
    decorationPages.find(item => item.key === activeDecorationPage.value) || decorationPages[0],
)

const currentDecorationImage = computed(() => {
  const imageMap: Record<string, string> = {
    home: form.decorationHomeBackground,
    mine: form.decorationMineBackground,
    order: form.decorationOrderBackground,
    rank: form.decorationRankBackground,
    apply: form.decorationApplyBackground || form.decorationApplyButton,
  }
  return imageMap[activeDecorationPage.value] || ''
})

const currentDecorationImageFallback = computed(() => {
  const fallbackMap: Record<string, string> = {
    home: '/static/images/index/top.png',
    mine: '内置渐变背景',
    order: '内置渐变背景',
    rank: '/static/rank/rank-top-background.png',
    apply: '内置申请页素材',
  }
  return fallbackMap[activeDecorationPage.value]
})

const currentDecorationPreviewBackground = computed(() => {
  const backgroundMap: Record<string, string> = {
    home: form.decorationHomeBackground || previewAssets.homeBackground,
    mine: form.decorationMineBackground,
    order: form.decorationOrderBackground,
    rank: form.decorationRankBackground || previewAssets.rankBackground,
    apply: form.decorationApplyBackground || previewAssets.applyBackground,
  }
  return backgroundMap[activeDecorationPage.value] || ''
})

const decorationThemeFields: Array<{
  key: keyof DecorationThemeConfig
  label: string
  description: string
  kind?: 'text' | 'image'
}> = [
  { key: 'primaryColor', label: '主色', description: '导航、选中态和主要操作' },
  { key: 'accentColor', label: '强调色', description: '高亮、价格和重点提示' },
  { key: 'primaryTextColor', label: '主色文字', description: '主色按钮和高亮区域文字' },
  { key: 'pageBackgroundColor', label: '页面背景', description: '页面整体底色' },
  { key: 'surfaceColor', label: '卡片背景', description: '卡片、弹窗和输入容器' },
  { key: 'surfaceMutedColor', label: '浅色表面', description: '输入框和次级容器' },
  { key: 'surfaceDeepColor', label: '深色表面', description: '选中态和强调区域底色' },
  { key: 'surfaceWarmColor', label: '暖色表面', description: '订单、收益等浅暖卡片背景' },
  { key: 'surfaceHighlightColor', label: '高亮表面', description: '提示和重点区域背景' },
  { key: 'surfaceCoolColor', label: '冷色表面', description: '申请入口等浅色背景' },
  { key: 'borderColor', label: '边框色', description: '卡片、分割线和输入边框' },
  { key: 'borderStrongColor', label: '强调边框', description: '主要按钮和选中态边框' },
  { key: 'textColor', label: '主文字', description: '标题和主要内容' },
  { key: 'textSecondaryColor', label: '次文字', description: '辅助说明和标签' },
  { key: 'textMutedColor', label: '弱文字', description: '禁用态和弱提示' },
  { key: 'textPlaceholderColor', label: '占位文字', description: '输入框占位符' },
  { key: 'darkColor', label: '深色操作', description: '深色按钮和强调底' },
  { key: 'lightTextColor', label: '深色底文字', description: '深色按钮上的浅色文字' },
  { key: 'headerGradientStartColor', label: '顶部渐变起点', description: '页面顶部背景渐变起始色' },
  { key: 'headerGradientEndColor', label: '顶部渐变终点', description: '页面顶部背景渐变结束色', kind: 'text' },
  { key: 'shadowColor', label: '阴影色', description: '卡片和弹窗阴影', kind: 'text' },
  { key: 'overlayColor', label: '遮罩色', description: '弹窗遮罩基色' },
  { key: 'successColor', label: '成功色', description: '成功状态和完成提示' },
  { key: 'warningColor', label: '警告色', description: '警告状态和待处理提示' },
  { key: 'dangerColor', label: '危险色', description: '删除、取消和错误提示' },
  { key: 'genderFemaleColor', label: '女性卡片色', description: '首页女性用户卡片和陪玩渐变' },
  { key: 'buttonPrimaryColor', label: '主按钮背景', description: '主要操作按钮背景' },
  { key: 'buttonPrimaryTextColor', label: '主按钮文字', description: '主按钮文字颜色' },
  { key: 'buttonHighlightColor', label: '按钮高光', description: '主按钮顶部高光', kind: 'text' },
  { key: 'buttonHighlightSubtleColor', label: '按钮弱高光', description: '深色按钮顶部高光', kind: 'text' },
  { key: 'buttonOutlineColor', label: '描边按钮背景', description: '次要描边按钮背景' },
  { key: 'buttonDarkColor', label: '深色按钮背景', description: '深色操作按钮背景' },
  { key: 'buttonDarkTextColor', label: '深色按钮文字', description: '深色按钮文字颜色' },
  { key: 'popupBackgroundColor', label: '弹窗背景', description: '主题弹窗容器' },
  { key: 'navbarTextColor', label: '导航文字', description: '页面导航栏文字' },
  { key: 'navbarBackgroundColor', label: '导航背景', description: '页面导航栏背景', kind: 'text' },
  { key: 'navbarBorderColor', label: '导航边框', description: '页面导航栏边框' },
  { key: 'pageBackgroundImage', label: '页面背景图', description: '应用于全局页面底图', kind: 'image' },
  { key: 'headerBackgroundImage', label: '顶部背景图', description: '应用于页面顶部主视觉', kind: 'image' },
  { key: 'loginBackgroundImage', label: '登录页背景图', description: '手机号登录页整屏背景', kind: 'image' },
  // { key: 'popupBackgroundImage', label: '弹窗背景图', description: '应用于主题弹窗容器', kind: 'image' },
]

const h5PreviewKey = computed(() => String(
  previewInfo.value?.h5Key
  || existingMap.value.siteConfigHtmlH5Key?.configValue
  || '',
).trim())

const h5PreviewUrl = computed(() => {
  if (previewInfo.value?.previewUrl) return previewInfo.value.previewUrl
  if (!h5PreviewKey.value || typeof window === 'undefined') return ''
  const rawDomain = tenantDomain.value || window.location.origin
  const origin = /^https?:\/\//i.test(rawDomain) ? rawDomain : `https://${rawDomain}`
  try {
    const url = new URL(`/html/${h5PreviewKey.value}`, origin)
    url.searchParams.set('decorationPreview', '1')
    return url.toString()
  }
  catch {
    return ''
  }
})

const previewPayload = computed(() => ({
  type: 'peiwan-decoration-preview',
  payload: {
    themeColor: form.decorationThemeColor,
    theme: {
      ...form.decorationThemeConfig,
      primaryColor: form.decorationThemeColor,
    },
    colors: {
      ...form.decorationThemeConfig,
      primaryColor: form.decorationThemeColor,
    },
    ...form.decorationThemeConfig,
    backgrounds: {
      home: form.decorationHomeBackground,
      mine: form.decorationMineBackground,
      order: form.decorationOrderBackground,
      rank: form.decorationRankBackground,
      apply: form.decorationApplyBackground,
      applyButton: form.decorationApplyButton,
    },
    homeBackground: form.decorationHomeBackground,
    mineBackground: form.decorationMineBackground,
    orderBackground: form.decorationOrderBackground,
    rankBackground: form.decorationRankBackground,
    applyBackground: form.decorationApplyBackground,
    applyButton: form.decorationApplyButton,
    navigationTexts: {
      escort: form.escortText,
      companion: form.companionText,
      rank: form.rankText,
    },
  },
}))

function postPreviewTheme() {
  if (!previewFrameReady.value || !previewFrame.value?.contentWindow) return
  previewFrame.value.contentWindow.postMessage(previewPayload.value, '*')
}

function handlePreviewFrameLoad() {
  previewFrameReady.value = true
  postPreviewTheme()
}

function handlePreviewReady(event: MessageEvent) {
  const data = event.data
  if (
    !data
    || (data.type !== 'peiwan-decoration-preview-ready'
      && data.type !== 'ziniu-decoration-preview-ready')
    || !previewFrame.value?.contentWindow
    || event.source !== previewFrame.value.contentWindow
  ) {
    return
  }
  // App.onLaunch performs async tenant/config loading before installing the
  // mobile listener. Re-send after its ready handshake so the first preview
  // payload cannot be lost between iframe load and listener registration.
  previewFrameReady.value = true
  postPreviewTheme()
}

function openPreviewWindow() {
  if (h5PreviewUrl.value && typeof window !== 'undefined') {
    window.open(h5PreviewUrl.value, '_blank', 'noopener,noreferrer')
  }
}

function setDecorationColor(key: keyof DecorationThemeConfig, value: string) {
  const raw = String(value || '').trim()
  if (key.endsWith('Image')) {
    // UploadImg emits an empty value when its delete action is used.
    form.decorationThemeConfig[key] = raw
    return
  }
  const normalized = raw.toUpperCase()
  if (normalized) form.decorationThemeConfig[key] = normalized
  if (key === 'primaryColor' && /^#[0-9A-F]{3,8}$/.test(normalized)) {
    // Keep the legacy single-color field and the canonical token map in sync
    // while editing, so the iframe preview uses the same primary color before
    // the user saves the section.
    form.decorationThemeColor = normalized
    form.decorationThemeConfig.primaryColor = normalized
  }
}

function normalizeDecorationThemeConfig(
  value: unknown,
  fallbackPrimary: string = DEFAULT_DECORATION.decorationThemeColor,
): DecorationThemeConfig {
  let parsed: Record<string, unknown> = {}
  if (typeof value === 'string' && value.trim()) {
    try {
      parsed = JSON.parse(value) as Record<string, unknown>
    }
    catch {
      parsed = {}
    }
  }
  else if (value && typeof value === 'object') {
    parsed = value as Record<string, unknown>
  }
  if (parsed.theme && typeof parsed.theme === 'object') {
    parsed = parsed.theme as Record<string, unknown>
  }
  else if (parsed.tokens && typeof parsed.tokens === 'object') {
    parsed = parsed.tokens as Record<string, unknown>
  }
  else if (parsed.colors && typeof parsed.colors === 'object') {
    parsed = parsed.colors as Record<string, unknown>
  }
  const aliases: Record<string, string[]> = {
    primaryTextColor: ['buttonTextColor'],
    textSecondaryColor: ['secondaryTextColor'],
    textMutedColor: ['mutedTextColor'],
    textPlaceholderColor: ['placeholderColor'],
    surfaceMutedColor: ['inputBackgroundColor', 'inputBg'],
    buttonPrimaryColor: ['buttonColor', 'primaryButtonColor'],
    buttonPrimaryTextColor: ['buttonTextColor'],
  }
  Object.entries(aliases).forEach(([target, names]) => {
    if (String(parsed[target] || '').trim()) return
    const alias = names.find(name => String(parsed[name] || '').trim())
    if (alias) parsed[target] = parsed[alias]
  })
  const next = { ...DEFAULT_DECORATION_THEME, ...parsed } as DecorationThemeConfig
  next.primaryColor = normalizeThemeColor(String(next.primaryColor || fallbackPrimary))
  ;(Object.keys(DEFAULT_DECORATION_THEME) as Array<keyof DecorationThemeConfig>).forEach((key) => {
    if (!String(next[key] || '').trim()) next[key] = DEFAULT_DECORATION_THEME[key]
  })
  return next
}

watch(
  previewPayload,
  () => postPreviewTheme(),
  { deep: true },
)

function toBool(value: unknown) {
  if (typeof value === 'boolean') return value
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase()
  return ['true', '1', 'yes', 'on'].includes(normalized)
}

function normalizeThemeColor(value: string) {
  const normalized = String(value || '').trim()
  return /^#[0-9a-f]{6}$/i.test(normalized)
    ? normalized.toUpperCase()
    : DEFAULT_DECORATION.decorationThemeColor
}

function configGroupKey(key: ConfigKey) {
  if (key.startsWith('decorationConfig')) return 'decorationConfig'
  if (key.startsWith('copywritingConfig')) return 'copywritingConfig'
  if (key.startsWith('recycleConfig')) return 'recycleConfig'
  if (key.startsWith('serviceOrderConfig')) return 'serviceOrderConfig'
  return 'siteConfig'
}

function configGroupName(key: ConfigKey) {
  const names: Record<string, string> = {
    decorationConfig: '页面装修',
    copywritingConfig: '页面装修',
    recycleConfig: '回收配置',
    serviceOrderConfig: '服务订单配置',
    siteConfig: '站点配置',
  }
  return names[configGroupKey(key)]
}

async function fetchTenantDomain() {
  try {
    const tenantId = Number(getTenantId())
    if (!tenantId) return
    const tenant = await getTenant(tenantId)
    const website = Array.isArray(tenant?.websites) ? tenant.websites[0] : tenant?.domain
    if (website) tenantDomain.value = String(website).trim()
  }
  catch (error) {
    console.error('获取租户预览域名失败:', error)
  }
}

async function fetchPreviewInfo() {
  try {
    const data = await SystemConfigApi.getPageDecorationPreview()
    previewInfo.value = data || null
    if (!tenantDomain.value && data?.websites?.[0]) {
      tenantDomain.value = String(data.websites[0]).trim()
    }
  }
  catch (error) {
    // 兼容尚未部署预览接口的环境，h5PreviewUrl 会回退到本页读取的配置。
    console.warn('获取页面装修预览信息失败，将使用本地配置回退:', error)
  }
}

async function fetchAssessmentCode(refresh = false) {
  try {
    if (refresh) await TenantNew_refreshAssessmentCode({})
    assessmentCode.value = await TenantNew_getAssessmentCode({})
  }
  catch (error) {
    console.error('获取考核码失败:', error)
    message.error('获取考核码失败')
  }
}

async function fetchAll() {
  loading.value = true
  try {
    const data = await SystemConfigApi.getSystemConfigPage()
    const list: SystemConfig[] = Array.isArray(data) ? data : []
    existingMap.value = Object.fromEntries(
      list.filter(item => item.configKey).map(item => [item.configKey as string, item]),
    )

    Object.assign(form, DEFAULT_DECORATION)
    form.decorationThemeConfig = { ...DEFAULT_DECORATION_THEME }

    Object.entries(FIELD_BY_KEY).forEach(([key, field]) => {
      const item = existingMap.value[key]
      if (!item) return
      if (BOOLEAN_KEYS.has(key as ConfigKey)) {
        ;(form[field] as boolean) = toBool(item.configValue)
      }
      else if (key === CONFIG_KEYS.decorationThemeConfig) {
        ;(form[field] as DecorationThemeConfig) = normalizeDecorationThemeConfig(
          item.configValue,
          String(existingMap.value[CONFIG_KEYS.decorationThemeColor]?.configValue || DEFAULT_DECORATION.decorationThemeColor),
        )
      }
      else {
        ;(form[field] as string) = String(item.configValue || '')
      }
    })
    form.decorationThemeColor = normalizeThemeColor(form.decorationThemeColor)
    const themeConfigItem = existingMap.value[CONFIG_KEYS.decorationThemeTokens]
      || existingMap.value[CONFIG_KEYS.decorationThemeConfig]
    if (themeConfigItem) {
      form.decorationThemeConfig = normalizeDecorationThemeConfig(
        themeConfigItem.configValue,
        form.decorationThemeColor,
      )
    }
    form.decorationThemeConfig = normalizeDecorationThemeConfig(
      form.decorationThemeConfig,
      form.decorationThemeColor,
    )
    form.decorationThemeConfig.primaryColor = form.decorationThemeColor
    form.escortText = form.escortText.trim() || DEFAULT_DECORATION.escortText
    form.companionText = form.companionText.trim() || DEFAULT_DECORATION.companionText
    form.rankText = form.rankText.trim() || DEFAULT_DECORATION.rankText
  }
  catch (error) {
    console.error('加载配置失败:', error)
    message.error('加载配置失败')
  }
  finally {
    loading.value = false
  }
}

function buildConfig(key: ConfigKey): SystemConfig {
  const field = FIELD_BY_KEY[key]
  const rawValue = form[field]
  const value = (key === CONFIG_KEYS.decorationThemeTokens || key === CONFIG_KEYS.decorationThemeConfig)
    ? JSON.stringify(normalizeDecorationThemeConfig(rawValue, form.decorationThemeColor))
    : BOOLEAN_KEYS.has(key)
      ? rawValue
        ? 'true'
        : 'false'
      : String(rawValue ?? '').trim()
  const existing = existingMap.value[key]
  return {
    ...(existing?.id ? { id: existing.id } : {}),
    configKey: key,
    configValue: value,
    configGroupKey: configGroupKey(key),
    configGroupName: configGroupName(key),
    title: TITLE_MAP[key],
    description: existing?.description || `用于客户端${TITLE_MAP[key]}`,
  } as SystemConfig
}

async function doSave(keys: ConfigKey[]) {
  if (!keys.length || saving.value) return
  if (keys.includes(CONFIG_KEYS.decorationThemeColor)) {
    form.decorationThemeColor = normalizeThemeColor(form.decorationThemeColor)
  }
  if (
    keys.includes(CONFIG_KEYS.decorationThemeColor)
    || keys.includes(CONFIG_KEYS.decorationThemeTokens)
    || keys.includes(CONFIG_KEYS.decorationThemeConfig)
  ) {
    form.decorationThemeConfig.primaryColor = form.decorationThemeColor
  }

  saving.value = true
  try {
    await Promise.all(keys.map(key => SystemConfigApi.updateSystem(buildConfig(key))))
    message.success('配置已保存')
    await fetchAll()

    if (keys.includes(CONFIG_KEYS.siteLogoUrl) && form.siteLogoUrl) {
      appStore.setSiteLogoUrl(form.siteLogoUrl)
    }
    if (keys.includes(CONFIG_KEYS.siteName) && form.siteName) {
      appStore.setSiteName(form.siteName)
    }
  }
  catch (error) {
    console.error('保存失败:', error)
    message.error('保存失败，部分配置可能已更新，请重新加载确认')
  }
  finally {
    saving.value = false
  }
}

function saveCurrentSection() {
  return doSave(SECTION_KEYS[activeSection.value] || [])
}

function saveAll() {
  return doSave([...new Set(Object.values(SECTION_KEYS).flat())])
}

function clearDecorationImage(
  field:
    | 'decorationHomeBackground'
    | 'decorationMineBackground'
    | 'decorationOrderBackground'
    | 'decorationRankBackground'
    | 'decorationApplyBackground'
    | 'decorationApplyButton',
) {
  form[field] = ''
}

function resetDecorationToDefault() {
  Object.assign(form, DEFAULT_DECORATION)
  form.decorationThemeConfig = { ...DEFAULT_DECORATION_THEME }
}

onMounted(() => {
  window.addEventListener('message', handlePreviewReady)
  fetchTenantDomain()
  fetchPreviewInfo()
  fetchAll()
  fetchAssessmentCode()
})

onBeforeUnmount(() => {
  window.removeEventListener('message', handlePreviewReady)
})
</script>

<template>
  <ContentWrap>
    <div class="setting-page">
      <header class="setting-overview">
        <div class="setting-overview-copy">
          <h2>客户端设置</h2>
        </div>
        <div v-if="activeSection !== 'miniProgram'" class="setting-overview-actions">
          <el-button :loading="loading" @click="fetchAll">
            <Icon icon="ep:refresh" />
            重新加载
          </el-button>
          <el-button type="primary" :loading="saving" @click="saveAll">
            <Icon icon="ep:check" />
            保存全部
          </el-button>
        </div>
      </header>

      <main v-loading="activeSection !== 'miniProgram' && loading" class="setting-main">
        <nav aria-label="客户端设置分组" class="setting-tabs" role="tablist">
          <button
            v-for="item in topSections"
            :key="item.key"
            type="button"
            role="tab"
            class="setting-tab"
            :class="{ active: activeSection === item.key }"
            :aria-selected="activeSection === item.key"
            :title="item.description"
            @click="activeSection = item.key"
          >
            {{ item.label }}
          </button>
        </nav>

        <div class="setting-main-body">
          <MiniProgramRelease v-if="activeSection === 'miniProgram'" />
          <section v-if="activeSection === 'site'" class="setting-section">
            <div class="section-heading">
              <h4>品牌识别</h4>
              <p>站点基础信息会同步用于后台标题和客户端展示。</p>
            </div>
            <div class="field-grid field-grid--two">
              <article class="field-card field-card--media">
                <div class="field-copy">
                  <strong>客户端 LOGO</strong>
                  <small>建议使用透明底 PNG，尺寸不小于 256 × 256 px</small>
                </div>
                <UploadImg
                  v-model="form.siteLogoUrl"
                  aria-label="上传客户端 LOGO"
                  height="112px"
                  width="112px"
                />
              </article>
              <article class="field-card">
                <div class="field-copy">
                  <strong>网站名称</strong>
                  <small>用于客户端标题与浏览器页签</small>
                </div>
                <el-input
                  v-model="form.siteName"
                  aria-label="网站名称"
                  autocomplete="off"
                  maxlength="24"
                  show-word-limit
                  placeholder="请输入网站名称…"
                />
              </article>
              <article class="field-card field-card--media">
                <div class="field-copy">
                  <strong>商品全局底部图</strong>
                  <small>商品详情页底部的统一宣传图</small>
                </div>
                <UploadImg
                  v-model="form.siteConfigGlobalProductPlacementMap"
                  aria-label="上传商品全局底部图"
                  height="112px"
                  width="180px"
                />
              </article>
            </div>

            <div class="section-heading section-heading--secondary">
              <h4>考核入口</h4>
              <p>控制申请接单前的考核码验证流程。</p>
            </div>
            <div class="field-grid field-grid--two">
              <article class="field-card field-card--switch">
                <div class="field-copy">
                  <strong>启用考核码</strong>
                  <small>关闭后申请接单将跳过考核码校验</small>
                </div>
                <el-switch
                  v-model="form.siteConfigEnableAssessmentCode"
                  aria-label="启用考核码"
                />
              </article>
              <article class="field-card field-card--media">
                <div class="field-copy">
                  <strong>考核群二维码</strong>
                  <small>用户在考核指引中扫码进群</small>
                </div>
                <UploadImg
                  v-model="form.siteConfigAssessmentGroupQrCode"
                  aria-label="上传考核群二维码"
                  height="112px"
                  width="112px"
                />
              </article>
              <article class="field-card field-card--span-2">
                <div class="field-copy">
                  <strong>当前考核码</strong>
                  <small>进入页面只读取当前值，点击“生成新码”才会刷新</small>
                </div>
                <div class="inline-control">
                  <el-input v-model="assessmentCode" aria-label="当前考核码" readonly />
                  <el-button @click="fetchAssessmentCode(true)">
                    生成新码
                  </el-button>
                </div>
              </article>
            </div>
          </section>

          <section v-else-if="activeSection === 'home'" class="setting-section">
            <div class="section-heading">
              <h4>首页运营位</h4>
              <p>配置首页弹窗、滚动通知和活动公告。</p>
            </div>
            <div class="field-grid field-grid--two">
              <article class="field-card field-card--switch">
                <div class="field-copy">
                  <strong>启用首页弹窗</strong>
                  <small>新内容会在用户下次进入首页时展示</small>
                </div>
                <el-switch
                  v-model="form.siteConfigEnableIndexDialog"
                  aria-label="启用首页弹窗"
                />
              </article>
              <article class="field-card field-card--media">
                <div class="field-copy">
                  <strong>首页弹窗图片</strong>
                  <small>也兼容历史富文本内容；新配置建议上传竖版图片</small>
                </div>
                <UploadImg
                  v-model="form.siteIndexDialogContent"
                  aria-label="上传首页弹窗图片"
                  height="148px"
                  width="116px"
                />
              </article>
              <article class="field-card">
                <div class="field-copy">
                  <strong>首页弹窗频率</strong>
                  <small>一天一次按用户关闭时间计算；每次进入平台只在本次会话首次展示</small>
                </div>
                <el-select v-model="form.siteIndexDialogFrequency" aria-label="首页弹窗频率">
                  <el-option label="一天只弹一次" value="daily" />
                  <el-option label="每次进平台都弹" value="session" />
                </el-select>
              </article>
              <article class="field-card field-card--switch">
                <div class="field-copy">
                  <strong>首页选择游戏弹窗频率</strong>
                  <small>开启后每次进入首页都会显示选择游戏弹窗；关闭后仅首次选择时显示</small>
                </div>
                <el-switch
                  v-model="form.siteConfigEnableEveryEnterIndexDialog"
                  aria-label="首页选择游戏弹窗频率"
                />
              </article>
              <article class="field-card field-card--span-2">
                <div class="field-copy">
                  <strong>首页滚动通知</strong>
                  <small>展示在首页游戏分类上方，支持富文本内容</small>
                </div>
                <Editor
                  v-model="form.orderVirtualCount"
                  aria-label="首页滚动通知"
                  height="260px"
                />
              </article>
              <article class="field-card field-card--span-2 field-card--editor">
                <div class="field-copy">
                  <strong>盲盒公告</strong>
                  <small>用于盲盒活动的规则与公告说明</small>
                </div>
                <Editor
                  v-model="form.siteConfigBlindBoxAnnouncement"
                  aria-label="盲盒公告"
                  height="260px"
                />
              </article>
            </div>
          </section>

          <section v-else-if="activeSection === 'mine'" class="setting-section">
            <div class="section-heading">
              <h4>个人中心功能</h4>
              <p>控制“我的”页面中按租户开放的功能入口。</p>
            </div>
            <div class="field-grid field-grid--two">
              <article class="field-card field-card--switch">
                <div class="field-copy">
                  <strong>语音房功能</strong>
                  <small>开启后客户端展示语音房相关入口</small>
                </div>
                <el-switch v-model="form.siteEnableVoiceRoom" aria-label="语音房功能" />
              </article>
            </div>
          </section>

          <section
            v-else-if="activeSection === 'decoration'"
            class="setting-section decoration-section"
          >
            <div class="decoration-toolbar">
              <div class="theme-control">
                <span>主题色</span>
                <el-color-picker
                  v-model="form.decorationThemeColor"
                  aria-label="客户端主题色"
                  :predefine="['#FEC328', '#AA884E', '#3E7D4E', '#5D5FEF', '#D14D72', '#111827']"
                />
                <el-input
                  v-model="form.decorationThemeColor"
                  aria-label="主题色十六进制值"
                  autocomplete="off"
                  maxlength="7"
                  @blur="
                    form.decorationThemeColor = normalizeThemeColor(form.decorationThemeColor)
                  "
                />
              </div>
              <div class="decoration-toolbar__actions">
                <el-button type="primary" plain @click="themeDrawerVisible = true">
                  <Icon icon="ep:brush" />
                  客户端主题色系
                </el-button>
                <el-button @click="resetDecorationToDefault">
                  <Icon icon="ep:refresh-left" />
                  恢复默认
                </el-button>
              </div>
            </div>

            <div class="page-selector" role="tablist" aria-label="装修页面">
              <button
                v-for="page in decorationPages"
                :key="page.key"
                type="button"
                role="tab"
                class="page-selector-item"
                :class="{ active: activeDecorationPage === page.key }"
                :aria-selected="activeDecorationPage === page.key"
                @click="activeDecorationPage = page.key"
              >
                <Icon :icon="page.icon" aria-hidden="true" class="page-selector-icon" />
                <span class="page-selector-copy">
                  <strong>{{ page.label }}</strong>
                  <small>{{ page.description }}</small>
                </span>
              </button>
            </div>

            <div class="decoration-preview-link">
              <span>手机端实时预览地址</span>
              <el-input
                :model-value="h5PreviewUrl"
                readonly
                :placeholder="h5PreviewKey ? '正在生成预览地址…' : '请到系统配置生成微信防红链接'"
              />
              <el-button v-if="h5PreviewUrl" text @click="openPreviewWindow">
                新窗口打开
              </el-button>
            </div>

            <el-drawer
              v-model="themeDrawerVisible"
              title="客户端主题色系"
              direction="rtl"
              size="560px"
              append-to-body
              :modal="false"
              :lock-scroll="false"
              class="decoration-theme-drawer"
            >
              <div class="decoration-theme-panel decoration-theme-panel--drawer">
                <div class="decoration-theme-panel__heading">
                  <div>
                    <h4>客户端主题色系</h4>
                    <p>修改后立即同步到手机预览，保存后才会生效到客户端。</p>
                  </div>
                  <el-tag v-if="h5PreviewUrl" type="success" effect="plain">
                    实时预览已连接
                  </el-tag>
                  <el-tag v-else type="warning" effect="plain">
                    本地示意预览
                  </el-tag>
                </div>
                <div class="decoration-color-grid">
                  <div
                    v-for="field in decorationThemeFields"
                    :key="field.key"
                    class="decoration-color-field"
                    :class="{ 'decoration-color-field--image': field.kind === 'image' }"
                  >
                    <div class="decoration-color-field__copy">
                      <strong>{{ field.label }}</strong>
                      <small>{{ field.description }}</small>
                    </div>
                    <UploadImg
                      v-if="field.kind === 'image'"
                      :model-value="form.decorationThemeConfig[field.key]"
                      :show-btn-text="false"
                      height="78px"
                      width="148px"
                      @update:model-value="setDecorationColor(field.key, String($event || ''))"
                    />
                    <div
                      v-else
                      class="decoration-color-field__control"
                      :class="{ 'decoration-color-field__control--text': field.kind === 'text' }"
                    >
                      <el-color-picker
                        v-if="field.kind !== 'text'"
                        :model-value="form.decorationThemeConfig[field.key]"
                        :show-alpha="false"
                        @change="setDecorationColor(field.key, String($event || ''))"
                      />
                      <el-input
                        :model-value="form.decorationThemeConfig[field.key]"
                        :maxlength="field.kind === 'text' ? 500 : 9"
                        autocomplete="off"
                        @update:model-value="setDecorationColor(field.key, String($event || ''))"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </el-drawer>

            <div class="decoration-workbench">
              <div class="decoration-editor">
                <div class="decoration-editor-header">
                  <div>
                    <h4>{{ currentDecorationPage.label }}装修</h4>
                    <p>{{ currentDecorationPage.description }}</p>
                  </div>
                  <span class="decoration-status">
                    {{ currentDecorationImage ? '已上传自定义背景' : '使用内置背景' }}
                  </span>
                </div>

                <div v-if="activeDecorationPage === 'home'" class="decoration-fields">
                  <div class="decoration-field decoration-field--image">
                    <div class="field-copy">
                      <strong>首页顶部背景图</strong>
                      <small>建议 750 × 620 px，主体内容避开顶部状态栏</small>
                    </div>
                    <div class="image-control">
                      <UploadImg
                        v-model="form.decorationHomeBackground"
                        aria-label="上传首页顶部背景图"
                        height="150px"
                        width="240px"
                      />
                      <el-button
                        v-if="form.decorationHomeBackground"
                        text
                        type="danger"
                        @click="clearDecorationImage('decorationHomeBackground')"
                      >
                        恢复内置背景
                      </el-button>
                    </div>
                  </div>
                  <div class="decoration-field decoration-field--span-2">
                    <div class="field-copy">
                      <strong>首页顶部导航</strong>
                      <small>原“系统配置 / 前端文案”中的三个名称已统一迁移到这里维护</small>
                    </div>
                    <div class="copywriting-grid">
                      <el-form-item label="护航入口">
                        <el-input
                          v-model="form.escortText"
                          aria-label="护航入口文案"
                          autocomplete="off"
                          maxlength="4"
                          show-word-limit
                          placeholder="护航"
                        />
                      </el-form-item>
                      <el-form-item label="陪玩入口">
                        <el-input
                          v-model="form.companionText"
                          aria-label="陪玩入口文案"
                          autocomplete="off"
                          maxlength="4"
                          show-word-limit
                          placeholder="陪玩"
                        />
                      </el-form-item>
                      <el-form-item label="排行榜入口">
                        <el-input
                          v-model="form.rankText"
                          aria-label="排行榜入口文案"
                          autocomplete="off"
                          maxlength="4"
                          show-word-limit
                          placeholder="排行榜"
                        />
                      </el-form-item>
                    </div>
                  </div>
                </div>

                <div v-else-if="activeDecorationPage === 'mine'" class="decoration-fields">
                  <div class="decoration-field decoration-field--image">
                    <div class="field-copy">
                      <strong>我的页面背景图</strong>
                      <small>建议 750 × 560 px；图片将覆盖页面顶部，并保留浅色页面底色</small>
                    </div>
                    <div class="image-control">
                      <UploadImg
                        v-model="form.decorationMineBackground"
                        aria-label="上传我的页面背景图"
                        height="150px"
                        width="240px"
                      />
                      <el-button
                        v-if="form.decorationMineBackground"
                        text
                        type="danger"
                        @click="clearDecorationImage('decorationMineBackground')"
                      >
                        恢复内置背景
                      </el-button>
                    </div>
                  </div>
                </div>

                <div v-else-if="activeDecorationPage === 'order'" class="decoration-fields">
                  <div class="decoration-field decoration-field--image">
                    <div class="field-copy">
                      <strong>陪玩下单背景图</strong>
                      <small>同时应用于快速派单与商品下单页，建议 750 × 620 px</small>
                    </div>
                    <div class="image-control">
                      <UploadImg
                        v-model="form.decorationOrderBackground"
                        aria-label="上传陪玩下单背景图"
                        height="150px"
                        width="240px"
                      />
                      <el-button
                        v-if="form.decorationOrderBackground"
                        text
                        type="danger"
                        @click="clearDecorationImage('decorationOrderBackground')"
                      >
                        恢复内置背景
                      </el-button>
                    </div>
                  </div>
                </div>

                <div v-else-if="activeDecorationPage === 'rank'" class="decoration-fields">
                  <div class="decoration-field decoration-field--image">
                    <div class="field-copy">
                      <strong>排行榜顶部背景图</strong>
                      <small>建议 750 × 710 px；仅替换顶部主视觉，三甲装饰仍使用内置资源</small>
                    </div>
                    <div class="image-control">
                      <UploadImg
                        v-model="form.decorationRankBackground"
                        aria-label="上传排行榜顶部背景图"
                        height="150px"
                        width="240px"
                      />
                      <el-button
                        v-if="form.decorationRankBackground"
                        text
                        type="danger"
                        @click="clearDecorationImage('decorationRankBackground')"
                      >
                        恢复内置背景
                      </el-button>
                    </div>
                  </div>
                </div>

                <div v-else class="decoration-fields">
                  <div class="decoration-field decoration-field--image">
                    <div class="field-copy">
                      <strong>申请接单页背景图</strong>
                      <small>微信小程序申请接单页主背景，建议使用 1125 × 2661 px</small>
                    </div>
                    <div class="image-control">
                      <UploadImg
                        v-model="form.decorationApplyBackground"
                        aria-label="上传申请接单页背景图"
                        height="150px"
                        width="240px"
                      />
                      <el-button
                        v-if="form.decorationApplyBackground"
                        text
                        type="danger"
                        @click="clearDecorationImage('decorationApplyBackground')"
                      >
                        恢复内置背景
                      </el-button>
                    </div>
                  </div>
                  <div class="decoration-field decoration-field--image">
                    <div class="field-copy">
                      <strong>申请接单页按钮图</strong>
                      <small>叠加在背景图底部的可点击按钮，建议使用 750 × 202 px</small>
                    </div>
                    <div class="image-control">
                      <UploadImg
                        v-model="form.decorationApplyButton"
                        aria-label="上传申请接单页按钮图"
                        height="96px"
                        width="240px"
                      />
                      <el-button
                        v-if="form.decorationApplyButton"
                        text
                        type="danger"
                        @click="clearDecorationImage('decorationApplyButton')"
                      >
                        恢复内置按钮
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>

              <aside
                class="phone-preview"
                :style="{ '--preview-theme': form.decorationThemeColor }"
              >
                <template v-if="h5PreviewUrl">
                  <div class="phone-shell phone-shell--iframe">
                    <div class="phone-status">
                      <span>9:41</span><span>Wi-Fi&nbsp;&nbsp;100%</span>
                    </div>
                    <div class="phone-screen phone-screen--iframe">
                      <iframe
                        ref="previewFrame"
                        :src="h5PreviewUrl"
                        title="客户端手机端实时预览"
                        @load="handlePreviewFrameLoad"
                      />
                    </div>
                  </div>
                  <p>当前预览 · 微信防红 H5（实时同步）</p>
                </template>
                <div v-if="!h5PreviewUrl" class="phone-shell">
                  <div class="phone-status">
                    <span>9:41</span><span>Wi-Fi&nbsp;&nbsp;100%</span>
                  </div>
                  <div class="phone-screen" :class="`phone-screen--${activeDecorationPage}`">
                    <template v-if="activeDecorationPage === 'home'">
                      <div
                        class="mobile-home-hero"
                        :style="{ backgroundImage: `url(${currentDecorationPreviewBackground})` }"
                      >
                        <div class="mobile-home-nav">
                          <div class="mobile-home-tabs">
                            <strong>{{ form.escortText }}</strong>
                            <span>{{ form.companionText }}</span>
                            <span>{{ form.rankText }}</span>
                          </div>
                          <div class="mobile-home-actions">
                            <Icon icon="ep:service" />
                            <Icon icon="ep:search" />
                          </div>
                        </div>
                      </div>
                      <div class="mobile-home-content">
                        <div
                          class="mobile-notice"
                          :style="{ backgroundImage: `url(${previewAssets.noticeBackground})` }"
                        >
                          <Icon icon="ep:bell" />
                          <span>最新订单通知正在滚动展示</span>
                        </div>
                        <div class="mobile-category-list">
                          <div v-for="label in ['王者荣耀', '英雄联盟', '三角洲', '和平精英']" :key="label">
                            <i />
                            <span>{{ label }}</span>
                          </div>
                        </div>
                        <div class="mobile-sub-tabs">
                          <strong>热门推荐</strong><span>排位上分</span><span>娱乐陪玩</span>
                        </div>
                        <div class="mobile-product-list">
                          <div v-for="index in 2" :key="index" class="mobile-product-card">
                            <i />
                            <div><strong>游戏服务推荐</strong><span>专业接单 · 快速响应</span></div>
                            <b>¥{{ index * 18 + 9 }}</b>
                          </div>
                        </div>
                      </div>
                    </template>

                    <template v-else-if="activeDecorationPage === 'mine'">
                      <div
                        class="mobile-mine-hero"
                        :class="{ 'mobile-mine-hero--custom': currentDecorationImage }"
                        :style="
                          currentDecorationPreviewBackground
                            ? { backgroundImage: `url(${currentDecorationPreviewBackground})` }
                            : {}
                        "
                      >
                        <img :src="previewAssets.mineSettings" alt="" width="28" height="28">
                        <div class="mobile-profile">
                          <i class="mobile-avatar" />
                          <div class="mobile-profile-copy">
                            <strong>用户昵称</strong>
                            <div>
                              <span><img :src="previewAssets.mineWealth" alt="" width="18" height="18">财力:88</span>
                              <span><img :src="previewAssets.mineCharm" alt="" width="22" height="18">魅力:128</span>
                            </div>
                          </div>
                        </div>
                        <div class="mobile-member-card">
                          <span>会员中心<small>享专属特权</small></span>
                          <img :src="previewAssets.mineCrown" alt="" width="44" height="32">
                        </div>
                        <div class="mobile-stats">
                          <span><strong>12</strong>关注</span>
                          <span><strong>28</strong>粉丝</span>
                          <span><strong>96</strong>获赞</span>
                        </div>
                      </div>
                      <div class="mobile-mine-content">
                        <div class="mobile-mine-card">
                          <strong>我的资产</strong>
                          <div class="mobile-assets">
                            <span><img :src="previewAssets.mineBalance" alt="" width="24" height="24">余额<small>168.00</small></span>
                            <span><img :src="previewAssets.mineCoupon" alt="" width="24" height="24">优惠券<small>3</small></span>
                            <span><img :src="previewAssets.mineOrder" alt="" width="24" height="24">订单<small>全部订单</small></span>
                          </div>
                        </div>
                        <div class="mobile-mine-card mobile-function-card">
                          <strong>常用功能</strong>
                          <div><span>申请接单</span><span>会员等级</span><span>我的主页</span><span>我点赞的</span></div>
                        </div>
                      </div>
                    </template>

                    <template v-else-if="activeDecorationPage === 'order'">
                      <div
                        class="mobile-order-hero"
                        :class="{ 'mobile-order-hero--custom': currentDecorationImage }"
                        :style="
                          currentDecorationPreviewBackground
                            ? { backgroundImage: `url(${currentDecorationPreviewBackground})` }
                            : {}
                        "
                      />
                      <div class="mobile-order-page">
                        <div class="mobile-order-nav">
                          <span>‹</span><strong>快速派单</strong><i />
                        </div>
                        <div class="mobile-order-product">
                          <i />
                          <div><strong>王者荣耀排位上分</strong><span>专业认证打手，快速接单</span></div>
                          <b>29钻</b>
                        </div>
                        <div class="mobile-order-options">
                          <div><strong>区服</strong><span>手机端</span><span>电脑端</span></div>
                          <div><strong>等级</strong><span class="active">认证打手</span></div>
                          <div><strong>数量</strong><span>−&nbsp;&nbsp;1&nbsp;&nbsp;+</span></div>
                        </div>
                        <div class="mobile-order-row">
                          <strong>游戏名片</strong><span>请选择 ›</span>
                        </div>
                        <div class="mobile-order-row">
                          <strong>优惠券</strong><span>请选择 ›</span>
                        </div>
                      </div>
                      <div class="mobile-pay-bar">
                        <span>合计<strong>29钻</strong></span>
                        <b>支付订单</b>
                      </div>
                    </template>

                    <template v-else-if="activeDecorationPage === 'rank'">
                      <div
                        class="mobile-rank-stage"
                        :style="{ backgroundImage: `url(${currentDecorationPreviewBackground})` }"
                      >
                        <div class="mobile-rank-nav">
                          <span>{{ form.escortText }}</span>
                          <span>{{ form.companionText }}</span>
                          <strong>{{ form.rankText }}</strong>
                          <Icon icon="ep:search" />
                        </div>
                        <div
                          v-for="player in previewRankPlayers"
                          :key="player.rank"
                          class="mobile-podium-player"
                          :class="`mobile-podium-player--${player.rank}`"
                        >
                          <b>{{ player.score }}票</b>
                          <div><i /><img :src="player.frame" alt="" width="80" height="110"></div>
                          <strong>{{ player.name }}</strong>
                        </div>
                        <img class="mobile-rank-podium" :src="previewAssets.rankPodium" alt="" width="250" height="36">
                      </div>
                      <div class="mobile-ranking-list">
                        <div v-for="index in 4" :key="index">
                          <b>0{{ index + 3 }}</b><i /><span><strong>陪玩用户 {{ index }}</strong><small>王者荣耀</small></span><em>{{ 168 - index * 16 }}票</em>
                        </div>
                      </div>
                    </template>

                    <template v-else>
                      <div class="mobile-apply-poster">
                        <img :src="currentDecorationPreviewBackground" alt="申请接单页背景">
                        <img :src="form.decorationApplyButton || previewAssets.applyButton" alt="申请接单按钮">
                      </div>
                    </template>
                  </div>
                </div>
                <p v-if="!h5PreviewUrl">
                  当前预览 ·
                  {{ currentDecorationImage ? '自定义背景' : currentDecorationImageFallback }}
                </p>
              </aside>
            </div>
          </section>

          <section v-else-if="activeSection === 'content'" class="setting-section">
            <div class="section-heading">
              <h4>订单页面</h4><p>客户端将以富文本形式展示以下内容。</p>
            </div>
            <div class="editor-stack">
              <article class="field-card field-card--editor">
                <div class="field-copy">
                  <strong>下单页面内容</strong><small>下单前的说明和注意事项</small>
                </div><Editor
                  v-model="form.siteCreateOrderContent"
                  aria-label="下单页面内容"
                  height="300px"
                />
              </article>
              <article class="field-card field-card--editor">
                <div class="field-copy">
                  <strong>订单详情页内容</strong><small>订单详情中的补充说明</small>
                </div><Editor
                  v-model="form.siteOrderDetailContent"
                  aria-label="订单详情页内容"
                  height="300px"
                />
              </article>
            </div>
            <div class="section-heading section-heading--secondary">
              <h4>中心与帮助</h4><p>打手中心、俱乐部中心和帮助中心内容。</p>
            </div>
            <div class="editor-stack">
              <article class="field-card field-card--editor">
                <div class="field-copy">
                  <strong>打手中心页内容</strong>
                </div><Editor
                  v-model="form.siteFighterCenterContent"
                  aria-label="打手中心页内容"
                  height="300px"
                />
              </article>
              <article class="field-card field-card--editor">
                <div class="field-copy">
                  <strong>俱乐部中心页内容</strong>
                </div><Editor
                  v-model="form.siteClubCenterContent"
                  aria-label="俱乐部中心页内容"
                  height="300px"
                />
              </article>
              <article class="field-card field-card--editor">
                <div class="field-copy">
                  <strong>帮助中心页内容</strong>
                </div><Editor
                  v-model="form.siteHelpCenterContent"
                  aria-label="帮助中心页内容"
                  height="300px"
                />
              </article>
            </div>
          </section>

          <section v-else-if="activeSection === 'agreement'" class="setting-section">
            <div class="section-heading">
              <h4>协议与平台说明</h4><p>用户可在客户端设置页和相关业务流程中查看。</p>
            </div>
            <el-tabs type="border-card" class="agreement-tabs">
              <el-tab-pane label="用户注册协议">
                <Editor
                  v-model="form.userRegistrationAgreement"
                  aria-label="用户注册协议"
                  height="360px"
                />
              </el-tab-pane>
              <el-tab-pane label="隐私协议">
                <Editor
                  v-model="form.sitePrivacyContent"
                  aria-label="隐私协议"
                  height="360px"
                />
              </el-tab-pane>
              <el-tab-pane label="未成年人保护">
                <Editor
                  v-model="form.protectionOfMinors"
                  aria-label="未成年人保护"
                  height="360px"
                />
              </el-tab-pane>
              <el-tab-pane label="关于我们">
                <Editor
                  v-model="form.aboutUsContent"
                  aria-label="关于我们"
                  height="360px"
                />
              </el-tab-pane>
              <el-tab-pane label="入职陪玩协议">
                <Editor
                  v-model="form.employmentAgreementContent"
                  aria-label="入职陪玩协议"
                  height="360px"
                />
              </el-tab-pane>
              <el-tab-pane label="接单规则">
                <Editor
                  v-model="form.pickOrderAgreementContent"
                  aria-label="接单规则"
                  height="360px"
                />
              </el-tab-pane>
            </el-tabs>
          </section>

          <section v-else-if="activeSection === 'recycle'" class="setting-section">
            <div class="section-heading">
              <h4>回收业务</h4><p>首页入口开关、规则说明与收款二维码。</p>
            </div>
            <div class="field-grid field-grid--two">
              <article class="field-card field-card--switch">
                <div class="field-copy">
                  <strong>启用回收入口</strong><small>开启后首页顶部显示“回收”入口</small>
                </div><el-switch v-model="form.siteEnableRecycle" aria-label="启用回收入口" />
              </article>
              <article class="field-card field-card--media">
                <div class="field-copy">
                  <strong>回收二维码</strong><small>用于回收业务联系或收款</small>
                </div><UploadImg
                  v-model="form.recyclingQrCode"
                  aria-label="上传回收二维码"
                  height="128px"
                  width="128px"
                />
              </article>
              <article class="field-card field-card--span-2 field-card--editor">
                <div class="field-copy">
                  <strong>回收规则详情</strong><small>进入回收页后展示的规则说明</small>
                </div><Editor
                  v-model="form.recyclingRuleDetail"
                  aria-label="回收规则详情"
                  height="320px"
                />
              </article>
            </div>
          </section>
        </div>

        <footer v-if="activeSection !== 'miniProgram'" class="setting-footer">
          <span>当前分组：{{ currentSection.label }}</span>
          <div>
            <el-button @click="fetchAll">
              取消更改
            </el-button>
            <el-button type="primary" :loading="saving" @click="saveCurrentSection">
              保存当前分组
            </el-button>
          </div>
        </footer>
      </main>
    </div>
  </ContentWrap>
</template>

<style scoped lang="scss">
.setting-page {
  color: var(--el-text-color-primary);
}

.setting-overview {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding: 4px 2px 18px;

  h2,
  p {
    margin: 0;
  }

  h2 {
    font-size: 22px;
    font-weight: 600;
    line-height: 30px;
    text-wrap: balance;
  }

  p {
    max-width: 720px;
    margin-top: 6px;
    color: var(--el-text-color-secondary);
    font-size: 13px;
    line-height: 20px;
  }
}

.setting-overview-actions,
.setting-footer > div {
  display: flex;
  gap: 8px;
}

.setting-overview-actions :deep(.el-button) {
  margin: 0;
}

.setting-main {
  display: flex;
  min-width: 0;
  min-height: 640px;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  background: var(--el-bg-color);
}

.setting-tabs {
  display: flex;
  align-items: stretch;
  gap: 4px;
  padding: 0 20px;
  overflow-x: auto;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-blank);
  scrollbar-width: thin;
}

.setting-tab {
  position: relative;
  flex: none;
  min-height: 46px;
  padding: 12px 14px;
  border: 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  white-space: nowrap;
  background: transparent;
  cursor: pointer;
  touch-action: manipulation;
  transition: color 0.16s ease;

  &::after {
    content: '';
    position: absolute;
    right: 14px;
    bottom: 0;
    left: 14px;
    height: 2px;
    border-radius: 999px;
    background: transparent;
    transition: background-color 0.16s ease;
  }

  &:hover {
    color: var(--el-text-color-primary);
  }

  &.active {
    color: var(--el-color-primary);
    font-weight: 600;
  }

  &.active::after {
    background: var(--el-color-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--el-color-primary);
    outline-offset: -4px;
    border-radius: 8px;
  }
}

.setting-main-body {
  width: min(100%, 1120px);
  margin: 0 auto;
  flex: 1;
  padding: 8px 28px 32px;
}

.setting-section {
  min-width: 0;
}

.section-heading {
  padding: 20px 0 12px;

  h4,
  p {
    margin: 0;
  }

  h4 {
    font-size: 14px;
    font-weight: 650;
    line-height: 22px;
    text-wrap: balance;
  }

  p {
    margin-top: 3px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    line-height: 18px;
  }

  &--secondary {
    padding-top: 30px;
  }

  &--compact {
    padding: 0;
  }
}

.field-grid {
  display: block;
  border-top: 1px solid var(--el-border-color-lighter);
}

.field-card {
  display: grid;
  grid-template-columns: minmax(220px, 0.76fr) minmax(320px, 1.24fr);
  align-items: center;
  min-width: 0;
  min-height: 96px;
  gap: 32px;
  padding: 18px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);

  &--switch {
    grid-template-columns: minmax(220px, 0.76fr) minmax(320px, 1.24fr);
  }

  &--media {
    min-height: 170px;
  }

  &--editor {
    display: block;

    .field-copy {
      margin-bottom: 16px;
    }
  }
}

.field-card--switch :deep(.el-switch) {
  justify-self: start;
}

.field-copy {
  min-width: 0;

  strong,
  small {
    display: block;
  }

  strong {
    font-size: 14px;
    font-weight: 600;
    line-height: 21px;
  }

  small {
    margin-top: 4px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    line-height: 18px;
  }
}

.inline-control {
  display: flex;
  align-items: center;
  gap: 8px;

  :deep(.el-input) {
    max-width: 420px;
  }
}

.editor-stack {
  display: grid;
  gap: 0;
}

.agreement-tabs {
  border: 0;
  border-top: 1px solid var(--el-border-color-lighter);
  border-radius: 0;

  :deep(.el-tabs__content) {
    padding: 16px;
  }
}

.decoration-theme-panel {
  margin: 4px 0 16px;
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  background: var(--el-fill-color-extra-light);
}

.decoration-theme-panel--drawer {
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}

:deep(.decoration-theme-drawer .el-drawer__body) {
  padding: 20px;
  overflow-y: auto;
}

.decoration-theme-panel__heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;

  h4,
  p {
    margin: 0;
  }

  h4 {
    color: var(--el-text-color-primary);
    font-size: 15px;
    line-height: 22px;
  }

  p {
    margin-top: 3px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    line-height: 18px;
  }
}

.decoration-color-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 14px;
}

.decoration-color-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  background: var(--el-bg-color);

  &--image {
    grid-column: 1 / -1;
    align-items: flex-start;
  }
}

.decoration-color-field__copy {
  min-width: 0;

  strong,
  small {
    display: block;
  }

  strong {
    color: var(--el-text-color-regular);
    font-size: 13px;
    line-height: 20px;
  }

  small {
    margin-top: 2px;
    overflow: hidden;
    color: var(--el-text-color-secondary);
    font-size: 11px;
    line-height: 16px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.decoration-color-field__control {
  display: flex;
  flex: 0 0 146px;
  align-items: center;
  gap: 6px;

  :deep(.el-color-picker) {
    flex: none;
  }

  :deep(.el-input) {
    min-width: 0;
  }

  &--text {
    flex-basis: 260px;
  }
}

.decoration-color-field--image :deep(.upload-box) {
  flex: 0 0 148px;
}

.decoration-preview-link {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  margin: 0 0 14px;
  padding: 10px 12px;
  border: 1px dashed var(--el-border-color);
  border-radius: 10px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.decoration-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 22px 0 14px;
}

.decoration-toolbar__actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: 10px;
}

.theme-control {
  display: grid;
  grid-template-columns: auto auto 116px;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-regular);
  font-size: 13px;
}

.page-selector {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.page-selector-item {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  min-height: 64px;
  padding: 12px 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  color: var(--el-text-color-regular);
  text-align: left;
  background: var(--el-bg-color);
  cursor: pointer;
  transition:
    border-color 0.16s ease,
    background-color 0.16s ease,
    box-shadow 0.16s ease,
    color 0.16s ease;

  strong,
  small {
    display: block;
  }

  strong {
    font-size: 13px;
    font-weight: 600;
    line-height: 20px;
  }

  small {
    margin-top: 2px;
    overflow: hidden;
    color: var(--el-text-color-secondary);
    font-size: 11px;
    line-height: 16px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover {
    border-color: var(--el-border-color);
    background: var(--el-fill-color-blank);
  }

  &:focus-visible {
    outline: 2px solid var(--el-color-primary);
    outline-offset: 2px;
  }

  &.active {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary-light-5);
    background: var(--el-color-primary-light-9);
    box-shadow: 0 0 0 1px var(--el-color-primary-light-8);
  }
}

.page-selector-icon {
  width: 16px;
  height: 16px;
  color: var(--el-text-color-secondary);
}

.page-selector-item.active .page-selector-icon {
  color: currentcolor;
}

.page-selector-copy {
  min-width: 0;
}

.decoration-workbench {
  display: grid;
  grid-template-columns: minmax(320px, 392px) minmax(480px, 1fr);
  min-height: 650px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  background: var(--el-fill-color-extra-light);
}

.decoration-editor {
  min-width: 0;
  padding: 20px;
  background: var(--el-bg-color);
}

.decoration-editor-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  h4,
  p {
    margin: 0;
  }

  h4 {
    font-size: 16px;
    line-height: 24px;
  }

  p {
    margin-top: 3px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }
}

.decoration-status {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.decoration-fields {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  padding-top: 16px;
}

.decoration-field {
  min-width: 0;
  padding: 16px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);

  &--image {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
  }
}

.image-control {
  display: flex;
  flex: 0 0 240px;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.copywriting-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;

  :deep(.el-form-item) {
    margin: 0;
  }
}

.phone-preview {
  position: sticky;
  top: 16px;
  order: -1;
  align-self: start;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  padding: 24px 18px;
  border-right: 1px solid var(--el-border-color-lighter);
  background: #eef0f4;

  > p {
    max-width: 270px;
    margin: 12px 0 0;
    overflow: hidden;
    color: #7b808a;
    font-size: 11px;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.phone-shell {
  width: 268px;
  padding: 6px;
  border: 1px solid #20242c;
  border-radius: 24px;
  background: #171a20;
  box-shadow: 0 6px 18px rgb(27 32 40 / 18%);
}

.phone-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 22px;
  padding: 0 16px;
  border-radius: 17px 17px 0 0;
  color: #fff;
  font-size: 9px;
  background: #171a20;
}

.phone-screen {
  position: relative;
  height: 520px;
  overflow: hidden;
  border-radius: 17px;
  color: #1c1d20;
  background: #f5f5f5;
}

.phone-shell--iframe {
  width: 375px;
  max-width: 100%;
}

.phone-screen--iframe {
  height: 667px;
  background: #fff;

  iframe {
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
    background: #fff;
  }
}

.mobile-home-hero {
  height: 205px;
  background-position: center;
  background-size: cover;
}

.mobile-home-nav,
.mobile-rank-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 58px;
  padding: 15px 10px 6px;
}

.mobile-home-tabs {
  display: flex;
  align-items: baseline;
  gap: 12px;
  color: #918778;
  font-size: 11px;

  strong {
    color: var(--preview-theme);
    font-size: 17px;
  }
}

.mobile-home-actions {
  display: flex;
  gap: 12px;
  color: rgb(255 255 255 / 78%);

  svg {
    width: 15px;
    height: 15px;
  }
}

.mobile-home-content {
  position: relative;
  margin-top: -117px;
  padding-bottom: 12px;
}

.mobile-notice {
  display: flex;
  align-items: center;
  gap: 7px;
  width: calc(100% - 22px);
  height: 36px;
  margin: 0 11px;
  padding: 8px 10px;
  overflow: hidden;
  border-radius: 7px;
  color: #757575;
  font-size: 9px;
  white-space: nowrap;
  background-color: #ecf4ef;
  background-position: center;
  background-size: cover;

  svg {
    flex: none;
    color: var(--preview-theme);
  }
}

.mobile-category-list {
  display: flex;
  justify-content: space-around;
  padding: 13px 8px 10px;
  background: rgb(255 255 255 / 90%);

  > div {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 5px;
    color: #555;
    font-size: 8px;
  }

  i {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--preview-theme) 30%, #fff);
  }
}

.mobile-sub-tabs {
  display: flex;
  gap: 18px;
  padding: 11px 12px 8px;
  color: #8a8a8a;
  font-size: 9px;
  background: #f5f5f5;

  strong {
    color: var(--preview-theme);
  }
}

.mobile-product-list {
  display: grid;
  gap: 7px;
  padding: 0 9px;
}

.mobile-product-card {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-height: 65px;
  padding: 8px;
  border-radius: 7px;
  background: #fff;

  > i {
    width: 48px;
    height: 48px;
    border-radius: 5px;
    background: color-mix(in srgb, var(--preview-theme) 18%, #eee);
  }

  strong,
  span {
    display: block;
  }

  strong {
    font-size: 10px;
  }

  span {
    margin-top: 6px;
    color: #999;
    font-size: 8px;
  }

  b {
    color: var(--preview-theme);
    font-size: 9px;
  }
}

.phone-screen--mine {
  background: #f6f6f6;
}

.mobile-mine-hero {
  position: relative;
  height: 245px;
  padding: 16px 12px 0;
  background:
    radial-gradient(circle at 12% 8%, rgb(255 249 235 / 50%) 0, transparent 34%),
    linear-gradient(180deg, #ead1a8 0%, #ead9bd 88%, rgb(234 217 189 / 0%) 100%);
  background-position: center top;
  background-size: cover;

  > img {
    display: block;
    width: 20px;
    height: 20px;
    margin-left: auto;
  }
}

.mobile-mine-hero--custom {
  background-repeat: no-repeat;
}

.mobile-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 13px;
}

.mobile-avatar {
  width: 52px;
  height: 52px;
  flex: none;
  border: 4px solid rgb(255 255 255 / 96%);
  border-radius: 50%;
  background: color-mix(in srgb, var(--preview-theme) 28%, #fff);
}

.mobile-profile-copy {
  min-width: 0;

  > strong {
    font-size: 14px;
  }

  > div {
    display: flex;
    gap: 4px;
    margin-top: 7px;
  }

  span {
    display: flex;
    align-items: center;
    height: 18px;
    padding: 0 6px 0 3px;
    border-radius: 10px;
    color: #9a6735;
    font-size: 7px;
    background: rgb(255 255 255 / 86%);
  }

  span + span {
    color: #b32b88;
    background: #ffbbdf;
  }

  img {
    object-fit: contain;
  }
}

.mobile-member-card {
  position: absolute;
  top: 72px;
  right: 11px;
  display: flex;
  align-items: center;
  width: 78px;
  height: 38px;
  padding-left: 7px;
  border-radius: 10px;
  color: #4b2b14;
  background: var(--preview-theme);

  span {
    position: relative;
    z-index: 1;
    font-size: 7px;
    font-weight: 700;
  }

  small {
    display: block;
    margin-top: 2px;
    font-size: 6px;
  }

  img {
    position: absolute;
    right: 2px;
    bottom: 2px;
    width: 35px;
    height: 26px;
    object-fit: contain;
  }
}

.mobile-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
  color: #949494;
  font-size: 8px;
  text-align: center;

  span {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  strong {
    color: #030303;
    font-size: 15px;
  }
}

.mobile-mine-content {
  display: grid;
  gap: 8px;
  margin-top: -43px;
  padding: 0 10px 14px;
}

.mobile-mine-card {
  padding: 11px 10px;
  border-radius: 7px;
  background: #fff;
  box-shadow: 0 4px 11px rgb(143 119 78 / 10%);

  > strong {
    font-size: 10px;
  }
}

.mobile-assets {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-top: 12px;

  > span {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 3px;
    font-size: 8px;
  }

  img {
    object-fit: contain;
  }

  small {
    color: #999;
    font-size: 7px;
  }
}

.mobile-function-card > div {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  margin-top: 12px;
  font-size: 7px;
  text-align: center;

  span::before {
    display: block;
    width: 28px;
    height: 28px;
    margin: 0 auto 5px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--preview-theme) 18%, #f5f5f5);
    content: '';
  }
}

.phone-screen--order {
  background: #f5f5f5;
}

.mobile-order-hero {
  position: absolute;
  inset: 0 0 auto;
  height: 150px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--preview-theme) 35%, #fff) 0%, #f5f5f5 88%);
  background-position: center top;
  background-size: cover;
  filter: blur(1px);
}

.mobile-order-page {
  position: relative;
  z-index: 1;
  padding: 0 9px 74px;
}

.mobile-order-nav {
  display: grid;
  grid-template-columns: 18px 1fr 18px;
  align-items: center;
  height: 46px;
  font-size: 12px;
  text-align: center;
}

.mobile-order-product,
.mobile-order-options,
.mobile-order-row {
  border-radius: 7px;
  background: #fff;
}

.mobile-order-product {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  align-items: center;
  gap: 7px;
  padding: 9px;

  > i {
    width: 48px;
    height: 48px;
    border-radius: 4px;
    background: color-mix(in srgb, var(--preview-theme) 22%, #eee);
  }

  strong,
  span {
    display: block;
  }

  strong {
    font-size: 10px;
  }

  span {
    margin-top: 6px;
    color: #757575;
    font-size: 7px;
  }

  b {
    color: var(--preview-theme);
    font-size: 8px;
  }
}

.mobile-order-options {
  margin-top: 7px;
  padding: 3px 9px;

  > div {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 5px;
    min-height: 38px;
    font-size: 8px;
  }

  strong {
    margin-right: auto;
    font-size: 9px;
  }

  span {
    padding: 5px 8px;
    border-radius: 4px;
    background: #f5f5f5;
  }

  .active {
    color: #fff;
    background: var(--preview-theme);
  }
}

.mobile-order-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  margin-top: 7px;
  padding: 0 10px;
  font-size: 9px;

  span {
    color: #757575;
    font-size: 8px;
  }
}

.mobile-pay-bar {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 10px 11px;
  font-size: 8px;
  background: #fff;

  span strong {
    display: block;
    margin-top: 2px;
    color: var(--preview-theme);
    font-size: 11px;
  }

  > b {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 106px;
    height: 38px;
    border-radius: 20px;
    color: #fff;
    font-size: 9px;
    background: var(--preview-theme);
  }
}

.phone-screen--rank {
  color: #fff;
  background: #050403;
}

.phone-screen--apply {
  background: #8c83e7;
}

.mobile-apply-poster {
  position: relative;

  img:first-child {
    display: block;
    width: 100%;
  }

  img:last-child {
    position: absolute;
    top: 78%;
    left: 8%;
    width: 84%;
  }
}

.mobile-rank-stage {
  position: relative;
  height: 310px;
  background-position: center top;
  background-size: 100% auto;
}

.mobile-rank-nav {
  height: 56px;
  padding: 15px 11px 5px;
  color: #918778;
  font-size: 10px;

  strong {
    color: var(--preview-theme);
    font-size: 16px;
  }

  svg {
    width: 15px;
    height: 15px;
    margin-left: auto;
    color: rgb(255 255 255 / 68%);
  }
}

.mobile-podium-player {
  position: absolute;
  z-index: 2;
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 80px;
  font-size: 7px;

  > b {
    font-size: 10px;
    font-weight: 500;
  }

  > div {
    position: relative;
    width: 58px;
    height: 80px;
    margin-top: 3px;
  }

  i {
    position: absolute;
    top: 17px;
    left: 5px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--preview-theme) 34%, #fff);
  }

  img {
    position: absolute;
    inset: 0;
    width: 58px;
    height: 80px;
  }

  > strong {
    margin-top: 2px;
    font-size: 8px;
  }

  &--1 {
    top: 80px;
    left: 50%;
    transform: translateX(-50%);

    > div {
      width: 70px;
      height: 92px;
    }

    i {
      top: 21px;
      left: 7px;
      width: 56px;
      height: 56px;
    }

    img {
      width: 70px;
      height: 92px;
    }
  }

  &--2 {
    top: 112px;
    left: 7px;
  }

  &--3 {
    top: 120px;
    right: 7px;
  }
}

.mobile-rank-podium {
  position: absolute;
  right: 0;
  bottom: 8px;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 38px;
}

.mobile-ranking-list {
  > div {
    display: grid;
    grid-template-columns: 24px 32px minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    min-height: 51px;
    padding: 0 11px;
    border-bottom: 1px solid rgb(255 255 255 / 7%);
  }

  b {
    color: #9d8069;
    font-size: 10px;
  }

  i {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #6d6254;
  }

  span strong,
  span small {
    display: block;
  }

  span strong {
    font-size: 8px;
  }

  span small {
    margin-top: 4px;
    color: #9a8d84;
    font-size: 6px;
  }

  em {
    color: var(--preview-theme);
    font-size: 8px;
    font-style: normal;
  }
}

.setting-footer {
  position: sticky;
  z-index: 5;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 64px;
  padding: 10px 24px;
  border-top: 1px solid var(--el-border-color-lighter);
  color: var(--el-text-color-secondary);
  font-size: 12px;
  background: var(--el-bg-color);
}

@media (max-width: 1060px) {
  .decoration-workbench {
    grid-template-columns: minmax(330px, 1fr);
  }

  .phone-preview {
    position: static;
    order: 0;
    min-height: 610px;
    border-top: 1px solid var(--el-border-color-lighter);
    border-right: 0;
  }
}

@media (max-width: 1100px) {
  .page-selector {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .setting-tabs {
    padding: 0 12px;
  }

  .setting-tab {
    padding: 12px 10px;
  }

  .field-card,
  .field-card--switch {
    grid-template-columns: minmax(180px, 0.7fr) minmax(260px, 1.3fr);
  }

  .decoration-workbench {
    grid-template-columns: 1fr;
  }

  .phone-preview {
    order: 0;
    border-top: 0;
    border-right: 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .decoration-color-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .setting-overview,
  .decoration-toolbar,
  .decoration-field--image,
  .setting-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .setting-overview-actions,
  .setting-footer > div {
    width: 100%;
  }

  .setting-overview-actions :deep(.el-button),
  .setting-footer :deep(.el-button) {
    flex: 1;
  }

  .field-grid,
  .field-grid--two,
  .copywriting-grid,
  .page-selector,
  .decoration-color-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .field-card--span-2 {
    grid-column: span 1;
  }

  .field-card,
  .field-card--switch {
    display: flex;
    align-items: stretch;
    flex-direction: column;
    gap: 14px;
  }

  .setting-main-body {
    padding: 0 14px 24px;
  }

  .theme-control {
    grid-template-columns: auto auto 1fr;
  }

  .decoration-theme-panel__heading,
  .decoration-preview-link {
    align-items: stretch;
    flex-direction: column;
  }

  .decoration-color-field__control {
    flex-basis: 150px;
  }

  .image-control {
    flex-basis: auto;
    align-items: flex-start;
  }

  .decoration-preview-link {
    grid-template-columns: 1fr;
  }

  .decoration-color-field {
    align-items: stretch;
    flex-direction: column;
  }

  .decoration-color-field__control {
    flex-basis: auto;
  }
}
</style>

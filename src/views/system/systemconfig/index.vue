<script setup lang="ts">
import { ElMessageBox } from 'element-plus'

import { LevelApply_batchUpdateAllUsersServiceStatus } from '@/api/gamer/levelapply'
import { SystemConfigApi } from '@/api/gamer/systemconfig'
import { getTenant } from '@/api/system/tenant'
import UploadImg from '@/components/UploadFile/src/UploadImg.vue'
import { getTenantId } from '@/utils/auth'

defineOptions({ name: 'SystemConfig' })

const message = useMessage()

// 配置键常量
const KEYS = {
  WITHDRAW_ACCOUNT_CONFIG_ENABLE_WX_FAST_REFUND: 'withdrawAccountConfigEnableWxFastRefund',
  SITE_CONFIG_APPLY_FIGHTER_REAL_NAME: 'siteConfigApplyFighterRealName',
  SITE_CONFIG_ENABLE_BIND_MOBILE: 'siteConfigEnableBindMobile',
  SITE_HISTORY_ACCEPTORS: 'siteHistoryAcceptors',
  ENABLE_ALGO_CAPTCHA: 'siteConfigEnableAlgoCaptcha',
  ENABLE_DISPATCH_ORDERLIST: 'siteConfigEnableDispatchingOrder',
  ENABLE_MOBILE_REGION: 'siteConfigEnableMobileRegion',
  ENABLE_COMPUTER_REGION: 'siteConfigEnableComputerRegion',
  // 话题配置
  HOT_TOPIC_LIST: 'topicConfigHotTopicList',
  CUSTOMER_SERVICE_LINK: 'siteConfigCustomerServiceLink',
  // 服务订单配置
  ORDER_VIRTUAL_COUNT: 'serviceOrderConfigVirtualCount',
  // 服务配置
  PICK_ORDER_DEPOSIT: 'serviceConfigPickOrderDeposit',
  DAILY_PICK_ORDER_COUNT: 'serviceConfigDailyPickOrderCount',
  PICK_ORDER_DELAY_TIME: 'serviceConfigPickOrderDelayTime',
  FEE_RATE: 'serviceConfigWithdrawFeeRate',
  ORDER_COMMISSION_RELEASE_TIME: 'serviceConfigOrderCommissionReleaseTime',
  COMMISSION_RATE_ON_TIPS: 'serviceConfigCommissionRateOnTips',
  CAN_CANCEL_ORDER: 'serviceConfigCanCancelOrder',
  CAN_REFUND: 'serviceConfigCanRefundOrder',
  CAN_CHECK_APPLY_REFUND_USER_MOBILE: 'serviceConfigCanCheckApplyRefundUserMobile',
  CAN_CHECK_NOT_REFUND_USER_MOBILE: 'serviceConfigCanCheckNotRefundUserMobile',
  CAN_CHECK_NOT_REFUND_USER_MOBILE_TIME: 'serviceConfigCanCheckNotRefundUserMobileTime',
  CAN_SET_USER_NOTICE: 'serviceConfigCanSetUserNotice',
  DEPOSIT_RETURN_SAFE_DAYS: 'serviceConfigDepositReturnSafeDays',
  RESTRICT_PRODUCT_IDS: 'serviceConfigRestrictProductIds',
  LIMIT_PICK_ORDER_FEE: 'serviceConfigLimitPickOrderFee',
  LIMIT_SAME_TIME_PICK_ORDER_COUNT: 'serviceConfigLimitSameTimePickOrderCount',
  PICK_ORDER_VERIFY: 'serviceConfigPickOrderVerify',
  LIMIT_UPGRADE_PEOPLE_COUNT: 'serviceConfigLimitUpgradePeopleCount',
  ALLOW_RECHARGE_DEPOSIT: 'serviceConfigAllowRechargeDeposit',
  // 积分配置
  FAVORABLE_COMMENT_POINT_ADD: 'pointConfigFavorableCommentPointAdd',
  CONTINUE_POINT_ADD: 'pointConfigContinuePointAdd',
  COMPLAINT_POINT_SUB: 'pointConfigComplaintPointSub',
  CONSUME_AMOUNT_PER_VOTE: 'pointConfigConsumeAmountPerVote',
  ENABLE_COMPANION_RANK: 'pointConfigEnableCompanionRank',
  // 礼物/商品商店配置
  GIFT_COMMISSION_RATE: 'itemShopConfigGiftCommissionRate',
  TOP_CARD_PRICE: 'itemShopConfigTopCardPrice',
  REFRESH_CARD_PRICE: 'itemShopConfigRefreshCardPrice',
  ENABLE_PICK_ORDER_SMS_NOTICE: 'orderNoticeConfigEnablePickOrderSmsNotice',
  ENABLE_FIGHTER_COMPLETE_ORDER_SMS_NOTICE: 'orderNoticeConfigEnableFighterCompleteOrderSmsNotice',
  ENABLE_CUSTOM_SMS: 'smsConfigEnableCustomSms',
  ORDER_SUBSCRIBE_SUPPORTED: 'notificationConfigIsOrderSubscribeSupported',
  ORDER_SUBSCRIBE_TEMPLATE_CODE: 'notificationConfigOrderSubscribeTemplateCode',
  // 前端文案配置
  ESCORT_TEXT: 'copywritingConfigEscortText',
  COMPANION_TEXT: 'copywritingConfigCompanionText',
  RANK_TEXT: 'copywritingConfigRankText',
  // 分佣配置
  COMMISSION_RATE: 'commissionConfigCommissionRate',
  // 应用配置
  ENABLE_INVITATION_MODE: 'appConfigEnableInvitationMode',
  ENABLE_CONSUME_RANK: 'appConfigEnableConsumeRank',
  ENABLE_AUTO_PICK_ORDER: 'appConfigEnableAutoPickOrder',
  INVITATION_POSTER: 'appConfigInvitePoster',
  SITE_CONFIG_HTML_H5_KEY: 'siteConfigHtmlH5Key',
  // 订单超时时间
  ORDER_TIMEOUT_TIME: 'siteConfigOrderTimeoutTime',
} as const

type KeyName = typeof KEYS[keyof typeof KEYS]

// 表单数据
interface HotTopicItem { sort: number, name: string, color: string }
const formData = reactive<any>({
  hotTopicList: [],
  orderVirtualCount: 0,
  pickOrderDeposit: 0,
  dailyPickOrderCount: 0,
  pickOrderDelayTime: 0,
  withdrawFeeRate: 0,
  orderCommissionReleaseTime: 0,
  commissionRateOnTips: 0,
  withdrawAccountConfigEnableWxFastRefund: false,
  siteConfigApplyFighterRealName: false,
  siteConfigEnableBindMobile: false,
  siteHistoryAcceptors: false,
  siteConfigEnableAlgoCaptcha: false,
  siteConfigEnableDispatchingOrder: false,
  siteConfigEnableMobileRegion: true,
  siteConfigEnableComputerRegion: true,
  canCancelOrder: false,
  canRefundOrder: false,
  canCheckApplyRefundUserMobile: false,
  canCheckNotRefundUserMobile: false,
  canCheckNotRefundUserMobileTime: 0,
  canSetUserNotice: false,
  depositReturnSafeDays: 0,
  restrictProductIds: '',
  limitPickOrderFee: 0,
  limitSameTimePickOrderCount: 0,
  pickOrderVerify: false,
  limitUpgradePeopleCount: 0,
  allowRechargeDeposit: false,
  favorableCommentPointAdd: 0,
  continuePointAdd: 0,
  complaintPointSub: 0,
  consumeAmountPerVote: 0,
  enableCompanionRank: false,
  // 礼物/商品商店配置
  giftCommissionRate: 0,
  topCardPrice: 0,
  refreshCardPrice: 0,
  orderNoticeConfigEnablePickOrderSmsNotice: false,
  orderNoticeConfigEnableFighterCompleteOrderSmsNotice: false,
  smsConfigEnableCustomSms: false,
  isOrderSubscribeSupported: false,
  orderSubscribeTemplateCode: '',
  escortText: '护航',
  companionText: '陪玩',
  rankText: '排行榜',
  // 分佣配置
  commissionRate: 0,
  // 应用配置
  enableInvitationMode: false,
  enableConsumeRank: false,
  enableAutoPickOrder: false,
  siteConfigCustomerServiceLink: '',
  invitationPoster: '',
  htmlH5Key: '',
  // 订单超时时间
  orderTimeoutValue: 15,
  orderTimeoutUnit: 'minute', // minute, hour, day
})

// 当前已有配置映射（key -> id）
const existingIdMap = ref<Record<string, number>>({})

const loadingAll = ref(false)
const activeGroup = ref('service')
const groupSearch = ref('')
const tenantDomain = ref<string>('')

const configGroups = [
  {
    key: 'service',
    title: '服务配置',
    description: '订单、身份与站点功能',
    icon: 'ep:setting',
    count: 9,
    keywords: '订单超时时间 微信提现 绑定手机号 实名认证 指定陪玩 验证码 订单延迟 客服链接 防红链接',
  },
  {
    key: 'region',
    title: '区服配置',
    description: '客户端区服入口',
    icon: 'ep:monitor',
    count: 2,
    keywords: '手机端 电脑端 区服',
  },
  {
    key: 'point',
    title: '积分配置',
    description: '积分、票数与排行榜',
    icon: 'ep:medal',
    count: 5,
    keywords: '好评加分 续单加分 差评减分 消费送票 陪玩排行榜',
  },
  {
    key: 'notification',
    title: '消息通知',
    description: '短信与微信订阅通知',
    icon: 'ep:bell',
    count: 5,
    keywords: '短信 自定义短信 接单提醒 完成订单 微信订阅 开关 模板编码 模板ID',
  },

  {
    key: 'app',
    title: '应用配置',
    description: '费率、邀请与自动接单',
    icon: 'ep:operation',
    count: 6,
    keywords: '提现手续费 自动接单 邀请模式 消费排名 分佣比例 邀请海报',
  },
]

const filteredGroups = computed(() => {
  const keyword = groupSearch.value.trim().toLowerCase()
  if (!keyword) return configGroups
  return configGroups.filter(group => (
    group.title.toLowerCase().includes(keyword)
    || group.description.toLowerCase().includes(keyword)
    || group.keywords.toLowerCase().includes(keyword)
  ))
})

const currentGroup = computed(() => (
  configGroups.find(group => group.key === activeGroup.value) || configGroups[0]
))
const totalConfigCount = computed(() => (
  configGroups.reduce((sum, group) => sum + group.count, 0)
))

watch(filteredGroups, (groups) => {
  if (groups.length && !groups.some(group => group.key === activeGroup.value)) {
    activeGroup.value = groups[0].key
  }
})

// 工具：字符串转布尔
function toBool(v: string | null | undefined) {
  if (v == null) return false
  const s = String(v).trim().toLowerCase()
  return s === 'true' || s === '1' || s === 'yes' || s === 'on'
}

// 工具：安全 JSON 解析
function safeJsonParse<T>(s: string | null | undefined, def: T): T {
  if (!s) return def
  try {
    return JSON.parse(s) as T
  }
  catch {
    return def
  }
}

const configList = ref<any[]>([])

// 加载租户域名
async function loadTenantDomain() {
  try {
    const tenantId = getTenantId()
    if (tenantId) {
      const tenantData = await getTenant(tenantId)
      if (tenantData?.websites && tenantData.websites.length > 0) {
        tenantDomain.value = tenantData.websites[0]
      }
    }
  }
  catch (error) {
    console.error('获取租户域名失败:', error)
  }
}

// 加载全部配置（分页拉取一页足够）
async function loadAll() {
  loadingAll.value = true
  try {
    // 加载租户域名
    await loadTenantDomain()

    const data = await SystemConfigApi.getSystemConfigPage()
    configList.value = data || []
    const idMap: Record<string, number> = {}
    configList.value.forEach((item: any) => {
      idMap[item.configKey] = item.id
      switch (item.configKey) {
        case KEYS.HOT_TOPIC_LIST:
          formData.hotTopicList = safeJsonParse<HotTopicItem[]>(item.configValue, [])
          break
        case KEYS.ORDER_VIRTUAL_COUNT:
          formData.orderVirtualCount = Number(item.configValue || 0)
          break
        case KEYS.PICK_ORDER_DEPOSIT:
          formData.pickOrderDeposit = Number(item.configValue || 0)
          break
        case KEYS.DAILY_PICK_ORDER_COUNT:
          formData.dailyPickOrderCount = Number(item.configValue || 0)
          break
        case KEYS.PICK_ORDER_DELAY_TIME:
          formData.pickOrderDelayTime = Number(item.configValue || 0)
          break
        case KEYS.FEE_RATE:
          formData.withdrawFeeRate = Number(item.configValue || 0)
          break
        case KEYS.ORDER_COMMISSION_RELEASE_TIME:
          formData.orderCommissionReleaseTime = Number(item.configValue || 0)
          break
        case KEYS.COMMISSION_RATE_ON_TIPS:
          formData.commissionRateOnTips = Number(item.configValue || 0)
          break
        case KEYS.WITHDRAW_ACCOUNT_CONFIG_ENABLE_WX_FAST_REFUND:
          formData.withdrawAccountConfigEnableWxFastRefund = toBool(item.configValue)
          break
        case KEYS.SITE_CONFIG_APPLY_FIGHTER_REAL_NAME:
          formData.siteConfigApplyFighterRealName = toBool(item.configValue)
          break
        case KEYS.SITE_CONFIG_ENABLE_BIND_MOBILE:
          formData.siteConfigEnableBindMobile = toBool(item.configValue)
          break
        case KEYS.SITE_HISTORY_ACCEPTORS:
          formData.siteHistoryAcceptors = toBool(item.configValue)
          break
        case KEYS.ENABLE_ALGO_CAPTCHA:
          formData.siteConfigEnableAlgoCaptcha = toBool(item.configValue)
          break
        case KEYS.ENABLE_DISPATCH_ORDERLIST:
          formData.siteConfigEnableDispatchingOrder = toBool(item.configValue)
          break
        case KEYS.ENABLE_MOBILE_REGION:
          formData.siteConfigEnableMobileRegion = item.configValue === '' || toBool(item.configValue)
          break
        case KEYS.ENABLE_COMPUTER_REGION:
          formData.siteConfigEnableComputerRegion = item.configValue === '' || toBool(item.configValue)
          break
        case KEYS.ENABLE_PICK_ORDER_SMS_NOTICE:
          formData.orderNoticeConfigEnablePickOrderSmsNotice = toBool(item.configValue)
          break
        case KEYS.ENABLE_FIGHTER_COMPLETE_ORDER_SMS_NOTICE:
          formData.orderNoticeConfigEnableFighterCompleteOrderSmsNotice = toBool(item.configValue)
          break
        case KEYS.ENABLE_CUSTOM_SMS:
          formData.smsConfigEnableCustomSms = toBool(item.configValue)
          break
        case KEYS.ORDER_SUBSCRIBE_SUPPORTED:
          formData.isOrderSubscribeSupported = toBool(item.configValue)
          break
        case KEYS.ORDER_SUBSCRIBE_TEMPLATE_CODE:
          formData.orderSubscribeTemplateCode = String(item.configValue || '')
          break
        case KEYS.ESCORT_TEXT:
          formData.escortText = String(item.configValue || '护航')
          break
        case KEYS.COMPANION_TEXT:
          formData.companionText = String(item.configValue || '陪玩')
          break
        case KEYS.RANK_TEXT:
          formData.rankText = String(item.configValue || '排行榜')
          break
        case KEYS.CAN_CANCEL_ORDER:
          formData.canCancelOrder = toBool(item.configValue)
          break
        case KEYS.CAN_REFUND:
          formData.canRefundOrder = toBool(item.configValue)
          break
        case KEYS.CAN_CHECK_APPLY_REFUND_USER_MOBILE:
          formData.canCheckApplyRefundUserMobile = toBool(item.configValue)
          break
        case KEYS.CAN_CHECK_NOT_REFUND_USER_MOBILE:
          formData.canCheckNotRefundUserMobile = toBool(item.configValue)
          break
        case KEYS.CAN_CHECK_NOT_REFUND_USER_MOBILE_TIME:
          formData.canCheckNotRefundUserMobileTime = Number(item.configValue || 0)
          break
        case KEYS.CAN_SET_USER_NOTICE:
          formData.canSetUserNotice = toBool(item.configValue)
          break
        case KEYS.DEPOSIT_RETURN_SAFE_DAYS:
          formData.depositReturnSafeDays = Number(item.configValue || 0)
          break
        case KEYS.RESTRICT_PRODUCT_IDS:
          formData.restrictProductIds = String(item.configValue || '')
          break
        case KEYS.LIMIT_PICK_ORDER_FEE:
          formData.limitPickOrderFee = Number(item.configValue || 0)
          break
        case KEYS.LIMIT_SAME_TIME_PICK_ORDER_COUNT:
          formData.limitSameTimePickOrderCount = Number(item.configValue || 0)
          break
        case KEYS.PICK_ORDER_VERIFY:
          formData.pickOrderVerify = toBool(item.configValue)
          break
        case KEYS.LIMIT_UPGRADE_PEOPLE_COUNT:
          formData.limitUpgradePeopleCount = Number(item.configValue || 0)
          break
        case KEYS.ALLOW_RECHARGE_DEPOSIT:
          formData.allowRechargeDeposit = toBool(item.configValue)
          break
        case KEYS.FAVORABLE_COMMENT_POINT_ADD:
          formData.favorableCommentPointAdd = Number(item.configValue || 0)
          break
        case KEYS.CONTINUE_POINT_ADD:
          formData.continuePointAdd = Number(item.configValue || 0)
          break
        case KEYS.COMPLAINT_POINT_SUB:
          formData.complaintPointSub = Number(item.configValue || 0)
          break
        case KEYS.CONSUME_AMOUNT_PER_VOTE:
          formData.consumeAmountPerVote = Number(item.configValue || 0)
          break
        case KEYS.ENABLE_COMPANION_RANK:
          formData.enableCompanionRank = toBool(item.configValue)
          break
        case KEYS.GIFT_COMMISSION_RATE:
          formData.giftCommissionRate = Number(item.configValue || 0)
          break
        case KEYS.TOP_CARD_PRICE:
          formData.topCardPrice = Number(item.configValue || 0)
          break
        case KEYS.REFRESH_CARD_PRICE:
          formData.refreshCardPrice = Number(item.configValue || 0)
          break
        case KEYS.COMMISSION_RATE:
          formData.commissionRate = Number(item.configValue || 0)
          break
        case KEYS.ENABLE_INVITATION_MODE:
          formData.enableInvitationMode = toBool(item.configValue)
          break
        case KEYS.ENABLE_CONSUME_RANK:
          formData.enableConsumeRank = toBool(item.configValue)
          break
        case KEYS.ENABLE_AUTO_PICK_ORDER:
          formData.enableAutoPickOrder = toBool(item.configValue)
          break
        case KEYS.CUSTOMER_SERVICE_LINK:
          formData.siteConfigCustomerServiceLink = String(item.configValue || '')
          break
        case KEYS.INVITATION_POSTER:
          formData.invitationPoster = String(item.configValue || '')
          break
        case KEYS.SITE_CONFIG_HTML_H5_KEY:
          formData.htmlH5Key = String(item.configValue || '')
          break
        case KEYS.ORDER_TIMEOUT_TIME: {
          const minutes = Number(item.configValue || 0)
          // 智能转换为合适的单位
          if (minutes === 0) {
            formData.orderTimeoutValue = 0
            formData.orderTimeoutUnit = 'minute'
          }
          else if (minutes % 1440 === 0) {
            // 能被1440整除，转换为天
            formData.orderTimeoutValue = minutes / 1440
            formData.orderTimeoutUnit = 'day'
          }
          else if (minutes % 60 === 0) {
            // 能被60整除，转换为小时
            formData.orderTimeoutValue = minutes / 60
            formData.orderTimeoutUnit = 'hour'
          }
          else {
            // 否则保持分钟
            formData.orderTimeoutValue = minutes
            formData.orderTimeoutUnit = 'minute'
          }
          break
        }
      }
    })
    existingIdMap.value = idMap
  }
  finally {
    loadingAll.value = false
  }
}

// 保存逻辑：根据类型转换成字符串并调用 createOrUpdate
const savingKeys = ref<Set<string>>(new Set())
// 生成随机6位字母和数字组合
function generateRandomKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 生成并保存H5 Key
async function handleGenerateH5Key() {
  try {
    await ElMessageBox.confirm(
      formData.htmlH5Key ? '已存在微信防红链接，生成新的将覆盖旧的链接。是否继续？' : '确认生成微信防红链接？',
      '提示',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
    const randomKey = generateRandomKey()
    formData.htmlH5Key = randomKey
    await handleSave(KEYS.SITE_CONFIG_HTML_H5_KEY, 'string', randomKey)
  }
  catch {
    // 用户取消操作
  }
}

// 计算完整的H5链接
const fullH5Url = computed(() => {
  const domain = tenantDomain.value || window.location.origin
  return formData.htmlH5Key ? `https://${domain}/html/${formData.htmlH5Key}` : ''
})

async function handleSave(key: KeyName, type: 'json' | 'number' | 'boolean' | 'productIds' | 'string', value: any) {
  savingKeys.value.add(key)
  try {
    let configValue = ''
    switch (type) {
      case 'json':
        configValue = JSON.stringify(value ?? [])
        break
      case 'number':
        configValue = value === undefined || value === null || value === '' ? '' : String(value)
        break
      case 'boolean':
        configValue = value ? 'true' : 'false'
        break
      case 'productIds':
        configValue = Array.isArray(value) ? value.join(',') : String(value || '')
        // 同步回显
        formData.restrictProductIds = configValue
        break
      case 'string':
        configValue = String(value || '')
        break
    }

    const id = configList.value.find((item: any) => item.configKey === key)?.id

    const isOrderSubscribeConfig = [
      KEYS.ORDER_SUBSCRIBE_SUPPORTED,
      KEYS.ORDER_SUBSCRIBE_TEMPLATE_CODE,
    ].includes(key as typeof KEYS.ORDER_SUBSCRIBE_SUPPORTED | typeof KEYS.ORDER_SUBSCRIBE_TEMPLATE_CODE)
    const copywritingTitleMap: Partial<Record<KeyName, string>> = {
      [KEYS.ESCORT_TEXT]: '护航文字',
      [KEYS.COMPANION_TEXT]: '陪玩文字',
      [KEYS.RANK_TEXT]: '排行榜文字',
    }
    const copywritingTitle = copywritingTitleMap[key]
    const params: any = {
      title: key === KEYS.ORDER_SUBSCRIBE_SUPPORTED
        ? '启用订单订阅通知'
        : key === KEYS.ORDER_SUBSCRIBE_TEMPLATE_CODE
          ? '模板编码'
          : copywritingTitle || key,
      configKey: key,
      configValue,
    }
    if (isOrderSubscribeConfig) {
      params.configGroupKey = 'notificationConfig'
      params.configGroupName = '消息通知'
      params.description = key === KEYS.ORDER_SUBSCRIBE_SUPPORTED
        ? '开启后，用户支付订单时请求微信订阅授权'
        : '订单被接单或开始服务后的微信公众号订阅通知模板'
    }
    if (copywritingTitle) {
      params.configGroupKey = 'copywritingConfig'
      params.configGroupName = '前端文案'
      params.description = `${copywritingTitle}，用于客户端首页顶部导航`
    }
    if (id) {
      params.id = id
    }
    await SystemConfigApi.updateSystem(params)
    message.success('已保存')
    // 如果是首次创建（无 id），保存后刷新映射
    if (!existingIdMap.value[key]) {
      await loadAll()
    }
  }
  finally {
    savingKeys.value.delete(key)
  }
}

async function handleSaveOrderSubscribeTemplateCode() {
  formData.orderSubscribeTemplateCode = String(formData.orderSubscribeTemplateCode || '').trim()
  await handleSave(KEYS.ORDER_SUBSCRIBE_TEMPLATE_CODE, 'string', formData.orderSubscribeTemplateCode)
}

async function handleSaveCopywriting(
  key: KeyName,
  field: 'escortText' | 'companionText' | 'rankText',
) {
  formData[field] = String(formData[field] || '').trim()
  await handleSave(key, 'string', formData[field])
}

// 保存订单超时时间（需要转换单位为分钟）
async function handleSaveOrderTimeout() {
  const value = formData.orderTimeoutValue
  const unit = formData.orderTimeoutUnit

  // 转换为分钟
  let minutes = 0
  switch (unit) {
    case 'minute':
      minutes = value
      break
    case 'hour':
      minutes = value * 60
      break
    case 'day':
      minutes = value * 1440
      break
  }

  await handleSave(KEYS.ORDER_TIMEOUT_TIME, 'number', minutes)
}

// 保存自动接单模式配置并调用批量更新接口
async function handleSaveAutoPickOrder(val: any) {
  await handleSave(KEYS.ENABLE_AUTO_PICK_ORDER, 'boolean', val)
  try {
    await LevelApply_batchUpdateAllUsersServiceStatus()
    message.success('已批量更新所有用户服务状态')
  }
  catch (error) {
    console.error('批量更新用户服务状态失败:', error)
  }
}

// 监听邀请海报变化自动保存
watch(() => formData.invitationPoster, (newVal, oldVal) => {
  if (oldVal !== undefined && newVal !== oldVal) {
    handleSave(KEYS.INVITATION_POSTER, 'number', newVal)
  }
})

onMounted(() => {
  loadAll()
})
</script>

<template>
  <ContentWrap>
    <div class="config-page">
      <header class="config-overview">
        <div>
          <h2>系统配置</h2>
          <p>{{ totalConfigCount }} 项配置，按业务分组管理</p>
        </div>
        <el-button :loading="loadingAll" @click="loadAll">
          <Icon icon="ep:refresh" class="mr-[5px]" />
          重新加载
        </el-button>
      </header>

      <div class="config-workspace">
        <aside class="config-sidebar">
          <nav class="config-nav" aria-label="配置分组">
            <button
              v-for="group in filteredGroups"
              :key="group.key"
              type="button"
              class="config-nav-item"
              :class="{ active: activeGroup === group.key }"
              @click="activeGroup = group.key"
            >
              <span class="config-nav-text">
                <strong>{{ group.title }}</strong>
                <small>{{ group.description }}</small>
              </span>
              <span class="config-nav-count">{{ group.count }}</span>
            </button>
            <el-empty
              v-if="filteredGroups.length === 0"
              description="未找到配置项"
              :image-size="52"
            />
          </nav>
        </aside>

        <main v-loading="loadingAll" class="config-main">
          <div class="config-group-header">
            <div class="config-group-heading">
              <h3>{{ currentGroup.title }}</h3>
              <p>{{ currentGroup.description }}</p>
            </div>
            <span class="config-group-count">{{ currentGroup.count }} 项配置</span>
          </div>

          <el-form :model="formData" class="config-form" label-position="top">
            <section v-if="activeGroup === 'service'" class="config-section">
              <div class="config-section-title">
                <h4>订单与基础功能</h4>
              </div>
              <div class="config-fields">
                <div class="config-field config-field--span-2">
                  <div class="config-field-label">
                    <strong>订单超时时间</strong>
                    <small>下单后未完成支付的自动关闭时间</small>
                  </div>
                  <div class="config-control-row">
                    <el-input-number v-model="formData.orderTimeoutValue" :min="0" :step="1" />
                    <el-select v-model="formData.orderTimeoutUnit" class="time-unit-select">
                      <el-option label="分钟" value="minute" />
                      <el-option label="小时" value="hour" />
                      <el-option label="天" value="day" />
                    </el-select>
                    <el-button
                      type="primary"
                      :loading="savingKeys.has(KEYS.ORDER_TIMEOUT_TIME)"
                      @click="handleSaveOrderTimeout"
                    >
                      保存
                    </el-button>
                  </div>
                </div>

                <div class="config-field config-field--switch">
                  <div class="config-field-label">
                    <strong>微信极速提现</strong>
                    <small>开放微信极速提现通道</small>
                  </div>
                  <el-switch
                    v-model="formData.withdrawAccountConfigEnableWxFastRefund"
                    :loading="savingKeys.has(KEYS.WITHDRAW_ACCOUNT_CONFIG_ENABLE_WX_FAST_REFUND)"
                    @change="(val: any) => handleSave(KEYS.WITHDRAW_ACCOUNT_CONFIG_ENABLE_WX_FAST_REFUND, 'boolean', val)"
                  />
                </div>

                <div class="config-field config-field--switch">
                  <div class="config-field-label">
                    <strong>强制绑定手机号</strong>
                    <small>使用业务功能前要求绑定手机号</small>
                  </div>
                  <el-switch
                    v-model="formData.siteConfigEnableBindMobile"
                    :loading="savingKeys.has(KEYS.SITE_CONFIG_ENABLE_BIND_MOBILE)"
                    @change="(val: any) => handleSave(KEYS.SITE_CONFIG_ENABLE_BIND_MOBILE, 'boolean', val)"
                  />
                </div>

                <div class="config-field config-field--switch">
                  <div class="config-field-label">
                    <strong>打手申请实名认证</strong>
                    <small>申请打手前必须先通过实名认证</small>
                  </div>
                  <el-switch
                    v-model="formData.siteConfigApplyFighterRealName"
                    :loading="savingKeys.has(KEYS.SITE_CONFIG_APPLY_FIGHTER_REAL_NAME)"
                    @change="(val: any) => handleSave(KEYS.SITE_CONFIG_APPLY_FIGHTER_REAL_NAME, 'boolean', val)"
                  />
                </div>

                <div class="config-field config-field--switch">
                  <div class="config-field-label">
                    <strong>指定陪玩</strong>
                    <small>允许用户选择历史服务人员</small>
                  </div>
                  <el-switch
                    v-model="formData.siteHistoryAcceptors"
                    :loading="savingKeys.has(KEYS.SITE_HISTORY_ACCEPTORS)"
                    @change="(val: any) => handleSave(KEYS.SITE_HISTORY_ACCEPTORS, 'boolean', val)"
                  />
                </div>

                <div class="config-field config-field--switch">
                  <div class="config-field-label">
                    <strong>算术验证码</strong>
                    <small>接单时启用算术验证码校验</small>
                  </div>
                  <el-switch
                    v-model="formData.siteConfigEnableAlgoCaptcha"
                    :loading="savingKeys.has(KEYS.ENABLE_ALGO_CAPTCHA)"
                    @change="(val: any) => handleSave(KEYS.ENABLE_ALGO_CAPTCHA, 'boolean', val)"
                  />
                </div>

                <div class="config-field config-field--switch">
                  <div class="config-field-label">
                    <strong>订单列表延迟</strong>
                    <small>开启接单列表延迟展示</small>
                  </div>
                  <el-switch
                    v-model="formData.siteConfigEnableDispatchingOrder"
                    :loading="savingKeys.has(KEYS.ENABLE_DISPATCH_ORDERLIST)"
                    @change="(val: any) => handleSave(KEYS.ENABLE_DISPATCH_ORDERLIST, 'boolean', val)"
                  />
                </div>
              </div>

              <div class="config-section-title config-section-title--secondary">
                <h4>站点链接</h4>
              </div>
              <div class="config-fields config-fields--two">
                <div class="config-field">
                  <div class="config-field-label">
                    <strong>客服链接</strong>
                    <small>客户端客服入口跳转地址</small>
                  </div>
                  <el-input
                    v-model="formData.siteConfigCustomerServiceLink"
                    placeholder="请输入客服链接"
                    @change="(val: any) => handleSave(KEYS.CUSTOMER_SERVICE_LINK, 'string', val)"
                  />
                </div>
                <div class="config-field">
                  <div class="config-field-label">
                    <strong>微信防红链接</strong>
                    <small>当前租户的 H5 防红访问地址</small>
                  </div>
                  <div class="config-control-row">
                    <el-input :value="fullH5Url" readonly placeholder="点击生成按钮生成防红链接" />
                    <el-button type="primary" @click="handleGenerateH5Key">
                      生成
                    </el-button>
                  </div>
                </div>
              </div>
            </section>

            <section v-else-if="activeGroup === 'region'" class="config-section">
              <div class="config-section-title">
                <h4>客户端入口</h4>
              </div>
              <div class="config-fields config-fields--two">
                <div class="config-field config-field--switch">
                  <div class="config-field-label">
                    <strong>手机端区服</strong>
                    <small>在客户端展示手机端区服入口</small>
                  </div>
                  <el-switch
                    v-model="formData.siteConfigEnableMobileRegion"
                    :loading="savingKeys.has(KEYS.ENABLE_MOBILE_REGION)"
                    @change="(val: any) => handleSave(KEYS.ENABLE_MOBILE_REGION, 'boolean', val)"
                  />
                </div>
                <div class="config-field config-field--switch">
                  <div class="config-field-label">
                    <strong>电脑端区服</strong>
                    <small>在客户端展示电脑端区服入口</small>
                  </div>
                  <el-switch
                    v-model="formData.siteConfigEnableComputerRegion"
                    :loading="savingKeys.has(KEYS.ENABLE_COMPUTER_REGION)"
                    @change="(val: any) => handleSave(KEYS.ENABLE_COMPUTER_REGION, 'boolean', val)"
                  />
                </div>
              </div>
            </section>

            <section v-else-if="activeGroup === 'point'" class="config-section">
              <div class="config-section-title">
                <h4>积分规则</h4>
              </div>
              <div class="config-fields">
                <div class="config-field">
                  <div class="config-field-label">
                    <strong>好评加分</strong>
                    <small>获得好评时增加的积分</small>
                  </div>
                  <el-input-number
                    v-model="formData.favorableCommentPointAdd"
                    :min="0"
                    :step="1"
                    @change="(val: any) => handleSave(KEYS.FAVORABLE_COMMENT_POINT_ADD, 'number', val)"
                  />
                </div>
                <div class="config-field">
                  <div class="config-field-label">
                    <strong>续单加分</strong>
                    <small>产生续单时增加的积分</small>
                  </div>
                  <el-input-number
                    v-model="formData.continuePointAdd"
                    :min="0"
                    :step="1"
                    @change="(val: any) => handleSave(KEYS.CONTINUE_POINT_ADD, 'number', val)"
                  />
                </div>
                <div class="config-field">
                  <div class="config-field-label">
                    <strong>差评减分</strong>
                    <small>支持填写负数</small>
                  </div>
                  <el-input-number
                    v-model="formData.complaintPointSub"
                    :min="-1000000"
                    :step="1"
                    @change="(val: any) => handleSave(KEYS.COMPLAINT_POINT_SUB, 'number', val)"
                  />
                </div>
                <div class="config-field config-field--span-2">
                  <div class="config-field-label">
                    <strong>消费送票金额</strong>
                    <small>每消费指定金额赠送 1 张票，0 表示关闭</small>
                  </div>
                  <div class="config-number-suffix">
                    <el-input-number
                      v-model="formData.consumeAmountPerVote"
                      :min="0"
                      :precision="2"
                      :step="1"
                      @change="(val: any) => handleSave(KEYS.CONSUME_AMOUNT_PER_VOTE, 'number', val)"
                    />
                    <span>元</span>
                  </div>
                </div>
                <div class="config-field config-field--switch">
                  <div class="config-field-label">
                    <strong>陪玩排行榜</strong>
                    <small>展示陪玩积分排行榜</small>
                  </div>
                  <el-switch
                    v-model="formData.enableCompanionRank"
                    :loading="savingKeys.has(KEYS.ENABLE_COMPANION_RANK)"
                    @change="(val: any) => handleSave(KEYS.ENABLE_COMPANION_RANK, 'boolean', val)"
                  />
                </div>
              </div>
            </section>

            <section v-else-if="activeGroup === 'notification'" class="config-section">
              <div class="config-section-title">
                <h4>短信通知</h4>
              </div>
              <div class="config-fields">
                <div class="config-field config-field--switch">
                  <div class="config-field-label">
                    <strong>自定义短信</strong>
                    <small>关闭时使用系统短信渠道</small>
                  </div>
                  <el-switch
                    v-model="formData.smsConfigEnableCustomSms"
                    :loading="savingKeys.has(KEYS.ENABLE_CUSTOM_SMS)"
                    @change="(val: any) => handleSave(KEYS.ENABLE_CUSTOM_SMS, 'boolean', val)"
                  />
                </div>
                <div class="config-field config-field--switch">
                  <div class="config-field-label">
                    <strong>接单短信提醒</strong>
                    <small>接单后发送短信提醒</small>
                  </div>
                  <el-switch
                    v-model="formData.orderNoticeConfigEnablePickOrderSmsNotice"
                    :loading="savingKeys.has(KEYS.ENABLE_PICK_ORDER_SMS_NOTICE)"
                    @change="(val: any) => handleSave(KEYS.ENABLE_PICK_ORDER_SMS_NOTICE, 'boolean', val)"
                  />
                </div>
                <div class="config-field config-field--switch">
                  <div class="config-field-label">
                    <strong>完成订单短信提醒</strong>
                    <small>打手完成订单后发送短信提醒</small>
                  </div>
                  <el-switch
                    v-model="formData.orderNoticeConfigEnableFighterCompleteOrderSmsNotice"
                    :loading="savingKeys.has(KEYS.ENABLE_FIGHTER_COMPLETE_ORDER_SMS_NOTICE)"
                    @change="(val: any) => handleSave(KEYS.ENABLE_FIGHTER_COMPLETE_ORDER_SMS_NOTICE, 'boolean', val)"
                  />
                </div>
              </div>

              <div class="config-section-title config-section-title--secondary">
                <h4>微信订阅通知</h4>
              </div>
              <div class="config-fields config-fields--one">
                <div class="config-field config-field--switch">
                  <div class="config-field-label">
                    <strong>开启订单订阅通知</strong>
                    <small>开启后，用户支付订单时请求微信订阅授权</small>
                  </div>
                  <el-switch
                    v-model="formData.isOrderSubscribeSupported"
                    :loading="savingKeys.has(KEYS.ORDER_SUBSCRIBE_SUPPORTED)"
                    @change="(val: any) => handleSave(KEYS.ORDER_SUBSCRIBE_SUPPORTED, 'boolean', val)"
                  />
                </div>
                <div class="config-field">
                  <div class="config-field-label">
                    <div class="config-label-line">
                      <strong>模板编码</strong>
                      <span class="config-field-note">按租户生效</span>
                    </div>
                    <small>订单被接单或开始服务后，公众号向下单用户发送订阅通知</small>
                  </div>
                  <div class="config-control-row config-control-row--template">
                    <el-input
                      v-model="formData.orderSubscribeTemplateCode"
                      clearable
                      placeholder="请输入微信公众号订阅通知模板 ID"
                      @keyup.enter="handleSaveOrderSubscribeTemplateCode"
                    />
                    <el-button
                      type="primary"
                      :loading="savingKeys.has(KEYS.ORDER_SUBSCRIBE_TEMPLATE_CODE)"
                      @click="handleSaveOrderSubscribeTemplateCode"
                    >
                      保存
                    </el-button>
                  </div>
                </div>
              </div>
            </section>

            <section v-else-if="activeGroup === 'copywriting'" class="config-section">
              <div class="config-section-title">
                <h4>首页顶部导航</h4>
              </div>
              <div class="config-fields">
                <div class="config-field">
                  <div class="config-field-label">
                    <strong>护航文字</strong>
                    <small>首页护航入口的显示名称</small>
                  </div>
                  <div class="config-control-row">
                    <el-input
                      v-model="formData.escortText"
                      maxlength="4"
                      show-word-limit
                      placeholder="护航"
                      @keyup.enter="handleSaveCopywriting(KEYS.ESCORT_TEXT, 'escortText')"
                    />
                    <el-button
                      type="primary"
                      :loading="savingKeys.has(KEYS.ESCORT_TEXT)"
                      @click="handleSaveCopywriting(KEYS.ESCORT_TEXT, 'escortText')"
                    >
                      保存
                    </el-button>
                  </div>
                </div>
                <div class="config-field">
                  <div class="config-field-label">
                    <strong>陪玩文字</strong>
                    <small>首页陪玩入口的显示名称</small>
                  </div>
                  <div class="config-control-row">
                    <el-input
                      v-model="formData.companionText"
                      maxlength="4"
                      show-word-limit
                      placeholder="陪玩"
                      @keyup.enter="handleSaveCopywriting(KEYS.COMPANION_TEXT, 'companionText')"
                    />
                    <el-button
                      type="primary"
                      :loading="savingKeys.has(KEYS.COMPANION_TEXT)"
                      @click="handleSaveCopywriting(KEYS.COMPANION_TEXT, 'companionText')"
                    >
                      保存
                    </el-button>
                  </div>
                </div>
                <div class="config-field">
                  <div class="config-field-label">
                    <strong>排行榜文字</strong>
                    <small>首页排行榜入口的显示名称</small>
                  </div>
                  <div class="config-control-row">
                    <el-input
                      v-model="formData.rankText"
                      maxlength="4"
                      show-word-limit
                      placeholder="排行榜"
                      @keyup.enter="handleSaveCopywriting(KEYS.RANK_TEXT, 'rankText')"
                    />
                    <el-button
                      type="primary"
                      :loading="savingKeys.has(KEYS.RANK_TEXT)"
                      @click="handleSaveCopywriting(KEYS.RANK_TEXT, 'rankText')"
                    >
                      保存
                    </el-button>
                  </div>
                </div>
              </div>
            </section>

            <section v-else-if="activeGroup === 'app'" class="config-section">
              <div class="config-section-title">
                <h4>业务模式与费率</h4>
              </div>
              <div class="config-fields">
                <div class="config-field">
                  <div class="config-field-label">
                    <strong>提现手续费率</strong>
                    <small>陪玩或打手提现时使用的费率</small>
                  </div>
                  <div class="config-number-suffix">
                    <el-input-number
                      v-model="formData.withdrawFeeRate"
                      :min="0"
                      :max="100"
                      @change="(val: any) => handleSave(KEYS.FEE_RATE, 'number', val)"
                    />
                    <span>%</span>
                  </div>
                </div>
                <div class="config-field config-field--switch">
                  <div class="config-field-label">
                    <strong>自动接单模式</strong>
                    <small>开启后同步更新用户服务状态</small>
                  </div>
                  <el-switch
                    v-model="formData.enableAutoPickOrder"
                    :loading="savingKeys.has(KEYS.ENABLE_AUTO_PICK_ORDER)"
                    @change="handleSaveAutoPickOrder"
                  />
                </div>
                <div class="config-field config-field--switch">
                  <div class="config-field-label">
                    <strong>邀请模式</strong>
                    <small>开放用户邀请关系</small>
                  </div>
                  <el-switch
                    v-model="formData.enableInvitationMode"
                    :loading="savingKeys.has(KEYS.ENABLE_INVITATION_MODE)"
                    @change="(val: any) => handleSave(KEYS.ENABLE_INVITATION_MODE, 'boolean', val)"
                  />
                </div>
                <div class="config-field config-field--switch">
                  <div class="config-field-label">
                    <strong>消费排名</strong>
                    <small>展示用户消费排行榜</small>
                  </div>
                  <el-switch
                    v-model="formData.enableConsumeRank"
                    :loading="savingKeys.has(KEYS.ENABLE_CONSUME_RANK)"
                    @change="(val: any) => handleSave(KEYS.ENABLE_CONSUME_RANK, 'boolean', val)"
                  />
                </div>
                <div class="config-field">
                  <div class="config-field-label">
                    <strong>分佣比例</strong>
                    <small>纯利润返给上级的比例</small>
                  </div>
                  <div class="config-number-suffix">
                    <el-input-number
                      v-model="formData.commissionRate"
                      :min="0"
                      :max="100"
                      :step="1"
                      @change="(val: any) => handleSave(KEYS.COMMISSION_RATE, 'number', val)"
                    />
                    <span>%</span>
                  </div>
                </div>
                <div class="config-field config-field--poster">
                  <div class="config-field-label">
                    <strong>邀请海报</strong>
                    <small>用户分享邀请时展示的海报</small>
                  </div>
                  <UploadImg v-model="formData.invitationPoster" height="160px" width="120px" />
                </div>
              </div>
            </section>
          </el-form>
        </main>
      </div>
    </div>
  </ContentWrap>
</template>

<style lang="scss" scoped>
.config-page {
  color: var(--el-text-color-primary);
}

.config-overview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 54px;
  padding: 0 2px 18px;

  h2,
  p {
    margin: 0;
  }

  h2 {
    font-size: 20px;
    font-weight: 600;
    line-height: 28px;
  }

  p {
    margin-top: 4px;
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }
}

.config-workspace {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  min-height: 650px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  background: var(--el-bg-color);
}

.config-sidebar {
  border-right: 1px solid var(--el-border-color-light);
  background: var(--el-fill-color-extra-light);
}

.config-search {
  padding: 16px 14px 12px;
}

.config-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 8px 16px;
}

.config-nav-item {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  width: 100%;
  min-height: 56px;
  padding: 8px 12px;
  border: 0;
  border-radius: 2px;
  color: var(--el-text-color-regular);
  text-align: left;
  background: transparent;
  cursor: pointer;
  transition:
    color 0.16s ease,
    background-color 0.16s ease;

  &:hover {
    background: var(--el-fill-color-light);
  }

  &.active {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);

    &::before {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 2px;
      background: var(--el-color-primary);
      content: '';
    }
  }
}

.config-nav-text {
  min-width: 0;
  padding-left: 0;

  strong,
  small {
    display: block;
    overflow: hidden;
    letter-spacing: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
  }

  small {
    margin-top: 2px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    line-height: 17px;
  }
}

.config-nav-count {
  min-width: 20px;
  color: var(--el-text-color-secondary);
  font-size: 11px;
  text-align: right;
}

.config-main {
  min-width: 0;
  background: var(--el-bg-color);
}

.config-group-header {
  position: sticky;
  z-index: 3;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 76px;
  padding: 14px 22px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}

.config-group-heading {
  h3,
  p {
    margin: 0;
  }

  h3 {
    font-size: 17px;
    font-weight: 600;
    line-height: 24px;
  }

  p {
    margin-top: 2px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    line-height: 18px;
  }
}

.config-group-count,
.config-field-note {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.config-form {
  padding: 0 22px 32px;
}

.config-section-title {
  padding: 24px 0 12px;

  h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    line-height: 22px;
  }

  &--secondary {
    padding-top: 28px;
  }
}

.config-fields {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  overflow: hidden;
  border-top: 1px solid var(--el-border-color-lighter);
  border-left: 1px solid var(--el-border-color-lighter);
  border-radius: 5px;

  &--two {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  &--one {
    grid-template-columns: minmax(0, 1fr);
  }
}

.config-field {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  min-height: 128px;
  padding: 18px;
  border-right: 1px solid var(--el-border-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);

  &--span-2 {
    grid-column: span 2;
  }

  &--switch {
    flex-direction: row;
    align-items: center;
    gap: 18px;
  }

  &--poster {
    min-height: 238px;
  }

  :deep(.el-input-number) {
    width: min(100%, 240px);
  }
}

.config-field-label {
  min-width: 0;
  margin-bottom: 16px;

  strong,
  small {
    display: block;
    letter-spacing: 0;
  }

  strong {
    font-size: 14px;
    font-weight: 500;
    line-height: 21px;
  }

  small {
    margin-top: 4px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    line-height: 18px;
  }
}

.config-field--switch .config-field-label {
  margin-bottom: 0;
}

.config-label-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.config-control-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;

  :deep(.el-input),
  :deep(.el-input-number) {
    flex: 1;
    min-width: 0;
  }

  &--template {
    max-width: 760px;
  }
}

.time-unit-select {
  width: 100px;
  flex: 0 0 100px;
}

.config-number-suffix {
  display: flex;
  align-items: center;
  gap: 8px;

  span {
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }
}

@media (max-width: 1200px) {
  .config-fields {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .config-fields--one {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 900px) {
  .config-workspace {
    grid-template-columns: 1fr;
  }

  .config-sidebar {
    border-right: 0;
    border-bottom: 1px solid var(--el-border-color-light);
  }

  .config-nav {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .config-group-header {
    position: static;
  }
}

@media (max-width: 640px) {
  .config-overview {
    align-items: stretch;
    flex-direction: column;
    gap: 12px;
  }

  .config-nav,
  .config-fields,
  .config-fields--two {
    grid-template-columns: minmax(0, 1fr);
  }

  .config-field--span-2 {
    grid-column: span 1;
  }

  .config-form {
    padding: 0 14px 24px;
  }

  .config-control-row {
    align-items: stretch;
    flex-wrap: wrap;

    :deep(.el-input),
    :deep(.el-input-number) {
      flex-basis: calc(100% - 108px);
    }
  }
}
</style>

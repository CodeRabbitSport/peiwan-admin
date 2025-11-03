<script setup lang="ts">
import { SystemConfigApi } from '@/api/gamer/systemconfig'
import UploadImg from '@/components/UploadFile/src/UploadImg.vue'

import ProductSelectorDialog from './components/ProductSelectorDialog.vue'

defineOptions({ name: 'SystemConfig' })

const message = useMessage()

// 配置键常量
const KEYS = {
  WITHDRAW_ACCOUNT_CONFIG_ENABLE_WX_FAST_REFUND: 'withdrawAccountConfigEnableWxFastRefund',
  // 话题配置
  HOT_TOPIC_LIST: 'topicConfigHotTopicList',
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
  // 礼物/商品商店配置
  GIFT_COMMISSION_RATE: 'itemShopConfigGiftCommissionRate',
  TOP_CARD_PRICE: 'itemShopConfigTopCardPrice',
  REFRESH_CARD_PRICE: 'itemShopConfigRefreshCardPrice',
  ENABLE_PICK_ORDER_SMS_NOTICE: 'orderNoticeConfigEnablePickOrderSmsNotice',
  ENABLE_FIGHTER_COMPLETE_ORDER_SMS_NOTICE: 'orderNoticeConfigEnableFighterCompleteOrderSmsNotice',
  // 分佣配置
  COMMISSION_RATE: 'commissionConfigCommissionRate',
  // 应用配置
  ENABLE_INVITATION_MODE: 'appConfigEnableInvitationMode',
  INVITATION_POSTER: 'appConfigInvitePoster',
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
  // 礼物/商品商店配置
  giftCommissionRate: 0,
  topCardPrice: 0,
  refreshCardPrice: 0,
  orderNoticeConfigEnablePickOrderSmsNotice: false,
  orderNoticeConfigEnableFighterCompleteOrderSmsNotice: false,
  // 分佣配置
  commissionRate: 0,
  // 应用配置
  enableInvitationMode: false,
  invitationPoster: '',
})

// 当前已有配置映射（key -> id）
const existingIdMap = ref<Record<string, number>>({})

const loadingAll = ref(false)
const activeGroups = ref<string[]>(['topic', 'order', 'service', 'point', 'itemShop', 'sms', 'commission', 'app'])

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

// 加载全部配置（分页拉取一页足够）
async function loadAll() {
  loadingAll.value = true
  try {
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
        case KEYS.ENABLE_PICK_ORDER_SMS_NOTICE:
          formData.orderNoticeConfigEnablePickOrderSmsNotice = toBool(item.configValue)
          break
        case KEYS.ENABLE_FIGHTER_COMPLETE_ORDER_SMS_NOTICE:
          formData.orderNoticeConfigEnableFighterCompleteOrderSmsNotice = toBool(item.configValue)
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
          // 初始化选中 Map
          initSelectedProductsFromIds(formData.restrictProductIds)
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
        case KEYS.INVITATION_POSTER:
          formData.invitationPoster = String(item.configValue || '')
          break
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
async function handleSave(key: KeyName, type: 'json' | 'number' | 'boolean' | 'productIds', value: any) {
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
    }

    const id = configList.value.find((item: any) => item.configKey === key)?.id

    const params: any = {
      title: key,
      configKey: key,
      configValue,
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

// ---------------- 商品选择逻辑 ----------------
const productSelectorVisible = ref(false)
const selectedProductIds = ref<number[]>([])
const selectedProductNamesDisplay = computed(() => {
  const ids = selectedProductIds.value
  if (ids.length === 0) {
    const fromForm = (formData.restrictProductIds || '').split(',').filter(Boolean)
    return fromForm.length ? `已选择 ${fromForm.length} 个` : ''
  }
  return `已选择 ${ids.length} 个`
})

function initSelectedProductsFromIds(idsStr: string) {
  selectedProductIds.value = (idsStr || '')
    .split(',')
    .map(s => Number(s))
    .filter(n => !Number.isNaN(n))
}

function openProductSelector() {
  productSelectorVisible.value = true
}

function confirmProductSelection(ids: number[]) {
  selectedProductIds.value = ids
  handleSave(KEYS.RESTRICT_PRODUCT_IDS, 'productIds', ids)
}

function clearSelectedProducts() {
  selectedProductIds.value = []
  handleSave(KEYS.RESTRICT_PRODUCT_IDS, 'productIds', [])
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
    <el-form v-loading="loadingAll" :model="formData" label-width="180px">
      <el-collapse v-model="activeGroups">
        <!-- 服务配置 -->
        <el-collapse-item name="service" title="服务配置">
          <el-row :gutter="16">
            <el-col :xs="24" :sm="12" :md="8" :lg="8">
              <el-form-item label="接单保证金">
                <el-input-number
                  v-model="formData.pickOrderDeposit"
                  :min="0"
                  :step="1"
                  @change="(val: any) => handleSave(KEYS.PICK_ORDER_DEPOSIT, 'number', val)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="8">
              <el-form-item label="每日接单次数">
                <el-input-number
                  v-model="formData.dailyPickOrderCount"
                  :min="0"
                  :step="1"
                  @change="(val: any) => handleSave(KEYS.DAILY_PICK_ORDER_COUNT, 'number', val)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="8">
              <el-form-item label="接单延迟时间(秒)">
                <el-input-number
                  v-model="formData.pickOrderDelayTime"
                  :min="0"
                  :step="1"
                  @change="(val: any) => handleSave(KEYS.PICK_ORDER_DELAY_TIME, 'number', val)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="8">
              <el-form-item label="提现手续费率(%)">
                <el-input-number
                  v-model="formData.withdrawFeeRate"
                  :min="0"
                  :max="100"
                  @change="(val: any) => handleSave(KEYS.FEE_RATE, 'number', val)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="8">
              <el-form-item label="订单服务费解冻时间(秒)">
                <el-input-number
                  v-model="formData.orderCommissionReleaseTime"
                  :min="0"
                  :step="1"
                  @change="(val: any) => handleSave(KEYS.ORDER_COMMISSION_RELEASE_TIME, 'number', val)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="8">
              <el-form-item label="打赏金额抽成比例(%)">
                <el-input-number
                  v-model="formData.commissionRateOnTips"
                  :min="0"
                  :max="100"
                  :step="1"
                  @change="(val: any) => handleSave(KEYS.COMMISSION_RATE_ON_TIPS, 'number', val)"
                />
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12" :md="8" :lg="8">
              <el-form-item label="是否可以退款接单订单">
                <el-switch
                  v-model="formData.canRefundOrder"
                  @change="(val: any) => handleSave(KEYS.CAN_REFUND, 'boolean', val)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="8">
              <el-form-item label="是否可以查看申请退款用户手机号" label-width="250px">
                <el-switch
                  v-model="formData.canCheckApplyRefundUserMobile"
                  @change="(val: any) => handleSave(KEYS.CAN_CHECK_APPLY_REFUND_USER_MOBILE, 'boolean', val)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="8">
              <el-form-item label="是否可以查看未退款用户手机号" label-width="250px">
                <el-switch
                  v-model="formData.canCheckNotRefundUserMobile"
                  @change="(val: any) => handleSave(KEYS.CAN_CHECK_NOT_REFUND_USER_MOBILE, 'boolean', val)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="8">
              <el-form-item label="查看未退款用户手机号天数">
                <el-input-number
                  v-model="formData.canCheckNotRefundUserMobileTime"
                  :min="-1"
                  :step="1"
                  @change="(val: any) => handleSave(KEYS.CAN_CHECK_NOT_REFUND_USER_MOBILE_TIME, 'number', val)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="8">
              <el-form-item label="保证金退还安全期限(天)">
                <el-input-number
                  v-model="formData.depositReturnSafeDays"
                  :min="0"
                  :step="1"
                  @change="(val: any) => handleSave(KEYS.DEPOSIT_RETURN_SAFE_DAYS, 'number', val)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="8">
              <el-form-item label="限制指定接单商品编号列表">
                <el-input
                  :model-value="selectedProductNamesDisplay"
                  placeholder="点击选择商品"
                  readonly
                  @click="openProductSelector"
                >
                  <template #suffix>
                    <el-button link type="danger" @click.stop="clearSelectedProducts">
                      清空
                    </el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="8">
              <el-form-item label="限制每日接单缴费金额">
                <el-input-number
                  v-model="formData.limitPickOrderFee" :min="0" :step="1"
                  @change="(val: any) => handleSave(KEYS.LIMIT_PICK_ORDER_FEE, 'number', val)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="8">
              <el-form-item label="限制同一时间段接单单数">
                <el-input-number
                  v-model="formData.limitSameTimePickOrderCount" :min="0" :step="1"
                  @change="(val: any) => handleSave(KEYS.LIMIT_SAME_TIME_PICK_ORDER_COUNT, 'number', val)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="8">
              <el-form-item label="是否可以设置用户公告">
                <el-switch
                  v-model="formData.canSetUserNotice"
                  @change="(val: any) => handleSave(KEYS.CAN_SET_USER_NOTICE, 'boolean', val)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="8">
              <el-form-item label="接单验证类型">
                <el-switch
                  v-model="formData.pickOrderVerify"
                  @change="(val: any) => handleSave(KEYS.PICK_ORDER_VERIFY, 'boolean', val)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="8">
              <el-form-item label="限制升级人数名额">
                <el-input-number
                  v-model="formData.limitUpgradePeopleCount" :min="0" :step="1"
                  @change="(val: any) => handleSave(KEYS.LIMIT_UPGRADE_PEOPLE_COUNT, 'number', val)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="8">
              <el-form-item label="允许订单抵扣保证金">
                <el-switch
                  v-model="formData.allowRechargeDeposit"
                  @change="(val: any) => handleSave(KEYS.ALLOW_RECHARGE_DEPOSIT, 'boolean', val)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="8">
              <el-form-item label="是否可以取消接单订单">
                <el-switch
                  v-model="formData.canCancelOrder"
                  @change="(val: any) => handleSave(KEYS.CAN_CANCEL_ORDER, 'boolean', val)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="8">
              <el-form-item label="是否开启微信急速提现">
                <el-switch
                  v-model="formData.withdrawAccountConfigEnableWxFastRefund"
                  @change="(val: any) => handleSave(KEYS.WITHDRAW_ACCOUNT_CONFIG_ENABLE_WX_FAST_REFUND, 'boolean', val)"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 积分配置 -->
        <el-collapse-item name="point" title="积分配置">
          <el-row :gutter="16">
            <el-col :xs="24" :sm="12" :md="8" :lg="8">
              <el-form-item label="好评加分">
                <el-input-number
                  v-model="formData.favorableCommentPointAdd" :min="0" :step="1"
                  @change="(val: any) => handleSave(KEYS.FAVORABLE_COMMENT_POINT_ADD, 'number', val)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="8">
              <el-form-item label="续单加分">
                <el-input-number
                  v-model="formData.continuePointAdd" :min="0" :step="1"
                  @change="(val: any) => handleSave(KEYS.CONTINUE_POINT_ADD, 'number', val)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="8">
              <el-form-item label="差评减分(可为负)">
                <el-input-number
                  v-model="formData.complaintPointSub" :step="1" :min="-1000000"
                  @change="(val: any) => handleSave(KEYS.COMPLAINT_POINT_SUB, 'number', val)"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 短信配置 -->
        <el-collapse-item name="sms" title="短信配置">
          <el-row :gutter="16">
            <el-col :xs="24" :sm="12" :md="8" :lg="8">
              <el-form-item label="开启接单短信提醒">
                <el-switch
                  v-model="formData.orderNoticeConfigEnablePickOrderSmsNotice"
                  @change="(val: any) => handleSave(KEYS.ENABLE_PICK_ORDER_SMS_NOTICE, 'boolean', val)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="8">
              <el-form-item label="开启打手完成订单短信提醒">
                <el-switch
                  v-model="formData.orderNoticeConfigEnableFighterCompleteOrderSmsNotice"
                  @change="(val: any) => handleSave(KEYS.ENABLE_FIGHTER_COMPLETE_ORDER_SMS_NOTICE, 'boolean', val)"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 邀请配置 -->
        <el-collapse-item name="app" title="应用配置">
          <el-row :gutter="16">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="是否开启邀请模式">
                <el-switch
                  v-model="formData.enableInvitationMode"
                  @change="(val: any) => handleSave(KEYS.ENABLE_INVITATION_MODE, 'boolean', val)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="分佣比例(%)">
                <el-input-number
                  v-model="formData.commissionRate"
                  :min="0"
                  :max="100"
                  :step="1"
                  @change="(val: any) => handleSave(KEYS.COMMISSION_RATE, 'number', val)"
                />
                <div style="font-size: 12px; color: #909399; margin-top: 4px;" class="ml-2">
                  纯利润反给上级的比例
                </div>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6">
              <el-form-item label="邀请海报">
                <UploadImg
                  v-model="formData.invitationPoster"
                  height="200px"
                  width="150px"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 话题配置 -->
        <!-- <el-collapse-item name="topic" title="话题配置">
          <el-form-item label="热门话题列表">
            <HotTopicListEditor
              v-model="formData.hotTopicList"
              @change="(val: any) => handleSave(KEYS.HOT_TOPIC_LIST, 'json', val)"
            />
          </el-form-item>
        </el-collapse-item>
        <el-collapse-item name="itemShop" title="礼物/商店配置">
          <el-row :gutter="16">
            <el-col :xs="24" :sm="12" :md="8" :lg="8">
              <el-form-item label="礼物抽成比例(%)">
                <el-input-number
                  v-model="formData.giftCommissionRate"
                  :min="0"
                  :max="100"
                  :step="1"
                  @change="(val: any) => handleSave(KEYS.GIFT_COMMISSION_RATE, 'number', val)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="8">
              <el-form-item label="置顶卡价格">
                <el-input-number
                  v-model="formData.topCardPrice"
                  :min="0"
                  :step="1"
                  @change="(val: any) => handleSave(KEYS.TOP_CARD_PRICE, 'number', val)"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="8">
              <el-form-item label="刷新卡价格">
                <el-input-number
                  v-model="formData.refreshCardPrice"
                  :min="0"
                  :step="1"
                  @change="(val: any) => handleSave(KEYS.REFRESH_CARD_PRICE, 'number', val)"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item> -->
      </el-collapse>
    </el-form>
  </ContentWrap>

  <ProductSelectorDialog
    v-model="selectedProductIds" v-model:visible="productSelectorVisible"
    @confirm="confirmProductSelection"
  />
</template>

<style lang="scss" scoped>
.text-truncate {
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}
</style>

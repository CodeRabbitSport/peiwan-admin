<script setup lang="ts">
import type { Coupon } from '@/api/gamer/coupon'
import { CouponApi } from '@/api/gamer/coupon'
import type { UserCoupon } from '@/api/gamer/usercoupon'
import { UserCouponApi } from '@/api/gamer/usercoupon'
import { fenToYuan, yuanToFen } from '@/utils'

/** 用户优惠券 表单 */
defineOptions({ name: 'UserCouponForm' })

const emit = defineEmits(['success'])
const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const SOURCE_TYPE_SYSTEM = 10
const STATUS_UNUSED = 0
const DEFAULT_BIZ_ID = 0
const COUPON_CODE_LENGTH = 10
const COUPON_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const ONE_DAY = 24 * 60 * 60 * 1000

interface UserCouponFormData {
  id?: number
  userId?: number
  couponId?: number
  couponCode?: string
  couponName?: string
  couponType?: number
  couponAmount?: number | string
  couponMinOrderAmount?: number | string
  status?: number
  receivedAt?: number | string
  usedAt?: number | string
  bizId?: number
  validUntil?: number | string
  sourceType?: number
}

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const couponLoading = ref(false) // 优惠券下拉加载中
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const couponOptions = ref<Coupon[]>([])
const formData = ref<UserCouponFormData>(createDefaultFormData())
const formRules = reactive({
  userId: [{ required: true, message: '用户ID不能为空', trigger: 'blur' }],
  couponId: [{ required: true, message: '优惠券不能为空', trigger: 'change' }],
})
const formRef = ref() // 表单 Ref

const couponTypeTextMap: Record<number, string> = {
  1: '满减券',
  2: '折扣券',
  3: '无门槛券',
}

const selectedCoupon = computed(() => {
  return couponOptions.value.find(coupon => coupon.id === formData.value.couponId)
})

/** 打开弹窗 */
async function open(type: string, id?: number) {
  dialogVisible.value = true
  dialogTitle.value = t(`action.${type}`)
  formType.value = type
  resetForm()
  await getCouponOptions()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await UserCouponApi.getUserCoupon(id)
      // 分转元用于回显（折扣券除外）
      if (formData.value.couponType !== 2 && formData.value.couponAmount) {
        formData.value.couponAmount = fenToYuan(formData.value.couponAmount) as any
      }
      if (formData.value.couponMinOrderAmount != null) {
        formData.value.couponMinOrderAmount = fenToYuan(formData.value.couponMinOrderAmount) as any
      }
    }
    finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
async function submitForm() {
  // 校验表单
  await formRef.value.validate()
  fillGeneratedFields()
  if (!hasRequiredCouponSnapshot()) {
    message.error('请选择有效的优惠券')
    return
  }
  // 提交请求
  formLoading.value = true
  try {
    const data = { ...formData.value } as unknown as UserCoupon
    // 元转分提交（折扣券除外）
    if (data.couponType !== 2 && data.couponAmount) {
      data.couponAmount = yuanToFen(data.couponAmount)
    }
    if (data.couponMinOrderAmount != null) {
      data.couponMinOrderAmount = yuanToFen(data.couponMinOrderAmount)
    }

    if (formType.value === 'create') {
      await UserCouponApi.createUserCoupon(data)
      message.success(t('common.createSuccess'))
    }
    else {
      await UserCouponApi.updateUserCoupon(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  }
  finally {
    formLoading.value = false
  }
}

async function getCouponOptions() {
  couponLoading.value = true
  try {
    const data = await CouponApi.getCouponPage({})
    couponOptions.value = data?.list ?? []
  }
  catch {
    couponOptions.value = []
    message.error('优惠券列表加载失败')
  }
  finally {
    couponLoading.value = false
  }
}

function handleCouponChange(couponId?: number) {
  const coupon = couponOptions.value.find(item => item.id === couponId)
  if (!coupon) {
    clearCouponSnapshot()
    return
  }
  applyCouponSnapshot(coupon)
}

function applyCouponSnapshot(coupon: Coupon) {
  const couponAmount = coupon.couponAmount
  formData.value.couponId = coupon.id
  formData.value.couponName = coupon.couponName
  formData.value.couponType = coupon.couponType
  formData.value.couponAmount = couponAmount == null
    ? undefined
    : coupon.couponType === 2
      ? couponAmount
      : fenToYuan(couponAmount)
  formData.value.couponMinOrderAmount = fenToYuan(coupon.couponMinOrderAmount)
  formData.value.validUntil = calculateValidUntil(coupon.validityDays)
}

function clearCouponSnapshot() {
  formData.value.couponName = undefined
  formData.value.couponType = undefined
  formData.value.couponAmount = undefined
  formData.value.couponMinOrderAmount = undefined
  formData.value.validUntil = undefined
}

function fillGeneratedFields() {
  if (!formData.value.couponCode) {
    formData.value.couponCode = generateCouponCode()
  }
  formData.value.status ??= STATUS_UNUSED
  formData.value.receivedAt ??= Date.now()
  formData.value.bizId ??= DEFAULT_BIZ_ID
  formData.value.sourceType ??= SOURCE_TYPE_SYSTEM

  if (selectedCoupon.value) {
    applyCouponSnapshot(selectedCoupon.value)
  }
}

function hasRequiredCouponSnapshot() {
  return Boolean(
    formData.value.couponId
    && formData.value.couponCode
    && formData.value.couponName
    && formData.value.couponType
    && formData.value.couponAmount != null
    && formData.value.couponMinOrderAmount != null
    && formData.value.status != null
    && formData.value.receivedAt
    && formData.value.validUntil
    && formData.value.sourceType,
  )
}

function calculateValidUntil(validityDays?: number) {
  const days = Number(validityDays)
  if (!Number.isFinite(days)) {
    return undefined
  }
  return getTimestamp(formData.value.receivedAt) + days * ONE_DAY
}

function getTimestamp(value?: number | string) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const timestamp = Number(value)
    if (Number.isFinite(timestamp)) {
      return timestamp
    }
    const parsedTimestamp = new Date(value).getTime()
    if (Number.isFinite(parsedTimestamp)) {
      return parsedTimestamp
    }
  }
  return Date.now()
}

function generateCouponCode() {
  let code = ''
  if (typeof crypto === 'object' && typeof crypto.getRandomValues === 'function') {
    const values = crypto.getRandomValues(new Uint8Array(COUPON_CODE_LENGTH))
    for (const value of values) {
      code += COUPON_CODE_CHARS[value % COUPON_CODE_CHARS.length]
    }
    return code
  }
  for (let i = 0; i < COUPON_CODE_LENGTH; i++) {
    code += COUPON_CODE_CHARS[Math.floor(Math.random() * COUPON_CODE_CHARS.length)]
  }
  return code
}

function getCouponOptionLabel(coupon: Coupon) {
  return [
    coupon.couponName || '未命名优惠券',
    getCouponTypeText(coupon.couponType),
    formatCouponAmount(coupon),
    formatCouponMinAmount(coupon),
    formatValidityDays(coupon.validityDays),
  ].join(' / ')
}

function getCouponTypeText(type?: number) {
  return type ? couponTypeTextMap[type] ?? '未知类型' : '未知类型'
}

function formatCouponAmount(coupon: Coupon) {
  if (coupon.couponAmount == null) {
    return '-'
  }
  if (coupon.couponType === 2) {
    const discount = Number(coupon.couponAmount)
    return Number.isFinite(discount) ? `${Number((discount / 10).toFixed(2))}折` : '-'
  }
  return `${fenToYuan(coupon.couponAmount)}元`
}

function formatCouponMinAmount(coupon: Coupon) {
  if (coupon.couponType === 3 || Number(coupon.couponMinOrderAmount) === 0) {
    return '无门槛'
  }
  return `满${fenToYuan(coupon.couponMinOrderAmount)}元可用`
}

function formatValidityDays(validityDays?: number) {
  return validityDays ? `有效${validityDays}天` : '未设置有效期'
}

/** 重置表单 */
function resetForm() {
  formData.value = createDefaultFormData()
  formRef.value?.resetFields()
}

function createDefaultFormData(): UserCouponFormData {
  return {
    id: undefined,
    userId: undefined,
    couponId: undefined,
    couponCode: generateCouponCode(),
    couponName: undefined,
    couponType: undefined,
    couponAmount: undefined,
    couponMinOrderAmount: undefined,
    status: STATUS_UNUSED,
    receivedAt: Date.now(),
    usedAt: undefined,
    bizId: DEFAULT_BIZ_ID,
    validUntil: undefined,
    sourceType: SOURCE_TYPE_SYSTEM,
  }
}
</script>

<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="用户ID" prop="userId">
        <el-input v-model="formData.userId" placeholder="请输入用户ID" />
      </el-form-item>
      <el-form-item label="优惠券" prop="couponId">
        <el-select
          v-model="formData.couponId"
          filterable
          clearable
          :loading="couponLoading"
          placeholder="请选择优惠券"
          class="!w-full"
          @change="handleCouponChange"
        >
          <el-option
            v-for="coupon in couponOptions"
            :key="coupon.id"
            :label="getCouponOptionLabel(coupon)"
            :value="coupon.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" :disabled="formLoading" @click="submitForm">
        确 定
      </el-button>
      <el-button @click="dialogVisible = false">
        取 消
      </el-button>
    </template>
  </Dialog>
</template>

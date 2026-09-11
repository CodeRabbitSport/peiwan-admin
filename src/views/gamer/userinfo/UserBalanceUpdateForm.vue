<script setup lang="ts">
import { UserInfoApi } from '@/api/gamer/userinfo'
import { VirtualPaymentApi } from '@/api/gamer/virtualpayment'
import * as WalletApi from '@/api/pay/wallet/balance'
import { convertToInteger, formatToFraction } from '@/utils'

defineOptions({ name: 'GamerUserBalanceUpdateForm' })

const emit = defineEmits(['success'])
const message = useMessage()

const dialogVisible = ref(false)
const formLoading = ref(false)
const formRef = ref()
const virtualPaymentEnabled = ref(false)
const virtualBalance = ref<number>()
const virtualCoinBalance = ref<number>()
const virtualWalletUnit = ref(100)
const virtualBalanceError = ref('')
type BalanceTarget = 'balance' | 'virtual'

const formData = ref({
  id: undefined as number | undefined,
  nickname: undefined as string | undefined,
  balance: '0',
  adjustTarget: 'balance' as BalanceTarget,
  changeBalance: 0,
  changeType: 1 as 1 | -1,
})
const formRules = reactive({
  changeBalance: [{ required: true, message: '变动余额不能为空', trigger: 'blur' }],
})

const isVirtualAdjustment = computed(() => formData.value.adjustTarget === 'virtual')
const balanceTargetLabel = computed(() => (isVirtualAdjustment.value ? '微信虚拟余额' : '余额'))
const adjustedBalance = computed(() => {
  const currentBalance = isVirtualAdjustment.value
    ? virtualBalance.value
    : convertToInteger(formData.value.balance)
  if (currentBalance == null) return undefined
  return currentBalance + convertToInteger(formData.value.changeBalance) * formData.value.changeType
})
const balanceResult = computed(() =>
  adjustedBalance.value == null ? undefined : formatToFraction(adjustedBalance.value),
)
const changeBalanceStep = computed(() =>
  isVirtualAdjustment.value ? virtualWalletUnit.value / 100 : 0.1,
)

function getErrorMessage(error: unknown) {
  return typeof error === 'string' && error !== 'error'
    ? error
    : (error as any)?.response?.data?.msg
      || (error as any)?.data?.msg
      || (error as any)?.message
      || '用户需要先在小程序发起一次下单、送礼或充值操作'
}

async function open(id?: number) {
  dialogVisible.value = true
  resetForm()
  if (id != null) {
    formLoading.value = true
    try {
      const user = await UserInfoApi.getUserInfo(id)
      const [wallet, enabled] = await Promise.all([
        WalletApi.getWallet({ userId: user.id || 0 }),
        VirtualPaymentApi.isEnabled(),
      ])
      formData.value.id = user.id
      formData.value.nickname = user.nickname
      formData.value.balance = formatToFraction(wallet.balance)
      virtualPaymentEnabled.value = enabled
      if (enabled) {
        virtualWalletUnit.value = await VirtualPaymentApi.getWalletUnit()
        try {
          const balance = await VirtualPaymentApi.getUserBalance(user.id || 0)
          virtualBalance.value = balance.walletBalance
          virtualCoinBalance.value = balance.coinBalance
        }
        catch (error) {
          virtualBalanceError.value = getErrorMessage(error)
        }
      }
    }
    finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open })

async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate()
  if (formData.value.changeBalance <= 0) {
    message.error('变动余额不能为零')
    return
  }
  if (isVirtualAdjustment.value && virtualBalance.value == null) {
    message.error(virtualBalanceError.value || '微信虚拟余额暂不可用')
    return
  }
  if (adjustedBalance.value != null && adjustedBalance.value < 0) {
    message.error(`变动后的${balanceTargetLabel.value}不能小于 0`)
    return
  }
  if (formData.value.id == null) return

  const amount = convertToInteger(formData.value.changeBalance) * formData.value.changeType
  if (isVirtualAdjustment.value && Math.abs(amount) % virtualWalletUnit.value !== 0) {
    message.error(`变动金额必须是 ${formatToFraction(virtualWalletUnit.value)} 元的整数倍`)
    return
  }
  try {
    await message.confirm(
      `确认${amount > 0 ? '增加' : '减少'}用户 ${formData.value.id} 的${balanceTargetLabel.value} ${Math.abs(amount)} 分吗？`,
    )
    formLoading.value = true
    if (isVirtualAdjustment.value) {
      await VirtualPaymentApi.adjust({
        userId: formData.value.id,
        amount,
      })
      message.success('微信虚拟余额调整成功')
    }
    else {
      await WalletApi.updateWalletBalance({
        userId: formData.value.id,
        balance: amount,
      })
      message.success('余额调整成功')
    }
    dialogVisible.value = false
    emit('success')
  }
  catch {
  }
  finally {
    formLoading.value = false
  }
}

function resetForm() {
  formData.value = {
    id: undefined,
    nickname: undefined,
    balance: '0',
    adjustTarget: 'balance',
    changeBalance: 0,
    changeType: 1,
  }
  virtualPaymentEnabled.value = false
  virtualBalance.value = undefined
  virtualCoinBalance.value = undefined
  virtualWalletUnit.value = 100
  virtualBalanceError.value = ''
  formRef.value?.resetFields()
}
</script>

<template>
  <Dialog v-model="dialogVisible" title="调整用户余额" width="640px">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="150px"
    >
      <el-form-item label="用户编号" prop="id">
        <el-input v-model="formData.id" class="!w-[280px]" disabled />
      </el-form-item>
      <el-form-item label="用户昵称" prop="nickname">
        <el-input v-model="formData.nickname" class="!w-[280px]" disabled />
      </el-form-item>
      <el-form-item v-if="virtualPaymentEnabled" label="调整类型" prop="adjustTarget">
        <el-radio-group v-model="formData.adjustTarget">
          <el-radio value="balance">
            余额
          </el-radio>
          <el-radio value="virtual">
            微信虚拟余额
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="!isVirtualAdjustment" label="变动前余额(元)" prop="balance">
        <el-input :model-value="formData.balance" class="!w-[280px]" disabled />
      </el-form-item>
      <el-form-item v-else label="变动前微信虚拟余额(元)">
        <el-input
          :model-value="
            virtualBalance == null
              ? '暂不可用'
              : `${virtualCoinBalance} 代币（${formatToFraction(virtualBalance)} 元）`
          "
          class="!w-[280px]"
          disabled
        />
      </el-form-item>
      <el-form-item label="变动类型" prop="changeType">
        <el-radio-group v-model="formData.changeType">
          <el-radio :value="1">
            增加
          </el-radio>
          <el-radio :value="-1">
            减少
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="`变动${balanceTargetLabel}(元)`" prop="changeBalance">
        <el-input-number
          v-model="formData.changeBalance"
          :min="changeBalanceStep"
          :precision="2"
          :step="changeBalanceStep"
          class="!w-[280px]"
        />
      </el-form-item>
      <el-form-item :label="`变动后${balanceTargetLabel}(元)`">
        <el-input :model-value="balanceResult ?? '暂不可用'" class="!w-[280px]" disabled />
      </el-form-item>
      <el-alert
        v-if="isVirtualAdjustment && virtualBalanceError"
        :title="virtualBalanceError"
        type="warning"
        :closable="false"
        show-icon
      />
    </el-form>
    <template #footer>
      <el-button type="primary" :loading="formLoading" @click="submitForm">
        确 定
      </el-button>
      <el-button :disabled="formLoading" @click="dialogVisible = false">
        取 消
      </el-button>
    </template>
  </Dialog>
</template>

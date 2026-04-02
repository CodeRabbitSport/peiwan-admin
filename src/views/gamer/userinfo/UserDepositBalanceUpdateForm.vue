<script lang="ts" setup>
import { UserInfoApi } from '@/api/gamer/userinfo'
import * as WalletApi from '@/api/pay/wallet/balance'
import { convertToInteger, formatToFraction } from '@/utils'

/** 修改用户保证金表单 */
defineOptions({ name: 'UserDepositBalanceUpdateForm' })

const emit = defineEmits(['success'])
const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const formLoading = ref(false)
const formData = ref({
  id: undefined as number | undefined,
  nickname: undefined as string | undefined,
  depositBalance: '0',
  changeBalance: 0,
  changeType: 1 as 1 | -1,
})
const formRules = reactive({
  changeBalance: [{ required: true, message: '变动保证金不能为空', trigger: 'blur' }],
})
const formRef = ref()

/** 打开弹窗 */
async function open(id?: number) {
  dialogVisible.value = true
  resetForm()
  if (id != null) {
    formLoading.value = true
    try {
      const user = await UserInfoApi.getUserInfo(id)
      const wallet = await WalletApi.getWallet({ userId: user.id || 0 })
      formData.value.id = user.id
      formData.value.nickname = user.nickname
      formData.value.depositBalance = formatToFraction(wallet.depositBalance)
      formData.value.changeType = 1
      formData.value.changeBalance = 0
    }
    finally {
      formLoading.value = false
    }
  }
}

const depositBalanceResult = computed(() =>
  formatToFraction(
    convertToInteger(formData.value.depositBalance)
    + convertToInteger(formData.value.changeBalance) * formData.value.changeType,
  ),
)

defineExpose({ open })

/** 提交表单 */
async function submitForm() {
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return

  if (formData.value.changeBalance <= 0) {
    message.error('变动保证金不能为零')
    return
  }
  if (convertToInteger(depositBalanceResult.value) < 0) {
    message.error('变动后的保证金不能小于 0')
    return
  }
  if (formData.value.id == null) return

  formLoading.value = true
  try {
    await UserInfoApi.updateUserDepositBalance({
      userId: formData.value.id,
      balance: convertToInteger(formData.value.changeBalance) * formData.value.changeType,
    })

    message.success(t('common.updateSuccess'))
    dialogVisible.value = false
    emit('success')
  }
  finally {
    formLoading.value = false
  }
}

/** 重置表单 */
function resetForm() {
  formData.value = {
    id: undefined,
    nickname: undefined,
    depositBalance: '0',
    changeBalance: 0,
    changeType: 1,
  }
  formRef.value?.resetFields()
}
</script>

<template>
  <Dialog v-model="dialogVisible" title="修改保证金" width="600">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="130px"
    >
      <el-form-item label="用户编号" prop="id">
        <el-input v-model="formData.id" class="!w-[240px]" disabled />
      </el-form-item>
      <el-form-item label="用户昵称" prop="nickname">
        <el-input v-model="formData.nickname" class="!w-[240px]" disabled />
      </el-form-item>
      <el-form-item label="变动前保证金" prop="depositBalance">
        <el-input :model-value="formData.depositBalance" class="!w-[240px]" disabled />
      </el-form-item>
      <el-form-item label="变动类型" prop="changeType">
        <el-radio-group v-model="formData.changeType">
          <el-radio :label="1">
            增加
          </el-radio>
          <el-radio :label="-1">
            减少
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="变动保证金" prop="changeBalance">
        <el-input-number
          v-model="formData.changeBalance"
          :min="0"
          :precision="2"
          :step="0.1"
          class="!w-[240px]"
        />
      </el-form-item>
      <el-form-item label="变动后保证金">
        <el-input :model-value="depositBalanceResult" class="!w-[240px]" disabled />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">
        确 定
      </el-button>
      <el-button @click="dialogVisible = false">
        取 消
      </el-button>
    </template>
  </Dialog>
</template>

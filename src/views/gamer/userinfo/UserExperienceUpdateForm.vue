<script lang="ts" setup>
import { UserInfoApi } from '@/api/gamer/userinfo'
import * as WalletApi from '@/api/pay/wallet/balance'
import { convertToInteger, fenToYuan, formatToFraction } from '@/utils'

/** 修改用户积分表单 */
defineOptions({ name: 'UserExperienceUpdateForm' })

const emit = defineEmits(['success'])
const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const formLoading = ref(false)
const formData = ref({
  id: undefined as number | undefined,
  nickname: undefined as string | undefined,
  experience: '0',
  changeBalance: 0,
  changeType: 1 as 1 | -1,
})
const formRules = reactive({
  changeBalance: [{ required: true, message: '变动积分不能为空', trigger: 'blur' }],
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
      formData.value.experience = fenToYuan(wallet.totalExperience || 0)
      formData.value.changeType = 1
      formData.value.changeBalance = 0
    }
    finally {
      formLoading.value = false
    }
  }
}

const experienceResult = computed(() =>
  formatToFraction(
    convertToInteger(formData.value.experience)
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
    message.error('变动积分不能为零')
    return
  }
  if (convertToInteger(experienceResult.value) < 0) {
    message.error('变动后的积分不能小于 0')
    return
  }
  if (formData.value.id == null) return

  formLoading.value = true
  try {
    await UserInfoApi.updateUserExperience({
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
    experience: '0',
    changeBalance: 0,
    changeType: 1,
  }
  formRef.value?.resetFields()
}
</script>

<template>
  <Dialog v-model="dialogVisible" title="修改当前积分数" width="600">
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
      <el-form-item label="变动前积分" prop="experience">
        <el-input :model-value="formData.experience" class="!w-[240px]" disabled />
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
      <el-form-item label="变动积分" prop="changeBalance">
        <el-input-number
          v-model="formData.changeBalance"
          :min="0"
          :precision="2"
          :step="0.1"
          class="!w-[240px]"
        />
      </el-form-item>
      <el-form-item label="变动后积分">
        <el-input :model-value="experienceResult" class="!w-[240px]" disabled />
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

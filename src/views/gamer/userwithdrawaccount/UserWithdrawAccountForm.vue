<script setup lang="ts">
import type { UserWithdrawAccount } from '@/api/gamer/userwithdrawaccount'
import { UserWithdrawAccountApi } from '@/api/gamer/userwithdrawaccount'

/** 用户提现账户 表单 */
defineOptions({ name: 'UserWithdrawAccountForm' })

// 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']); const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  userId: undefined,
  channel: undefined,
  phone: undefined,
  realName: undefined,
  accountNo: undefined,
  bankName: undefined,
  qrCodeUrl: undefined,
  isDefault: undefined,
})
const formRules = reactive({
  userId: [{ required: true, message: '用户ID不能为空', trigger: 'blur' }],
  channel: [{ required: true, message: '提现渠道不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
async function open(type: string, id?: number) {
  dialogVisible.value = true
  dialogTitle.value = t(`action.${type}`)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await UserWithdrawAccountApi.getUserWithdrawAccount(id)
    }
    finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 定义 success 事件，用于操作成功后的回调
async function submitForm() {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as UserWithdrawAccount
    if (formType.value === 'create') {
      await UserWithdrawAccountApi.createUserWithdrawAccount(data)
      message.success(t('common.createSuccess'))
    }
    else {
      await UserWithdrawAccountApi.updateUserWithdrawAccount(data)
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

/** 重置表单 */
function resetForm() {
  formData.value = {
    id: undefined,
    userId: undefined,
    channel: undefined,
    phone: undefined,
    realName: undefined,
    accountNo: undefined,
    bankName: undefined,
    qrCodeUrl: undefined,
    isDefault: undefined,
  }
  formRef.value?.resetFields()
}
</script>

<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="用户ID" prop="userId">
        <el-input v-model="formData.userId" placeholder="请输入用户ID" />
      </el-form-item>
      <el-form-item label="提现渠道" prop="channel">
        <el-radio-group v-model="formData.channel">
          <el-radio value="1">
            微信收款
          </el-radio>
          <el-radio value="2">
            支付宝收款
          </el-radio>
          <el-radio value="3">
            银行卡收款
          </el-radio>
          <el-radio value="4">
            支付宝账号收款
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="真实姓名" prop="realName">
        <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
      </el-form-item>
      <el-form-item label="账号(银行卡号/支付宝账号)" prop="accountNo">
        <el-input v-model="formData.accountNo" placeholder="请输入账号(银行卡号/支付宝账号)" />
      </el-form-item>
      <el-form-item label="银行名称(仅银行卡)" prop="bankName">
        <el-input v-model="formData.bankName" placeholder="请输入银行名称(仅银行卡)" />
      </el-form-item>
      <el-form-item label="收款二维码URL" prop="qrCodeUrl">
        <UploadImg v-model="formData.qrCodeUrl" />
      </el-form-item>
      <el-form-item label="是否默认账户 0否 1是" prop="isDefault">
        <el-radio-group v-model="formData.isDefault">
          <el-radio value="1">
            请选择字典生成
          </el-radio>
        </el-radio-group>
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

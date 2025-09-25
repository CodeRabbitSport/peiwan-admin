<script setup lang="ts">
import type { UserInfo } from '@/api/gamer/userinfo'
import { UserInfoApi } from '@/api/gamer/userinfo'

/** 用户信息 表单 */
defineOptions({ name: 'UserInfoForm' })

// 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success'])
const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  mobile: undefined,
  nickname: undefined,
  avatar: undefined,
  sex: undefined,
  city: undefined,
  signature: undefined,
  money: undefined,
  giftMoney: undefined,
  wealthVal: undefined,
  charmVal: undefined,
  davName: undefined,
  voiceAuditStatus: undefined,
  isSeeFollow: undefined,
  isSeeFans: undefined,
})
const formRules = reactive({
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
      formData.value = await UserInfoApi.getUserInfo(id)
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
    const data = formData.value as unknown as UserInfo
    if (formType.value === 'create') {
      await UserInfoApi.createUserInfo(data)
      message.success(t('common.createSuccess'))
    }
    else {
      await UserInfoApi.updateUserInfo(data)
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
    mobile: undefined,
    nickname: undefined,
    avatar: undefined,
    sex: undefined,
    city: undefined,
    signature: undefined,
    money: undefined,
    giftMoney: undefined,
    wealthVal: undefined,
    charmVal: undefined,
    davName: undefined,
    voiceAuditStatus: undefined,
    isSeeFollow: undefined,
    isSeeFans: undefined,
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
      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="formData.mobile" readonly placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-radio-group v-model="formData.sex">
          <el-radio :value="1">
            男
          </el-radio>
          <el-radio :value="2">
            女
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- <el-form-item label="余额" prop="money">
        <el-input v-model="formData.money" placeholder="请输入余额" />
      </el-form-item> -->
      <!-- <el-form-item label="财富值" prop="wealthVal">
        <el-input v-model="formData.wealthVal" placeholder="请输入财富值" />
      </el-form-item>
      <el-form-item label="魅力值" prop="charmVal">
        <el-input v-model="formData.charmVal" placeholder="请输入魅力值" />
      </el-form-item> -->
      <!-- <el-form-item label="语音审核状态" prop="voiceAuditStatus">
        <el-radio-group v-model="formData.voiceAuditStatus">
          <el-radio value="1">
            审核通过
          </el-radio>
          <el-radio value="1">
            拒绝审核
          </el-radio>
        </el-radio-group>
      </el-form-item> -->
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

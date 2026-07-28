<script setup lang="ts">
import { UserInfoApi } from '@/api/gamer/userinfo'

/** 成员昵称与头像编辑弹窗 */
defineOptions({ name: 'CompanionMemberProfileDialog' })

const emit = defineEmits(['success'])
const message = useMessage()
const dialogVisible = ref(false)
const loading = ref(false)
const submitting = ref(false)
const formRef = ref()
const formData = ref({
  id: undefined as number | undefined,
  nickname: '',
  avatar: '',
  mobile: undefined as string | undefined,
  trueHead: undefined as string | undefined,
  sex: undefined as number | undefined,
  city: undefined as string | undefined,
  signature: undefined as string | undefined,
  davName: undefined as string | undefined,
  isSeeFollow: undefined as boolean | undefined,
  isSeeFans: undefined as boolean | undefined,
  parentId: undefined as number | undefined,
})
const rules = reactive({
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
})

async function open(userId: number) {
  dialogVisible.value = true
  loading.value = true
  formRef.value?.resetFields()
  try {
    const user = await UserInfoApi.getUserInfo(userId)
    formData.value = {
      id: userId,
      nickname: user.nickname || '',
      avatar: user.avatar || '',
      mobile: user.mobile,
      trueHead: user.trueHead,
      sex: user.sex,
      city: user.city,
      signature: user.signature,
      davName: user.davName,
      isSeeFollow: user.isSeeFollow,
      isSeeFans: user.isSeeFans,
      parentId: user.parentId,
    }
  }
  finally {
    loading.value = false
  }
}

async function submit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    await UserInfoApi.updateUserInfo({
      ...formData.value,
      nickname: formData.value.nickname.trim(),
    })
    message.success('资料修改成功')
    dialogVisible.value = false
    emit('success')
  }
  finally {
    submitting.value = false
  }
}

defineExpose({ open })
</script>

<template>
  <Dialog v-model="dialogVisible" title="修改资料" width="480px">
    <el-form
      ref="formRef"
      v-loading="loading"
      :model="formData"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="formData.nickname" maxlength="30" show-word-limit />
      </el-form-item>
      <el-form-item label="头像" prop="avatar">
        <UploadImg v-model="formData.avatar" />
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-radio-group v-model="formData.sex">
          <el-radio :value="0">未知</el-radio>
          <el-radio :value="1">男</el-radio>
          <el-radio :value="2">女</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="submitting" @click="dialogVisible = false">
        取消
      </el-button>
      <el-button type="primary" :loading="submitting" @click="submit">
        保存
      </el-button>
    </template>
  </Dialog>
</template>

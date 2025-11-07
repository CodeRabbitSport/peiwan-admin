<script lang="ts" setup>
import type { FormRules } from 'element-plus'

import type {
  UserProfileUpdateReqVO,
} from '@/api/system/user/profile'
import {
  getUserProfile,
  updateUserProfile,
} from '@/api/system/user/profile'
import type { FormExpose } from '@/components/Form'
import { useUserStore } from '@/store/modules/user'
import type { FormSchema } from '@/types/form'

defineOptions({ name: 'BasicInfo' })

// 定义事件
const emit = defineEmits<{
  (e: 'success'): void
}>()
const { t } = useI18n()
const message = useMessage() // 消息弹窗
const userStore = useUserStore()

// 表单校验
const rules = reactive<FormRules>({
  nickname: [{ required: true, message: t('profile.rules.nickname'), trigger: 'blur' }],
  email: [
    { required: true, message: t('profile.rules.mail'), trigger: 'blur' },
    {
      type: 'email',
      message: t('profile.rules.truemail'),
      trigger: ['blur', 'change'],
    },
  ],
  mobile: [
    { required: true, message: t('profile.rules.phone'), trigger: 'blur' },
    {
      pattern: /^1[3-9|]\d{9}$/,
      message: t('profile.rules.truephone'),
      trigger: 'blur',
    },
  ],
})
const schema = reactive<FormSchema[]>([
  // 头像
  {
    field: 'avatar',
    label: "头像",
    component: 'UploadImg',
  },
  {
    field: 'nickname',
    label: t('profile.user.nickname'),
    component: 'Input',
  },
  {
    field: 'mobile',
    label: t('profile.user.mobile'),
    component: 'Input',
  },
  {
    field: 'email',
    label: t('profile.user.email'),
    component: 'Input',
  },
  {
    field: 'sex',
    label: t('profile.user.sex'),
    component: 'InputNumber',
    value: 0,
  },
])
const formRef = ref<FormExpose>() // 表单 Ref
function submit() {
  const elForm = unref(formRef)?.getElFormRef()
  if (!elForm) return
  elForm.validate(async (valid) => {
    if (valid) {
      const data = unref(formRef)?.formModel as UserProfileUpdateReqVO
      await updateUserProfile(data)
      message.success(t('common.updateSuccess'))
      const profile = await init()
      userStore.setUserNicknameAction(profile.nickname)
      // 发送成功事件
      emit('success')
    }
  })
}
async function init() {
  const res = await getUserProfile()
  console.log('%c🤪 ~ file: /Users/soya/Desktop/p-admin/src/views/gamer/profile/components/BasicInfo.vue:91 [] -> res : ', 'color: #8b134e', res);
  unref(formRef)?.setValues(res)
  return res
}
onMounted(async () => {
  await init()
})
</script>

<template>
  <Form ref="formRef" :label-width="200" :rules="rules" :schema="schema">
    <template #sex="form">
      <el-radio-group v-model="form.sex">
        <el-radio :value="1">
          {{ t('profile.user.man') }}
        </el-radio>
        <el-radio :value="2">
          {{ t('profile.user.woman') }}
        </el-radio>
      </el-radio-group>
    </template>
  </Form>
  <div style="text-align: center">
    <XButton :title="t('common.save')" type="primary" @click="submit()" />
    <XButton :title="t('common.reset')" type="danger" @click="init()" />
  </div>
</template>

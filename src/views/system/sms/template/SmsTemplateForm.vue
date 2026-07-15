<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus'

import * as SmsChannelApi from '@/api/system/sms/smsChannel'
import * as SmsTemplateApi from '@/api/system/sms/smsTemplate'
import { DICT_TYPE, getDictLabel, getIntDictOptions } from '@/utils/dict'

defineOptions({ name: 'SystemSmsTemplateForm' })

const emit = defineEmits(['success'])
const message = useMessage()
const dialogVisible = ref(false)
const formLoading = ref(false)
const formRef = ref<FormInstance>()
const channelList = ref<SmsChannelApi.SmsChannelVO[]>([])
const formData = ref<SmsTemplateApi.SmsTemplateVO>({
  id: undefined,
  type: undefined,
  status: 0,
  code: '',
  name: '',
  content: '',
  remark: '',
  apiTemplateId: '',
  channelId: undefined,
})
const formRules: FormRules = {
  status: [{ required: true, message: '开启状态不能为空', trigger: 'change' }],
  channelId: [{ required: true, message: '短信渠道不能为空', trigger: 'change' }],
}

async function open(_type: string, id?: number) {
  if (!id) return
  dialogVisible.value = true
  formLoading.value = true
  try {
    const [template, channels] = await Promise.all([
      SmsTemplateApi.getSmsTemplate(id),
      SmsChannelApi.getSimpleSmsChannelList(),
    ])
    formData.value = template
    channelList.value = channels
  }
  finally {
    formLoading.value = false
  }
}
defineExpose({ open })

async function submitForm() {
  if (!await formRef.value?.validate()) return
  formLoading.value = true
  try {
    await SmsTemplateApi.updateSmsTemplate({
      id: formData.value.id,
      status: formData.value.status,
      channelId: formData.value.channelId,
      apiTemplateId: formData.value.apiTemplateId,
    })
    message.success('修改成功')
    dialogVisible.value = false
    emit('success')
  }
  finally {
    formLoading.value = false
  }
}
</script>

<template>
  <Dialog v-model="dialogVisible" title="修改短信模板配置">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="140px"
    >
      <el-form-item label="短信渠道" prop="channelId">
        <el-select v-model="formData.channelId" placeholder="请选择短信渠道">
          <el-option
            v-for="channel in channelList"
            :key="channel.id"
            :label="`${channel.signature}【 ${getDictLabel(DICT_TYPE.SYSTEM_SMS_CHANNEL_CODE, channel.code)}】`"
            :value="channel.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="短信类型">
        <dict-tag :type="DICT_TYPE.SYSTEM_SMS_TEMPLATE_TYPE" :value="formData.type ?? ''" />
      </el-form-item>
      <el-form-item label="模板编码">
        <el-input :model-value="formData.code" disabled />
      </el-form-item>
      <el-form-item label="模板名称">
        <el-input :model-value="formData.name" disabled />
      </el-form-item>
      <el-form-item label="模板内容">
        <el-input :model-value="formData.content" disabled type="textarea" />
      </el-form-item>
      <el-form-item label="开启状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="短信 API 模板编号">
        <el-input v-model="formData.apiTemplateId" />
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

<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus'

import * as SmsChannelApi from '@/api/system/sms/smsChannel'
import * as SmsTemplateApi from '@/api/system/sms/smsTemplate'
import { DICT_TYPE, getDictLabel, getIntDictOptions } from '@/utils/dict'

defineOptions({ name: 'SystemSmsTemplateForm' })

const emit = defineEmits(['success'])
const message = useMessage()
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formRef = ref<FormInstance>()
const channelList = ref<SmsChannelApi.SmsChannelVO[]>([])

function createFormData(): SmsTemplateApi.SmsTemplateVO {
  return {
    id: undefined,
    type: undefined,
    status: 0,
    code: '',
    name: '',
    content: '',
    remark: '',
    apiTemplateId: '',
    channelId: undefined,
  }
}

const formData = ref<SmsTemplateApi.SmsTemplateVO>(createFormData())
const formRules: FormRules = {
  type: [{ required: true, message: '短信类型不能为空', trigger: 'change' }],
  code: [{ required: true, message: '模板编码不能为空', trigger: 'blur' }],
  name: [{ required: true, message: '模板名称不能为空', trigger: 'blur' }],
  content: [{ required: true, message: '模板内容不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '开启状态不能为空', trigger: 'change' }],
  channelId: [{ required: true, message: '短信渠道不能为空', trigger: 'change' }],
}

async function open(type: string, id?: number) {
  dialogVisible.value = true
  formType.value = type
  dialogTitle.value = type === 'create' ? '新增短信模板' : '修改短信模板配置'
  resetForm()
  formLoading.value = true
  try {
    channelList.value = await SmsChannelApi.getSimpleSmsChannelList()
    if (id) {
      formData.value = await SmsTemplateApi.getSmsTemplate(id)
    }
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
    if (formType.value === 'create') {
      await SmsTemplateApi.createSmsTemplate({ ...formData.value })
      message.success('新增成功')
    }
    else {
      await SmsTemplateApi.updateSmsTemplate({
        id: formData.value.id,
        status: formData.value.status,
        channelId: formData.value.channelId,
        apiTemplateId: formData.value.apiTemplateId,
      })
      message.success('修改成功')
    }
    dialogVisible.value = false
    emit('success')
  }
  finally {
    formLoading.value = false
  }
}

/** 重置表单 */
function resetForm() {
  formData.value = createFormData()
  formRef.value?.clearValidate()
}
</script>

<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
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
      <el-form-item label="短信类型" prop="type">
        <el-select
          v-if="formType === 'create'"
          v-model="formData.type"
          placeholder="请选择短信类型"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_SMS_TEMPLATE_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
        <dict-tag v-else :type="DICT_TYPE.SYSTEM_SMS_TEMPLATE_TYPE" :value="formData.type ?? ''" />
      </el-form-item>
      <el-form-item label="模板编码" prop="code">
        <el-input
          v-model="formData.code"
          placeholder="请输入模板编码"
          :disabled="formType === 'update'"
        />
      </el-form-item>
      <el-form-item label="模板名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入模板名称"
          :disabled="formType === 'update'"
        />
      </el-form-item>
      <el-form-item label="模板内容" prop="content">
        <el-input
          v-model="formData.content"
          placeholder="请输入模板内容"
          type="textarea"
          :disabled="formType === 'update'"
        />
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
      <el-form-item v-if="formType === 'create'" label="备注" prop="remark">
        <el-input v-model="formData.remark" placeholder="请输入备注" type="textarea" />
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

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'

import { ElMessageBox } from 'element-plus'
import { h } from 'vue'

import type { SmsTemplateVO } from '@/api/system/sms/smsTemplate'
import { getSmsTemplatePage, sendSms } from '@/api/system/sms/smsTemplate'

interface OrderSmsTarget {
  id: number
  orderNo?: string
  userId?: number
  nickname?: string
  mobile?: string
}

const message = useMessage()
const dialogVisible = shallowRef(false)
const loading = shallowRef(false)
const submitting = shallowRef(false)
const order = ref<OrderSmsTarget>()
const templates = ref<SmsTemplateVO[]>([])
const formRef = ref<FormInstance>()
const form = reactive({
  templateCode: '',
  templateParams: {} as Record<string, string>,
})

const selectedTemplate = computed(() => templates.value.find(item => item.code === form.templateCode))
const templateParams = computed(() => selectedTemplate.value?.params || [])
const previewContent = computed(() => (selectedTemplate.value?.content || '').replace(
  /\{([^{}]+)\}/g,
  (placeholder, param: string) => form.templateParams[param]?.trim() || placeholder,
))
const formRules = computed<FormRules>(() => ({
  templateCode: [{ required: true, message: '请选择短信模板', trigger: 'change' }],
  ...Object.fromEntries(templateParams.value.map(param => [
    `templateParams.${param}`,
    [{ required: true, whitespace: true, message: `请填写参数 ${param}`, trigger: 'blur' }],
  ])),
}))

watch(() => form.templateCode, () => {
  form.templateParams = Object.fromEntries(templateParams.value.map(param => [
    param,
    param === 'orderNo' ? order.value?.orderNo || '' : '',
  ]))
  formRef.value?.clearValidate()
})

async function open(row: OrderSmsTarget) {
  if (loading.value || submitting.value) return
  order.value = { ...row }
  form.templateCode = ''
  form.templateParams = {}
  templates.value = []
  dialogVisible.value = true
  loading.value = true
  try {
    let pageNo = 1
    let total = 0
    do {
      const page = await getSmsTemplatePage({ pageNo, pageSize: 100, status: 0 } as PageParam)
      templates.value.push(...page.list.filter((item: SmsTemplateVO) => item.status === 0))
      total = page.total
      if (!page.list.length) break
      pageNo += 1
    } while ((pageNo - 1) * 100 < total)
  }
  finally {
    loading.value = false
    formRef.value?.clearValidate()
  }
}

async function submit() {
  if (loading.value || submitting.value || !order.value) return
  if (!/^1[3-9]\d{9}$/.test(order.value.mobile || '')) {
    message.warning('该下单用户没有有效手机号，无法发送短信')
    return
  }
  submitting.value = true
  try {
    if (!await formRef.value?.validate().catch(() => false)) return
    const template = selectedTemplate.value
    if (!template) return
    const payload = {
      mobile: order.value.mobile!,
      templateCode: template.code,
      templateParams: Object.fromEntries(templateParams.value.map(param => [param, form.templateParams[param].trim()])),
    }
    try {
      await ElMessageBox.confirm(h('div', [
        h('p', `订单号：${order.value.orderNo || order.value.id}`),
        h('p', `接收人：${order.value.nickname || '下单用户'}（${payload.mobile}）`),
        h('p', `短信模板：${template.name}（${template.code}）`),
        h('p', { style: { whiteSpace: 'pre-wrap', wordBreak: 'break-word' } }, `短信内容：${previewContent.value}`),
      ]), '确认发送短信', {
        type: 'warning',
        confirmButtonText: '确认发送',
        cancelButtonText: '返回修改',
        closeOnClickModal: false,
      })
    }
    catch {
      return
    }
    const logId = await sendSms(payload)
    message.success(`已提交短信发送${logId ? `，发送日志编号：${logId}` : ''}`)
    dialogVisible.value = false
  }
  finally {
    submitting.value = false
  }
}

defineExpose({ open })
</script>

<template>
  <Dialog v-model="dialogVisible" title="订单发送短信" width="600px" :close-on-click-modal="false">
    <el-form
      ref="formRef"
      v-loading="loading"
      :model="form"
      :rules="formRules"
      :disabled="submitting"
      label-width="140px"
    >
      <el-form-item label="订单号">
        {{ order?.orderNo || order?.id }}
      </el-form-item>
      <el-form-item label="接收人">
        {{ order?.nickname || '下单用户' }}（用户 ID：{{ order?.userId || '-' }}）
      </el-form-item>
      <el-form-item label="手机号">
        {{ order?.mobile || '未绑定手机号' }}
      </el-form-item>
      <el-form-item label="短信模板" prop="templateCode">
        <el-select v-model="form.templateCode" placeholder="请选择短信模板" class="w-full">
          <el-option
            v-for="item in templates"
            :key="item.id"
            :label="`${item.name}（${item.code}）`"
            :value="item.code"
          />
        </el-select>
      </el-form-item>
      <el-alert
        v-if="!loading && !templates.length"
        title="暂无启用的短信模板，请先在短信管理中配置"
        type="warning"
        :closable="false"
        class="mb-4"
      />
      <el-form-item v-for="param in templateParams" :key="param" :label="`参数 ${param}`" :prop="`templateParams.${param}`">
        <el-input v-model="form.templateParams[param]" :placeholder="`请填写参数 ${param}`" />
      </el-form-item>
      <el-form-item v-if="selectedTemplate" label="短信预览">
        <el-input :model-value="previewContent" type="textarea" :autosize="{ minRows: 3, maxRows: 8 }" readonly />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="loading || submitting || !selectedTemplate || !order?.mobile" :loading="submitting" type="primary" @click="submit">
        发送短信
      </el-button>
      <el-button :disabled="submitting" @click="dialogVisible = false">
        取消
      </el-button>
    </template>
  </Dialog>
</template>

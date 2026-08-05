<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="720px">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="180px"
    >
      <el-form-item label="渠道费率" prop="feeRate">
        <el-input v-model="formData.feeRate" clearable placeholder="请输入渠道费率">
          <template #append>%</template>
        </el-input>
      </el-form-item>
      <el-form-item label="渠道状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="parseInt(dict.value)"
            :value="parseInt(dict.value)"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="Offer ID" prop="config.offerId">
        <el-input
          v-model="formData.config.offerId"
          clearable
          placeholder="请输入虚拟支付 Offer ID"
        />
      </el-form-item>
      <el-form-item label="AppKey" prop="config.appKey">
        <el-input
          v-model="formData.config.appKey"
          clearable
          placeholder="请输入与支付环境对应的 AppKey"
          show-password
          type="password"
        />
      </el-form-item>
      <el-form-item label="支付环境" prop="config.env">
        <el-radio-group v-model="formData.config.env">
          <el-radio :value="0">现网</el-radio>
          <el-radio :value="1">沙箱</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="钱包代币换算" prop="config.walletUnit">
        <el-input-number
          v-model="formData.config.walletUnit"
          :min="1"
          :precision="0"
          controls-position="right"
        />
        <span class="ml-8px text-12px text-gray-500">钱包余额分 / 1 代币</span>
      </el-form-item>
      <el-divider content-position="left">iOS 退款消息推送</el-divider>
      <el-form-item label="消息推送 Token" prop="config.notifyToken">
        <el-input
          v-model="formData.config.notifyToken"
          clearable
          placeholder="填写微信公众平台消息推送配置的 Token"
          show-password
          type="password"
        />
      </el-form-item>
      <el-form-item label="EncodingAESKey" prop="config.notifyAesKey">
        <el-input
          v-model="formData.config.notifyAesKey"
          clearable
          placeholder="安全模式必填，填写微信公众平台的 EncodingAESKey"
          show-password
          type="password"
        />
        <div class="mt-6px text-12px text-gray-500">
          在微信公众平台「开发管理 - 消息推送配置」中选择 JSON 与安全模式；URL 填 &lt;API
          域名&gt;/app-api/gamer/virtual-payment/notify/&lt;租户 ID&gt;/&lt;小程序 AppID&gt;。
        </div>
      </el-form-item>
      <el-form-item>
        <a
          href="https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/business-capabilities/virtual-payment.html"
          target="_blank"
        >
          查看微信小程序虚拟支付配置说明
        </a>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import * as ChannelApi from '@/api/pay/channel'
import { CommonStatusEnum } from '@/utils/constants'
import { DICT_TYPE, getDictOptions } from '@/utils/dict'

defineOptions({ name: 'VirtualPaymentChannelForm' })

const { t } = useI18n()
const message = useMessage()
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formRef = ref()
const formData = ref<any>()
const formRules = {
  feeRate: [{ required: true, message: '请输入渠道费率', trigger: 'blur' }],
  status: [{ required: true, message: '请选择渠道状态', trigger: 'change' }],
  'config.offerId': [{ required: true, message: '请输入 Offer ID', trigger: 'blur' }],
  'config.appKey': [{ required: true, message: '请输入 AppKey', trigger: 'blur' }],
  'config.env': [{ required: true, message: '请选择支付环境', trigger: 'change' }],
  'config.walletUnit': [{ required: true, message: '请输入钱包代币换算单位', trigger: 'blur' }]
}

const resetForm = (appId: number, code: string) => {
  formData.value = {
    appId,
    code,
    status: CommonStatusEnum.ENABLE,
    feeRate: 0,
    remark: '',
    config: {
      offerId: '',
      appKey: '',
      env: 0,
      walletUnit: 100,
      notifyToken: '',
      notifyAesKey: ''
    }
  }
  formRef.value?.resetFields()
}

const open = async (appId: number, code: string) => {
  dialogVisible.value = true
  formLoading.value = true
  resetForm(appId, code)
  try {
    const data = await ChannelApi.getChannel(String(appId), code)
    if (data?.id) {
      formData.value = data
      formData.value.config = JSON.parse(data.config)
    }
    dialogTitle.value = !formData.value.id ? '创建支付渠道' : '编辑支付渠道'
  } finally {
    formLoading.value = false
  }
}
defineExpose({ open })

const emit = defineEmits(['success'])
const submitForm = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return
  formLoading.value = true
  try {
    const data = { ...formData.value } as ChannelApi.ChannelVO
    data.config = JSON.stringify(formData.value.config)
    if (data.id) {
      await ChannelApi.updateChannel(data)
      message.success(t('common.updateSuccess'))
    } else {
      await ChannelApi.createChannel(data)
      message.success(t('common.createSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}
</script>

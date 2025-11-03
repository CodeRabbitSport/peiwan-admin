<script setup lang="ts">
import type { Gift } from '@/api/gamer/gift'
import { GiftApi } from '@/api/gamer/gift'
import { fenToYuan } from '@/utils'

/** 礼物 表单 */
defineOptions({ name: 'GiftForm' })

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
  giftName: undefined,
  giftImage: undefined,
  giftRate: undefined,
  price: undefined,
  status: true,
})
const formRules = reactive({
  giftName: [{ required: true, message: '礼物名称不能为空', trigger: 'blur' }],
  giftRate: [{ required: true, message: '平台抽成比例不能为空', trigger: 'blur' }],
  price: [{ required: true, message: '礼物价格(分)不能为空', trigger: 'blur' }],
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
      formData.value = await GiftApi.getGift(id)
      if (formData.value.price) {
        formData.value.price = fenToYuan(formData.value.price) as any
      }
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
    formData.value.price = formData.value.price ? formData.value.price * 100 : 0
    const data = formData.value as unknown as Gift
    if (formType.value === 'create') {
      await GiftApi.createGift(data)
      message.success(t('common.createSuccess'))
    }
    else {
      await GiftApi.updateGift(data)
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
    giftName: undefined,
    giftImage: undefined,
    giftRate: 25,
    price: undefined,
    status: undefined,
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
      <el-form-item label="礼物名称" prop="giftName">
        <el-input v-model="formData.giftName" placeholder="请输入礼物名称" />
      </el-form-item>
      <el-form-item label="礼物图片" prop="giftImage">
        <UploadImg v-model="formData.giftImage" />
      </el-form-item>
      <el-form-item label="平台抽成" prop="giftRate">
        <el-input v-model="formData.giftRate" placeholder="请输入平台抽成比例%" />
      </el-form-item>
      <el-form-item label="礼物价格" prop="price">
        <el-input v-model="formData.price" placeholder="请输入礼物价格" />
      </el-form-item>
      <el-form-item label="状态:" prop="status">
        <el-switch
          v-model="formData.status"
          active-text="启用"
          inactive-text="禁用"
        />
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

<script setup lang="ts">
import type { AccOrderComplaint } from '@/api/gamer/accordercomplaint'
import { AccOrderComplaintApi } from '@/api/gamer/accordercomplaint'

/** 陪玩订单投诉内容 表单 */
defineOptions({ name: 'AccOrderComplaintForm' })

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
  orderId: undefined,
  userId: undefined,
  userType: undefined,
  content: undefined,
  images: undefined,
})
const formRules = reactive({
  orderId: [{ required: true, message: '订单ID不能为空', trigger: 'blur' }],
  userType: [{ required: true, message: '用户类型(1-会员,2-管理员)不能为空', trigger: 'blur' }],
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
      formData.value = await AccOrderComplaintApi.getAccOrderComplaint(id)
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
    const data = formData.value as unknown as AccOrderComplaint
    if (formType.value === 'create') {
      await AccOrderComplaintApi.createAccOrderComplaint(data)
      message.success(t('common.createSuccess'))
    }
    else {
      await AccOrderComplaintApi.updateAccOrderComplaint(data)
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
    orderId: undefined,
    userId: undefined,
    userType: undefined,
    content: undefined,
    images: undefined,
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
      <el-form-item label="订单ID" prop="orderId">
        <el-input v-model="formData.orderId" placeholder="请输入订单ID" />
      </el-form-item>
      <el-form-item label="用户ID" prop="userId">
        <el-input v-model="formData.userId" placeholder="请输入用户ID" />
      </el-form-item>
      <!-- <el-form-item label="用户类型(1-会员,2-管理员)" prop="userType">
        <el-radio-group v-model="formData.userType">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item> -->
      <el-form-item label="回复内容" prop="content">
        <Editor v-model="formData.content" height="150px" />
      </el-form-item>
      <el-form-item label="图片列表" prop="images">
        <el-input v-model="formData.images" placeholder="请输入图片列表" />
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

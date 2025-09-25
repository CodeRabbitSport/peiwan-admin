<script setup lang="ts">
import type { UserAuthVerification } from '@/api/gamer/userauthverification'
import { UserAuthVerificationApi } from '@/api/gamer/userauthverification'

/** 用户实名认证申请 表单 */
defineOptions({ name: 'UserAuthVerificationForm' })

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
  realName: undefined,
  idCardNo: undefined,
  frontImageUrl: undefined,
  status: undefined,
  rejectReason: undefined,
  reviewerId: undefined,
  reviewedAt: undefined,
})
const formRules = reactive({
  userId: [{ required: true, message: '用户ID不能为空', trigger: 'blur' }],
  realName: [{ required: true, message: '真实姓名不能为空', trigger: 'blur' }],
  idCardNo: [{ required: true, message: '身份证号码不能为空', trigger: 'blur' }],
  frontImageUrl: [{ required: true, message: '身份证正面图片URL不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '审核状态不能为空', trigger: 'blur' }],
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
      formData.value = await UserAuthVerificationApi.getUserAuthVerification(id)
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
    const data = formData.value as unknown as UserAuthVerification
    if (formType.value === 'create') {
      await UserAuthVerificationApi.createUserAuthVerification(data)
      message.success(t('common.createSuccess'))
    }
    else {
      await UserAuthVerificationApi.updateUserAuthVerification(data)
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
    realName: undefined,
    idCardNo: undefined,
    frontImageUrl: undefined,
    status: undefined,
    rejectReason: undefined,
    reviewerId: undefined,
    reviewedAt: undefined,
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
      <el-form-item label="真实姓名" prop="realName">
        <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
      </el-form-item>
      <el-form-item label="身份证号码" prop="idCardNo">
        <el-input v-model="formData.idCardNo" placeholder="请输入身份证号码" />
      </el-form-item>
      <el-form-item label="身份证正面图片" prop="frontImageUrl">
        <UploadImg v-model="formData.frontImageUrl" />
      </el-form-item>
      <el-form-item label="审核状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :value="0">
            待审核
          </el-radio>
          <el-radio :value="1">
            审核通过
          </el-radio>
          <el-radio :value="2">
            审核拒绝
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="拒绝原因" prop="rejectReason">
        <el-input v-model="formData.rejectReason" type="textarea" placeholder="请输入拒绝原因" />
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

<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="动态ID" prop="momentId">
        <el-input v-model="formData.momentId" placeholder="请输入动态ID" />
      </el-form-item>
      <el-form-item label="红包总金额" prop="amount">
        <el-input v-model="formData.amount" placeholder="请输入红包总金额" />
      </el-form-item>
      <el-form-item label="红包个数" prop="totalCount">
        <el-input v-model="formData.totalCount" placeholder="请输入红包个数" />
      </el-form-item>
      <el-form-item label="红包类型: 1=普通,2=拼手气" prop="packetType">
        <el-radio-group v-model="formData.packetType">
          <el-radio value="1">普通</el-radio>
          <el-radio value="2">拼手气</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="祝福语" prop="message">
        <el-input v-model="formData.message" placeholder="请输入祝福语" />
      </el-form-item>
      <el-form-item label="过期时间" prop="expireTime">
        <el-date-picker
          v-model="formData.expireTime"
          type="date"
          value-format="x"
          placeholder="选择过期时间"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { UserMomentRedPacketApi, UserMomentRedPacket } from '@/api/gamer/usermomentredpacket'

/** 用户动态红包 表单 */
defineOptions({ name: 'UserMomentRedPacketForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  momentId: undefined,
  amount: undefined,
  totalCount: undefined,
  packetType: undefined,
  message: undefined,
  expireTime: undefined
})
const formRules = reactive({
  momentId: [{ required: true, message: '动态ID不能为空', trigger: 'blur' }],
  amount: [{ required: true, message: '红包总金额不能为空', trigger: 'blur' }],
  totalCount: [{ required: true, message: '红包个数不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await UserMomentRedPacketApi.getUserMomentRedPacket(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as UserMomentRedPacket
    if (formType.value === 'create') {
      await UserMomentRedPacketApi.createUserMomentRedPacket(data)
      message.success(t('common.createSuccess'))
    } else {
      await UserMomentRedPacketApi.updateUserMomentRedPacket(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    momentId: undefined,
    amount: undefined,
    totalCount: undefined,
    packetType: undefined,
    message: undefined,
    expireTime: undefined
  }
  formRef.value?.resetFields()
}
</script>

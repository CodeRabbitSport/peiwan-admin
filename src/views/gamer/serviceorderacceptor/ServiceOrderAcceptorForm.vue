<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="订单ID" prop="orderId">
        <el-input v-model="formData.orderId" placeholder="请输入订单ID" />
      </el-form-item>
      <el-form-item label="接单人用户ID" prop="acceptorId">
        <el-input v-model="formData.acceptorId" placeholder="请输入接单人用户ID" />
      </el-form-item>
      <el-form-item label="接单类型：1-个人接单, 2-组队接单" prop="acceptorType">
        <el-radio-group v-model="formData.acceptorType">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="接单状态：1-抢单中,
  2-已确认接单, 3-已取消接单" prop="acceptorStatus">
        <el-radio-group v-model="formData.acceptorStatus">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="是否是队长" prop="isLeader">
        <el-radio-group v-model="formData.isLeader">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="队伍ID" prop="teamId">
        <el-input v-model="formData.teamId" placeholder="请输入队伍ID" />
      </el-form-item>
      <el-form-item label="临时队伍ID" prop="tempTeamId">
        <el-input v-model="formData.tempTeamId" placeholder="请输入临时队伍ID" />
      </el-form-item>
      <el-form-item label="队伍名称" prop="teamName">
        <el-input v-model="formData.teamName" placeholder="请输入队伍名称" />
      </el-form-item>
      <el-form-item label="抢单时间" prop="grabTime">
        <el-date-picker
          v-model="formData.grabTime"
          type="date"
          value-format="x"
          placeholder="选择抢单时间"
        />
      </el-form-item>
      <el-form-item label="确认接单时间" prop="confirmTime">
        <el-date-picker
          v-model="formData.confirmTime"
          type="date"
          value-format="x"
          placeholder="选择确认接单时间"
        />
      </el-form-item>
      <el-form-item label="该接单人应得金额(分)" prop="acceptorAmount">
        <el-input v-model="formData.acceptorAmount" placeholder="请输入该接单人应得金额(分)" />
      </el-form-item>
      <el-form-item label="分成比例" prop="shareRatio">
        <el-input v-model="formData.shareRatio" placeholder="请输入分成比例" />
      </el-form-item>
      <el-form-item label="取消接单时间" prop="cancelTime">
        <el-date-picker
          v-model="formData.cancelTime"
          type="date"
          value-format="x"
          placeholder="选择取消接单时间"
        />
      </el-form-item>
      <el-form-item label="取消接单原因" prop="cancelReason">
        <el-input v-model="formData.cancelReason" placeholder="请输入取消接单原因" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { ServiceOrderAcceptorApi, ServiceOrderAcceptor } from '@/api/gamer/serviceorderacceptor'

/** 用户订单接单人 表单 */
defineOptions({ name: 'ServiceOrderAcceptorForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  orderId: undefined,
  acceptorId: undefined,
  acceptorType: undefined,
  acceptorStatus: undefined,
  isLeader: undefined,
  teamId: undefined,
  tempTeamId: undefined,
  teamName: undefined,
  grabTime: undefined,
  confirmTime: undefined,
  acceptorAmount: undefined,
  shareRatio: undefined,
  cancelTime: undefined,
  cancelReason: undefined,
  remark: undefined
})
const formRules = reactive({
  orderId: [{ required: true, message: '订单ID不能为空', trigger: 'blur' }],
  acceptorId: [{ required: true, message: '接单人用户ID不能为空', trigger: 'blur' }],
  acceptorType: [{ required: true, message: '接单类型：1-个人接单, 2-组队接单不能为空', trigger: 'blur' }],
  grabTime: [{ required: true, message: '抢单时间不能为空', trigger: 'blur' }]
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
      formData.value = await ServiceOrderAcceptorApi.getServiceOrderAcceptor(id)
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
    const data = formData.value as unknown as ServiceOrderAcceptor
    if (formType.value === 'create') {
      await ServiceOrderAcceptorApi.createServiceOrderAcceptor(data)
      message.success(t('common.createSuccess'))
    } else {
      await ServiceOrderAcceptorApi.updateServiceOrderAcceptor(data)
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
    orderId: undefined,
    acceptorId: undefined,
    acceptorType: undefined,
    acceptorStatus: undefined,
    isLeader: undefined,
    teamId: undefined,
    tempTeamId: undefined,
    teamName: undefined,
    grabTime: undefined,
    confirmTime: undefined,
    acceptorAmount: undefined,
    shareRatio: undefined,
    cancelTime: undefined,
    cancelReason: undefined,
    remark: undefined
  }
  formRef.value?.resetFields()
}
</script>
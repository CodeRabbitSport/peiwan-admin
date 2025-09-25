<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="用户ID" prop="userId">
        <el-input v-model="formData.userId" placeholder="请输入用户ID" />
      </el-form-item>
      <el-form-item label="类型(1:收入 2:支出)" prop="type">
        <el-radio-group v-model="formData.type">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="分类(1:充值 2:提现 3:订单收入 4:支付)" prop="category">
        <el-radio-group v-model="formData.category">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="金额(分)" prop="amount">
        <el-input v-model="formData.amount" placeholder="请输入金额(分)" />
      </el-form-item>
      <el-form-item label="变动前余额(分)" prop="balanceBefore">
        <el-input v-model="formData.balanceBefore" placeholder="请输入变动前余额(分)" />
      </el-form-item>
      <el-form-item label="变动后余额(分)" prop="balanceAfter">
        <el-input v-model="formData.balanceAfter" placeholder="请输入变动后余额(分)" />
      </el-form-item>
      <el-form-item label="业务标题" prop="businessTitle">
        <el-input v-model="formData.businessTitle" placeholder="请输入业务标题" />
      </el-form-item>
      <el-form-item label="业务类型" prop="businessType">
        <el-select v-model="formData.businessType" placeholder="请选择业务类型">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="关联业务ID" prop="businessId">
        <el-input v-model="formData.businessId" placeholder="请输入关联业务ID" />
      </el-form-item>
      <el-form-item label="订单号" prop="orderNo">
        <el-input v-model="formData.orderNo" placeholder="请输入订单号" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { UserIncomeExpenseDetailApi, UserIncomeExpenseDetail } from '@/api/gamer/userincomeexpensedetail'

/** 收入支出明细 表单 */
defineOptions({ name: 'UserIncomeExpenseDetailForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  userId: undefined,
  type: undefined,
  category: undefined,
  amount: undefined,
  balanceBefore: undefined,
  balanceAfter: undefined,
  businessTitle: undefined,
  businessType: undefined,
  businessId: undefined,
  orderNo: undefined
})
const formRules = reactive({
  userId: [{ required: true, message: '用户ID不能为空', trigger: 'blur' }],
  type: [{ required: true, message: '类型(1:收入 2:支出)不能为空', trigger: 'blur' }],
  category: [{ required: true, message: '分类(1:充值 2:提现 3:订单收入 4:支付)不能为空', trigger: 'blur' }],
  amount: [{ required: true, message: '金额(分)不能为空', trigger: 'blur' }],
  balanceBefore: [{ required: true, message: '变动前余额(分)不能为空', trigger: 'blur' }],
  balanceAfter: [{ required: true, message: '变动后余额(分)不能为空', trigger: 'blur' }]
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
      formData.value = await UserIncomeExpenseDetailApi.getUserIncomeExpenseDetail(id)
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
    const data = formData.value as unknown as UserIncomeExpenseDetail
    if (formType.value === 'create') {
      await UserIncomeExpenseDetailApi.createUserIncomeExpenseDetail(data)
      message.success(t('common.createSuccess'))
    } else {
      await UserIncomeExpenseDetailApi.updateUserIncomeExpenseDetail(data)
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
    userId: undefined,
    type: undefined,
    category: undefined,
    amount: undefined,
    balanceBefore: undefined,
    balanceAfter: undefined,
    businessTitle: undefined,
    businessType: undefined,
    businessId: undefined,
    orderNo: undefined
  }
  formRef.value?.resetFields()
}
</script>
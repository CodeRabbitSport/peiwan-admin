<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="用户优惠券ID" prop="userCouponId">
        <el-input v-model="formData.userCouponId" placeholder="请输入用户优惠券ID" />
      </el-form-item>
      <el-form-item label="用户ID" prop="userId">
        <el-input v-model="formData.userId" placeholder="请输入用户ID" />
      </el-form-item>
      <el-form-item label="优惠券ID" prop="couponId">
        <el-input v-model="formData.couponId" placeholder="请输入优惠券ID" />
      </el-form-item>
      <el-form-item label="优惠券名称" prop="couponName">
        <el-input v-model="formData.couponName" placeholder="请输入优惠券名称" />
      </el-form-item>
      <el-form-item label="优惠券类型" prop="couponType">
        <el-select v-model="formData.couponType" placeholder="请选择优惠券类型">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="优惠金额/折扣比例" prop="couponAmount">
        <el-input v-model="formData.couponAmount" placeholder="请输入优惠金额/折扣比例" />
      </el-form-item>
      <el-form-item label="最低订单金额要求" prop="couponMinOrderAmount">
        <el-input v-model="formData.couponMinOrderAmount" placeholder="请输入最低订单金额要求" />
      </el-form-item>
      <el-form-item label="业务ID" prop="bizId">
        <el-input v-model="formData.bizId" placeholder="请输入业务ID" />
      </el-form-item>
      <el-form-item label="业务金额" prop="bizAmount">
        <el-input v-model="formData.bizAmount" placeholder="请输入业务金额" />
      </el-form-item>
      <el-form-item label="优惠金额" prop="discountAmount">
        <el-input v-model="formData.discountAmount" placeholder="请输入优惠金额" />
      </el-form-item>
      <el-form-item label="使用时间" prop="usedAt">
        <el-date-picker
          v-model="formData.usedAt"
          type="date"
          value-format="x"
          placeholder="选择使用时间"
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
import { UserCouponUsageApi, UserCouponUsage } from '@/api/gamer/usercouponusage'

/** 优惠券使用记录 表单 */
defineOptions({ name: 'UserCouponUsageForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  userCouponId: undefined,
  userId: undefined,
  couponId: undefined,
  couponName: undefined,
  couponType: undefined,
  couponAmount: undefined,
  couponMinOrderAmount: undefined,
  bizId: undefined,
  bizAmount: undefined,
  discountAmount: undefined,
  usedAt: undefined
})
const formRules = reactive({
  userCouponId: [{ required: true, message: '用户优惠券ID不能为空', trigger: 'blur' }],
  userId: [{ required: true, message: '用户ID不能为空', trigger: 'blur' }],
  couponId: [{ required: true, message: '优惠券ID不能为空', trigger: 'blur' }],
  couponName: [{ required: true, message: '优惠券名称不能为空', trigger: 'blur' }],
  couponType: [{ required: true, message: '优惠券类型不能为空', trigger: 'change' }],
  couponAmount: [{ required: true, message: '优惠金额/折扣比例不能为空', trigger: 'blur' }],
  bizId: [{ required: true, message: '业务ID不能为空', trigger: 'blur' }],
  bizAmount: [{ required: true, message: '业务金额不能为空', trigger: 'blur' }],
  discountAmount: [{ required: true, message: '优惠金额不能为空', trigger: 'blur' }],
  usedAt: [{ required: true, message: '使用时间不能为空', trigger: 'blur' }]
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
      formData.value = await UserCouponUsageApi.getUserCouponUsage(id)
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
    const data = formData.value as unknown as UserCouponUsage
    if (formType.value === 'create') {
      await UserCouponUsageApi.createUserCouponUsage(data)
      message.success(t('common.createSuccess'))
    } else {
      await UserCouponUsageApi.updateUserCouponUsage(data)
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
    userCouponId: undefined,
    userId: undefined,
    couponId: undefined,
    couponName: undefined,
    couponType: undefined,
    couponAmount: undefined,
    couponMinOrderAmount: undefined,
    bizId: undefined,
    bizAmount: undefined,
    discountAmount: undefined,
    usedAt: undefined
  }
  formRef.value?.resetFields()
}
</script>
<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="优惠券名称" prop="couponName">
        <el-input v-model="formData.couponName" placeholder="请输入优惠券名称" />
      </el-form-item>
      <el-form-item label="优惠券类型: 1-满减券, 2-折扣券, 3-无门槛券(即min_order_amount为0)" prop="couponType">
        <el-select v-model="formData.couponType" placeholder="请选择优惠券类型: 1-满减券, 2-折扣券, 3-无门槛券(即min_order_amount为0)">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="优惠金额/折扣比例(折扣券为小数如0.9表示9折)" prop="couponAmount">
        <el-input v-model="formData.couponAmount" placeholder="请输入优惠金额/折扣比例(折扣券为小数如0.9表示9折)" />
      </el-form-item>
      <el-form-item label="最低订单金额要求(满多少可用)" prop="couponMinOrderAmount">
        <el-input v-model="formData.couponMinOrderAmount" placeholder="请输入最低订单金额要求(满多少可用)" />
      </el-form-item>
      <el-form-item label="有效天数(从领取开始计算)" prop="validityDays">
        <el-input v-model="formData.validityDays" placeholder="请输入有效天数(从领取开始计算)" />
      </el-form-item>
      <el-form-item label="优惠券描述" prop="couponDesc">
        <el-input v-model="formData.couponDesc" placeholder="请输入优惠券描述" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { CouponApi, Coupon } from '@/api/gamer/coupon'

/** 优惠券 表单 */
defineOptions({ name: 'CouponForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  couponName: undefined,
  couponType: undefined,
  couponAmount: undefined,
  couponMinOrderAmount: undefined,
  validityDays: undefined,
  couponDesc: undefined
})
const formRules = reactive({
  couponName: [{ required: true, message: '优惠券名称不能为空', trigger: 'blur' }],
  couponType: [{ required: true, message: '优惠券类型: 1-满减券, 2-折扣券, 3-无门槛券(即min_order_amount为0)不能为空', trigger: 'change' }],
  couponAmount: [{ required: true, message: '优惠金额/折扣比例(折扣券为小数如0.9表示9折)不能为空', trigger: 'blur' }],
  validityDays: [{ required: true, message: '有效天数(从领取开始计算)不能为空', trigger: 'blur' }]
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
      formData.value = await CouponApi.getCoupon(id)
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
    const data = formData.value as unknown as Coupon
    if (formType.value === 'create') {
      await CouponApi.createCoupon(data)
      message.success(t('common.createSuccess'))
    } else {
      await CouponApi.updateCoupon(data)
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
    couponName: undefined,
    couponType: undefined,
    couponAmount: undefined,
    couponMinOrderAmount: undefined,
    validityDays: undefined,
    couponDesc: undefined
  }
  formRef.value?.resetFields()
}
</script>
<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="80px"
      v-loading="formLoading"
    >
      <el-form-item label="用户ID" prop="userId">
        <el-input v-model="formData.userId" placeholder="请输入用户ID" />
      </el-form-item>
      <el-form-item label="券ID" prop="couponId">
        <el-input v-model="formData.couponId" placeholder="请输入券ID" />
      </el-form-item>
      <el-form-item label="券编码" prop="couponCode">
        <el-input v-model="formData.couponCode" placeholder="请输入券编码" />
      </el-form-item>
      <el-form-item label="券名称" prop="couponName">
        <el-input v-model="formData.couponName" placeholder="请输入券名称" />
      </el-form-item>
      <el-form-item label="券类型" prop="couponType">
        <el-select v-model="formData.couponType" placeholder="请选择券类型">
          <el-option label="满减券" :value="1" />
          <el-option label="折扣券" :value="2" />
          <el-option label="无门槛券" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="金额/折扣" prop="couponAmount">
        <el-input v-model="formData.couponAmount" placeholder="请输入金额或折扣">
          <template #append>
            <span v-if="formData.couponType === 2">折</span>
            <span v-else>元</span>
          </template>
        </el-input>
        <div class="text-xs text-gray-400 mt-1">
          满减券/无门槛券填写金额（元），折扣券填写折扣（如0.9表示9折）
        </div>
      </el-form-item>
      <el-form-item label="最低金额" prop="couponMinOrderAmount">
        <el-input v-model="formData.couponMinOrderAmount" placeholder="请输入最低金额">
          <template #append>元</template>
        </el-input>
        <div class="text-xs text-gray-400 mt-1">
          设置使用门槛，0表示无门槛
        </div>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="formData.status" placeholder="请选择状态">
          <el-option label="未使用" :value="0" />
          <el-option label="已使用" :value="1" />
          <el-option label="已过期" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="领取时间" prop="receivedAt">
        <el-date-picker
          v-model="formData.receivedAt"
          type="date"
          value-format="x"
          placeholder="选择领取时间"
        />
      </el-form-item>
      <el-form-item label="使用时间" prop="usedAt">
        <el-date-picker
          v-model="formData.usedAt"
          type="date"
          value-format="x"
          placeholder="选择使用时间"
        />
      </el-form-item>
      <el-form-item label="业务ID" prop="bizId">
        <el-input v-model="formData.bizId" placeholder="请输入业务ID" />
      </el-form-item>
      <el-form-item label="有效期" prop="validUntil">
        <el-date-picker
          v-model="formData.validUntil"
          type="date"
          value-format="x"
          placeholder="选择有效期"
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
import { UserCouponApi, UserCoupon } from '@/api/gamer/usercoupon'
import { fenToYuan, yuanToFen } from '@/utils'

/** 用户优惠券 表单 */
defineOptions({ name: 'UserCouponForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  userId: undefined,
  couponId: undefined,
  couponCode: undefined,
  couponName: undefined,
  couponType: undefined,
  couponAmount: undefined,
  couponMinOrderAmount: undefined,
  status: undefined,
  receivedAt: undefined,
  usedAt: undefined,
  bizId: undefined,
  validUntil: undefined
})
const formRules = reactive({
  userId: [{ required: true, message: '用户ID不能为空', trigger: 'blur' }],
  couponId: [{ required: true, message: '券ID不能为空', trigger: 'blur' }],
  couponCode: [{ required: true, message: '券编码不能为空', trigger: 'blur' }],
  couponName: [{ required: true, message: '券名称不能为空', trigger: 'blur' }],
  couponType: [{ required: true, message: '券类型不能为空', trigger: 'change' }],
  couponAmount: [{ required: true, message: '金额/折扣不能为空', trigger: 'change' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
  receivedAt: [{ required: true, message: '领取时间不能为空', trigger: 'blur' }],
  validUntil: [{ required: true, message: '有效期不能为空', trigger: 'blur' }]
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
      formData.value = await UserCouponApi.getUserCoupon(id)
      // 分转元用于回显（折扣券除外）
      if (formData.value.couponType !== 2 && formData.value.couponAmount) {
        formData.value.couponAmount = fenToYuan(formData.value.couponAmount) as any
      }
      if (formData.value.couponMinOrderAmount != null) {
        formData.value.couponMinOrderAmount = fenToYuan(formData.value.couponMinOrderAmount) as any
      }
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
    const data = { ...formData.value } as unknown as UserCoupon
    // 元转分提交（折扣券除外）
    if (data.couponType !== 2 && data.couponAmount) {
      data.couponAmount = yuanToFen(data.couponAmount)
    }
    if (data.couponMinOrderAmount != null) {
      data.couponMinOrderAmount = yuanToFen(data.couponMinOrderAmount)
    }
    
    if (formType.value === 'create') {
      await UserCouponApi.createUserCoupon(data)
      message.success(t('common.createSuccess'))
    } else {
      await UserCouponApi.updateUserCoupon(data)
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
    couponId: undefined,
    couponCode: undefined,
    couponName: undefined,
    couponType: undefined,
    couponAmount: undefined,
    couponMinOrderAmount: undefined,
    status: undefined,
    receivedAt: undefined,
    usedAt: undefined,
    bizId: undefined,
    validUntil: undefined
  }
  formRef.value?.resetFields()
}
</script>
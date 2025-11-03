<script setup lang="ts">
import type { Coupon } from '@/api/gamer/coupon'
import { CouponApi } from '@/api/gamer/coupon'
import { fenToYuan, yuanToFen } from '@/utils'

/** 优惠券 表单 */
defineOptions({ name: 'CouponForm' })

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
  couponName: undefined,
  couponType: undefined,
  couponAmount: undefined,
  couponMinOrderAmount: undefined,
  validityDays: undefined,
  couponDesc: undefined,
  indexGet: false,
  maxIndexGet: 1,
})
const formRules = reactive({
  couponName: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
  couponType: [{ required: true, message: '类型不能为空', trigger: 'change' }],
  couponAmount: [{ required: true, message: '金额/折扣不能为空', trigger: 'blur' }],
  validityDays: [{ required: true, message: '有效天数不能为空', trigger: 'change' }],
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
      formData.value = await CouponApi.getCoupon(id)
      // 分转元用于回显（折扣券除外）
      if (formData.value.couponType !== 2 && formData.value.couponAmount) {
        formData.value.couponAmount = fenToYuan(formData.value.couponAmount) as any
      }
      if (formData.value.couponMinOrderAmount != null) {
        formData.value.couponMinOrderAmount = fenToYuan(formData.value.couponMinOrderAmount) as any
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
    const data = { ...formData.value } as unknown as Coupon
    // 元转分提交（折扣券除外）
    if (data.couponType !== 2 && data.couponAmount) {
      data.couponAmount = yuanToFen(data.couponAmount)
    }
    if (data.couponMinOrderAmount != null) {
      data.couponMinOrderAmount = yuanToFen(data.couponMinOrderAmount)
    }
    
    if (formType.value === 'create') {
      await CouponApi.createCoupon(data)
      message.success(t('common.createSuccess'))
    }
    else {
      await CouponApi.updateCoupon(data)
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
    couponName: undefined,
    couponType: undefined,
    couponAmount: undefined,
    couponMinOrderAmount: undefined,
    validityDays: undefined,
    couponDesc: undefined,
    indexGet: false,
    maxIndexGet: 1,
  }
  formRef.value?.resetFields()
}
</script>

<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" align-center width="70vw">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"

      label-width="100px"
    >
      <el-form-item label="名称" prop="couponName">
        <el-input v-model="formData.couponName" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="类型" prop="couponType">
        <el-select v-model="formData.couponType" placeholder="请选择类型">
          <el-option label="满减券" :value="1" />
          <!-- <el-option label="折扣券" :value="2" /> -->
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
      <el-form-item v-if="formData.couponType === 1" label="满减金额" prop="couponMinOrderAmount">
        <el-input v-model="formData.couponMinOrderAmount" placeholder="请输入满多少可用">
          <template #append>元</template>
        </el-input>
        <div class="text-xs text-gray-400 mt-1">
          设置使用门槛，订单满此金额才可使用优惠券
        </div>
      </el-form-item>
      <el-form-item label="有效天数" prop="validityDays">
        <el-input v-model="formData.validityDays" placeholder="请输入有效天数" />
      </el-form-item>
      <el-form-item label="描述" prop="couponDesc">
        <el-input v-model="formData.couponDesc" placeholder="请输入描述" />
      </el-form-item>
      <el-form-item label="上/下架" prop="indexGet">
        <el-switch v-model="formData.indexGet" />
      </el-form-item>
      <!-- <el-form-item label="最大领取次数" prop="maxIndexGet">
        <el-input-number v-model="formData.maxIndexGet" :min="0" placeholder="请输入最大领取次数" />
      </el-form-item> -->
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

<template>
  <Dialog :title="dialogTitle"  v-model="dialogVisible" align-center>
    <div class="h-[75vh] overflow-auto">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="150px"
        v-loading="formLoading">
        <el-form-item label="分类类型" prop="categoryType">
          <el-radio-group v-model="formData.categoryType">
            <el-radio :value="1">陪玩</el-radio>
            <el-radio :value="2">打手</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="等级名称" prop="levelName">
          <el-input v-model="formData.levelName" placeholder="请输入等级名称" />
        </el-form-item>
        <el-form-item label="级别号" prop="levelNumber">
          <el-input v-model="formData.levelNumber" placeholder="请输入级别号" />
        </el-form-item>
        <el-form-item label="自助升级费用" prop="upgradeFee">
          <el-input v-model="formData.upgradeFee" placeholder="请输入自助升级费用" />
        </el-form-item>
        <el-form-item label="自助升级天数" prop="upgradeDays">
          <el-input v-model="formData.upgradeDays" placeholder="请输入自助升级天数" />
        </el-form-item>
        <el-form-item label="是否默认等级" prop="isDefault">
          <el-switch
            v-model="formData.isDefault"
            active-text="是"
            inactive-text="否" />
        </el-form-item>
        <el-form-item label="是否可升级" prop="canUpgrade">
          <el-switch
            v-model="formData.canUpgrade"
            active-text="是"
            inactive-text="否" />
        </el-form-item>
        <el-form-item label="接单保证金" prop="depositFee">
          <el-input v-model="formData.depositFee" placeholder="请输入接单保证金">
            <template #append>分</template>
          </el-input>
        </el-form-item>
        <el-form-item label="每日接单数" prop="dailyOrderLimit">
          <el-input v-model="formData.dailyOrderLimit" placeholder="请输入每日接单数，0 表示不限制">
            <template #append>单</template>
          </el-input>
        </el-form-item>
        <el-form-item label="新待接订单延迟接单时间" prop="newOrderDelaySeconds">
          <el-input v-model="formData.newOrderDelaySeconds" placeholder="请输入延迟接单时间">
            <template #append>秒</template>
          </el-input>
        </el-form-item>
        <el-form-item label="提现手续费" prop="withdrawalFeeRate">
          <el-input v-model="formData.withdrawalFeeRate" placeholder="请输入提现手续费">
            <template #append>%</template>
          </el-input>
        </el-form-item>
        <el-form-item label="订单服务费解冻时间" prop="orderFeeUnfreezeSeconds">
          <el-input v-model="formData.orderFeeUnfreezeSeconds" placeholder="请输入解冻时间">
            <template #append>秒</template>
          </el-input>
        </el-form-item>
        <el-form-item label="打赏金额抽成比例" prop="rewardCommissionRate">
          <el-input v-model="formData.rewardCommissionRate" placeholder="请输入打赏金额抽成比例">
            <template #append>%</template>
          </el-input>
        </el-form-item>
        <el-form-item label="可自主取消接单订单" prop="canCancelOrder">
          <el-switch v-model="formData.canCancelOrder" active-text="有" inactive-text="无" />
        </el-form-item>
        <el-form-item label="可自主退款接单订单" prop="canRefundOrder">
          <el-switch v-model="formData.canRefundOrder" active-text="有" inactive-text="无" />
        </el-form-item>
        <el-form-item label="查看已申请退款订单用户手机号" prop="canViewRefundPhone">
          <el-switch v-model="formData.canViewRefundPhone" active-text="有" inactive-text="无" />
        </el-form-item>
        <el-form-item label="查看未退款订单用户手机号" prop="canViewUnrefundedPhone">
          <el-switch v-model="formData.canViewUnrefundedPhone" active-text="有" inactive-text="无" />
        </el-form-item>
        <el-form-item label="查看未退款订单用户手机号天数" prop="viewPhoneDaysLimit">
          <el-input v-model="formData.viewPhoneDaysLimit" placeholder="请输入天数，-1 表示不限制">
            <template #append>天</template>
          </el-input>
        </el-form-item>
        <el-form-item label="设置用户公告内容" prop="canSetAnnouncement">
          <el-switch v-model="formData.canSetAnnouncement" active-text="有" inactive-text="无" />
        </el-form-item>
        <el-form-item label="自主申请保证金退还安全期限" prop="depositRefundSafeDays">
          <el-input v-model="formData.depositRefundSafeDays" placeholder="请输入安全期限">
            <template #append>天</template>
          </el-input>
        </el-form-item>
        <el-form-item label="限制指定接单商品编号列表" prop="restrictedProductIds">
          <el-input v-model="formData.restrictedProductIds" placeholder="逗号分隔，留空表示不限制" />
        </el-form-item>
        <el-form-item label="限制每日接单缴费金额" prop="dailyOrderFeeLimit">
          <el-input v-model="formData.dailyOrderFeeLimit" placeholder="请输入每日缴费金额上限">
            <template #append>分</template>
          </el-input>
        </el-form-item>
        <el-form-item label="限制同时可接单数" prop="simultaneousOrderLimit">
          <el-input v-model="formData.simultaneousOrderLimit" placeholder="请输入数量，0 表示不限制">
            <template #append>单</template>
          </el-input>
        </el-form-item>
        <el-form-item label="接单验证类型" prop="orderVerificationType">
          <el-select v-model="formData.orderVerificationType" placeholder="请选择接单验证类型">
            <el-option label="无需验证" :value="0" />
            <el-option label="短信验证" :value="1" />
            <el-option label="支付密码验证" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="限制升级人数名额" prop="upgradeSlotLimit">
          <el-input v-model="formData.upgradeSlotLimit" placeholder="请输入名额，0 表示不限制" />
        </el-form-item>
        <el-form-item label="允许充值保证金" prop="allowDepositRecharge">
          <el-switch v-model="formData.allowDepositRecharge" active-text="允许" inactive-text="不允许" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { LevelConfigApi, LevelConfig } from '@/api/gamer/levelconfig'

/** 打手等级配置 表单 */
defineOptions({ name: 'LevelConfigForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref<Partial<LevelConfig>>({
  id: undefined,
  categoryType: undefined,
  levelName: undefined,
  levelNumber: undefined,
  upgradeFee: undefined,
  upgradeDays: undefined,
  isDefault: undefined,
  canUpgrade: undefined,
  depositFee: undefined,
  dailyOrderLimit: undefined,
  newOrderDelaySeconds: undefined,
  withdrawalFeeRate: undefined,
  orderFeeUnfreezeSeconds: undefined,
  rewardCommissionRate: undefined,
  canCancelOrder: undefined,
  canRefundOrder: undefined,
  canViewRefundPhone: undefined,
  canViewUnrefundedPhone: undefined,
  viewPhoneDaysLimit: undefined,
  canSetAnnouncement: undefined,
  depositRefundSafeDays: undefined,
  restrictedProductIds: undefined,
  dailyOrderFeeLimit: undefined,
  simultaneousOrderLimit: undefined,
  orderVerificationType: undefined,
  upgradeSlotLimit: undefined,
  allowDepositRecharge: undefined,
  remark: undefined
})
const formRules = reactive({
  categoryType: [{ required: true, message: '分类类型不能为空', trigger: 'change' }],
  levelName: [{ required: true, message: '等级名称不能为空', trigger: 'blur' }],
  levelNumber: [{ required: true, message: '级别号不能为空', trigger: 'blur' }],
  upgradeFee: [{ required: true, message: '自助升级费用不能为空', trigger: 'blur' }],
  upgradeDays: [{ required: true, message: '自助升级天数不能为空', trigger: 'blur' }],
  isDefault: [{ required: true, message: '是否默认等级不能为空', trigger: 'change' }],
  canUpgrade: [{ required: true, message: '是否可升级不能为空', trigger: 'change' }],
  depositFee: [{ required: true, message: '接单保证金不能为空', trigger: 'blur' }],
  dailyOrderLimit: [{ required: true, message: '每日接单数不能为空', trigger: 'blur' }],
  newOrderDelaySeconds: [{ required: true, message: '延迟接单时间不能为空', trigger: 'blur' }],
  withdrawalFeeRate: [{ required: true, message: '提现手续费不能为空', trigger: 'blur' }],
  orderFeeUnfreezeSeconds: [{ required: true, message: '服务费解冻时间不能为空', trigger: 'blur' }],
  rewardCommissionRate: [{ required: true, message: '打赏抽成比例不能为空', trigger: 'blur' }],
  canCancelOrder: [{ required: true, message: '可自主取消接单订单不能为空', trigger: 'change' }],
  canRefundOrder: [{ required: true, message: '可自主退款接单订单不能为空', trigger: 'change' }],
  canViewRefundPhone: [{ required: true, message: '查看已申请退款订单用户手机号不能为空', trigger: 'change' }],
  canViewUnrefundedPhone: [{ required: true, message: '查看未退款订单用户手机号不能为空', trigger: 'change' }],
  viewPhoneDaysLimit: [{ required: true, message: '查看未退款订单用户手机号天数不能为空', trigger: 'blur' }],
  canSetAnnouncement: [{ required: true, message: '设置用户公告内容不能为空', trigger: 'change' }],
  depositRefundSafeDays: [{ required: true, message: '保证金退还安全期限不能为空', trigger: 'blur' }],
  dailyOrderFeeLimit: [{ required: true, message: '每日缴费金额上限不能为空', trigger: 'blur' }],
  simultaneousOrderLimit: [{ required: true, message: '同时可接单数不能为空', trigger: 'blur' }],
  orderVerificationType: [{ required: true, message: '接单验证类型不能为空', trigger: 'change' }],
  upgradeSlotLimit: [{ required: true, message: '升级人数名额不能为空', trigger: 'blur' }],
  allowDepositRecharge: [{ required: true, message: '允许充值保证金不能为空', trigger: 'change' }]
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
      formData.value = await LevelConfigApi.getLevelConfig(id)
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
    const data = formData.value as unknown as LevelConfig
    if (formType.value === 'create') {
      await LevelConfigApi.createLevelConfig(data)
      message.success(t('common.createSuccess'))
    } else {
      await LevelConfigApi.updateLevelConfig(data)
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
    categoryType: undefined,
    levelName: undefined,
    levelNumber: undefined,
    upgradeFee: undefined,
    upgradeDays: undefined,
    isDefault: false,
    canUpgrade: false,
    depositFee: undefined,
    dailyOrderLimit: undefined,
    newOrderDelaySeconds: undefined,
    withdrawalFeeRate: undefined,
    orderFeeUnfreezeSeconds: undefined,
    rewardCommissionRate: undefined,
    canCancelOrder: false,
    canRefundOrder: false,
    canViewRefundPhone: false,
    canViewUnrefundedPhone: false,
    viewPhoneDaysLimit: undefined,
    canSetAnnouncement: false,
    depositRefundSafeDays: undefined,
    restrictedProductIds: '',
    dailyOrderFeeLimit: undefined,
    simultaneousOrderLimit: undefined,
    orderVerificationType: 0,
    upgradeSlotLimit: undefined,
    allowDepositRecharge: false,
    remark: ''
  }
  formRef.value?.resetFields()
}
</script>

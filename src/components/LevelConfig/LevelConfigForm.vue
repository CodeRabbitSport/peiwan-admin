<script setup lang="ts">
import type { LevelConfig } from '@/api/gamer/levelconfig'
import { LevelConfigApi } from '@/api/gamer/levelconfig'
import type { Product } from '@/api/gamer/product'
import { ProductApi } from '@/api/gamer/product'
import { ProductCategoryApi } from '@/api/gamer/productcategory'

/** 等级配置表单组件 */
defineOptions({ name: 'LevelConfigForm' })

const props = withDefaults(defineProps<Props>(), {
  categoryLabel: '陪玩',
  categoryTagType: 'success',
})

/** 提交表单 */
const emit = defineEmits(['success'])

interface Props {
  categoryType: 1 | 2 // 1: 陪玩, 2: 打手
  categoryLabel?: string // 分类标签文本
  categoryTagType?: 'success' | 'warning' | 'info' | 'danger' // 标签类型
}

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref<Partial<LevonelConfig>>({
  id: undefined,
  categoryType: props.categoryType,
  categoryId: undefined, // 商品分类ID（仅陪玩使用）
  unitPrice: undefined, // 单价/每小时（元，陪玩使用）
  commissionRate: undefined, // 佣金抽成比率（陪玩使用，%）
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
  canCancelOrder: true, // 默认值
  canRefundOrder: true, // 默认值
  canViewRefundPhone: true, // 默认值
  canViewUnrefundedPhone: true, // 默认值
  viewPhoneDaysLimit: -1, // 默认值
  canSetAnnouncement: undefined,
  depositRefundSafeDays: undefined,
  restrictedProductIds: undefined,
  dailyOrderFeeLimit: 0,
  simultaneousOrderLimit: 0,
  orderVerificationType: undefined,
  upgradeSlotLimit: undefined,
  allowDepositRecharge: undefined,
  remark: undefined,
})
// 动态验证规则
const formRules = computed(() => ({
  categoryType: [{ required: true, message: '分类类型不能为空', trigger: 'change' }],
  categoryId: props.categoryType === 1 ? [{ required: true, message: '商品分类不能为空', trigger: 'change' }] : [],
  unitPrice: props.categoryType === 1 ? [{ required: true, message: '单价不能为空', trigger: 'blur' }] : [],
  commissionRate: props.categoryType === 1 ? [{ required: true, message: '佣金抽成比率不能为空', trigger: 'blur' }] : [],
  levelName: [{ required: true, message: '等级名称不能为空', trigger: 'blur' }],
  levelNumber: [{ required: true, message: '级别号不能为空', trigger: 'blur' }],
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
  allowDepositRecharge: [{ required: true, message: '允许充值保证金不能为空', trigger: 'change' }],
}))
const formRef = ref() // 表单 Ref

// 商品分类列表（仅陪玩使用）
const categoryOptions = ref<Array<{ label: string, value: number }>>([])

// 获取商品分类列表
async function loadCategoryOptions() {
  if (props.categoryType !== 1) return // 仅陪玩需要加载
  try {
    const { list = [] } = await ProductCategoryApi.getProductCategoryPage()
    categoryOptions.value = list.map((item: any) => ({
      label: item.categoryName,
      value: item.id,
    }))
  }
  catch (error) {
    console.error('获取商品分类列表失败:', error)
  }
}

/** 打开弹窗 */
async function open(type: string, id?: number) {
  dialogVisible.value = true
  dialogTitle.value = t(`action.${type}`)
  formType.value = type
  resetForm()
  // 加载商品分类列表（陪玩）
  if (props.categoryType === 1 && !categoryOptions.value.length) {
    await loadCategoryOptions()
  }
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await LevelConfigApi.getLevelConfig(id)
      formData.value.depositFee = formData.value.depositFee ? formData.value.depositFee / 100 : undefined
      formData.value.dailyOrderFeeLimit = formData.value.dailyOrderFeeLimit ? formData.value.dailyOrderFeeLimit / 100 : undefined
      // 单价：分转元（仅陪玩）
      if (props.categoryType === 1 && formData.value.unitPrice) {
        formData.value.unitPrice = formData.value.unitPrice / 100
      }
    }
    finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 定义 success 事件，用于操作成功后的回调
async function submitForm() {
  try {
    // 校验表单
    await formRef.value.validate()
  }
  catch {
    message.error('表单校验失败')
    return
  }
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as LevelConfig
    data.depositFee = data.depositFee ? data.depositFee * 100 : undefined
    data.dailyOrderFeeLimit = data.dailyOrderFeeLimit ? data.dailyOrderFeeLimit * 100 : undefined
    // 单价：元转分（仅陪玩）
    if (props.categoryType === 1 && data.unitPrice) {
      data.unitPrice = data.unitPrice * 100
    }
    data.categoryType = props.categoryType // 强制设置为对应类型
    // 提交前为隐藏字段补默认值（若未设置）
    if (data.upgradeFee == null) data.upgradeFee = 0
    if (data.upgradeDays == null) data.upgradeDays = 0
    if (data.isDefault == null) data.isDefault = false
    if (data.canUpgrade == null) data.canUpgrade = false
    if (formType.value === 'create') {
      await LevelConfigApi.createLevelConfig(data)
      message.success(t('common.createSuccess'))
    }
    else {
      await LevelConfigApi.updateLevelConfig(data)
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
    categoryType: props.categoryType,
    categoryId: undefined,
    unitPrice: undefined,
    commissionRate: undefined,
    levelName: undefined,
    levelNumber: undefined,
    upgradeFee: undefined,
    upgradeDays: undefined,
    isDefault: false,
    canUpgrade: true,
    depositFee: undefined,
    dailyOrderLimit: undefined,
    newOrderDelaySeconds: undefined,
    withdrawalFeeRate: undefined,
    orderFeeUnfreezeSeconds: undefined,
    rewardCommissionRate: undefined,
    canCancelOrder: true, // 默认值
    canRefundOrder: true, // 默认值
    canViewRefundPhone: true, // 默认值
    canViewUnrefundedPhone: true, // 默认值
    viewPhoneDaysLimit: 0, // 默认值
    canSetAnnouncement: true,
    depositRefundSafeDays: undefined,
    restrictedProductIds: '',
    dailyOrderFeeLimit: undefined,
    simultaneousOrderLimit: undefined,
    orderVerificationType: 0,
    upgradeSlotLimit: undefined,
    allowDepositRecharge: false,
    remark: '',
  }
  formRef.value?.resetFields()
}

// ---------------- 商品选择逻辑 ----------------
const productSelectorVisible = ref(false)
const productLoading = ref(false)
const productList = ref<Product[]>([])
const productTotal = ref(0)
const productTableRef = ref()
const productQuery = reactive({
  pageNo: 1,
  pageSize: 10,
  productTitle: '',
})

// 已选商品（跨页保留）
const selectedProductMap = ref<Map<number, Product>>(new Map())
const selectedProductIds = computed(() => Array.from(selectedProductMap.value.keys()))
const selectedProductNamesDisplay = computed(() =>
  selectedProductMap.value.size > 0
    ? Array.from(selectedProductMap.value.values())
        .map(p => p.productTitle || `#${p.id}`)
        .join(', ')
    : '',
)

async function openProductSelector() {
  productSelectorVisible.value = true
  await getProductList()
}

function productHandleQuery() {
  productQuery.pageNo = 1
  getProductList()
}
function productResetQuery() {
  productQuery.productTitle = ''
  productHandleQuery()
}

async function getProductList() {
  productLoading.value = true
  try {
    const data = await ProductApi.getProductPage(productQuery)
    productList.value = data.list || []
    productTotal.value = data.total || 0
  }
  finally {
    productLoading.value = false
    // 恢复本页已选中的行
    nextTick(() => {
      try {
        productList.value.forEach((row) => {
          const selected = selectedProductMap.value.has(row.id)
          productTableRef.value?.toggleRowSelection(row, selected)
        })
      }
      catch {}
    })
  }
}

function handleProductSelectionChange(rows: Product[]) {
  const currentPageIds = new Set(productList.value.map(r => r.id))
  // 清除本页中已取消选中的项
  for (const id of Array.from(selectedProductMap.value.keys())) {
    if (currentPageIds.has(id) && !rows.some(r => r.id === id)) {
      selectedProductMap.value.delete(id)
    }
  }
  // 添加当前页新选中的项
  rows.forEach((r) => {
    selectedProductMap.value.set(r.id, r)
  })
}

function confirmProductSelection() {
  const ids = selectedProductIds.value
  formData.value.restrictedProductIds = ids.length ? ids.join(',') : ''
  productSelectorVisible.value = false
}

function clearSelectedProducts() {
  selectedProductMap.value.clear()
  formData.value.restrictedProductIds = ''
}
</script>

<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" align-center wi>
    <div class="h-[75vh] overflow-auto">
      <el-form
        ref="formRef"
        v-loading="formLoading"
        :model="formData"
        :rules="formRules"
        label-width="220px"
      >
        <el-form-item label="分类类型" prop="categoryType">
          <el-tag :type="categoryTagType">
            {{ categoryLabel }}
          </el-tag>
        </el-form-item>
        <el-form-item v-if="props.categoryType === 1" label="商品分类" prop="categoryId">
          <el-select
            v-model="formData.categoryId"
            placeholder="请选择商品分类"
            filterable
            clearable
            class="w-full"
          >
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="props.categoryType === 1" label="单价(每小时)" prop="unitPrice">
          <el-input v-model="formData.unitPrice" placeholder="请输入单价" type="number">
            <template #append>
              元
            </template>
          </el-input>
        </el-form-item>
        <el-form-item v-if="props.categoryType === 1" label="陪玩到手比例" prop="commissionRate">
          <el-input v-model="formData.commissionRate" placeholder="请输入陪玩到手比例" type="number">
            <template #append>
              %
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="等级名称" prop="levelName">
          <el-input v-model="formData.levelName" placeholder="请输入等级名称" />
        </el-form-item>
        <el-form-item label="级别号" prop="levelNumber">
          <el-input v-model="formData.levelNumber" placeholder="请输入级别号" />
        </el-form-item>
        <el-form-item label="接单保证金" prop="depositFee">
          <el-input v-model="formData.depositFee" placeholder="请输入接单保证金">
            <template #append>
              元
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="允许订单抵扣保证金" prop="allowDepositRecharge">
          <el-switch v-model="formData.allowDepositRecharge" active-text="允许" inactive-text="不允许" />
        </el-form-item>
        <el-form-item label="每日接单数" prop="dailyOrderLimit">
          <el-input v-model="formData.dailyOrderLimit" placeholder="请输入每日接单数，0 表示不限制">
            <template #append>
              单
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="新待接订单延迟接单时间" prop="newOrderDelaySeconds">
          <el-input-number v-model="formData.newOrderDelaySeconds" placeholder="请输入延迟接单时间">
            <template #append>
              秒
            </template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="提现手续费" prop="withdrawalFeeRate">
          <el-input v-model="formData.withdrawalFeeRate" placeholder="请输入提现手续费">
            <template #append>
              %
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="订单服务费解冻时间" prop="orderFeeUnfreezeSeconds">
          <el-input v-model="formData.orderFeeUnfreezeSeconds" placeholder="请输入解冻时间">
            <template #append>
              秒
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="打赏金额抽成比例" prop="rewardCommissionRate">
          <el-input v-model="formData.rewardCommissionRate" placeholder="请输入打赏金额抽成比例">
            <template #append>
              %
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="设置用户公告内容" prop="canSetAnnouncement">
          <el-switch v-model="formData.canSetAnnouncement" active-text="有" inactive-text="无" />
        </el-form-item>
        <el-form-item label="自主申请保证金退还安全期限" prop="depositRefundSafeDays">
          <el-input v-model="formData.depositRefundSafeDays" placeholder="请输入安全期限">
            <template #append>
              天
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="限制指定接单商品编号列表" prop="restrictedProductIds">
          <el-input
            :model-value="selectedProductNamesDisplay"
            placeholder="点击选择商品"
            readonly
            @click="openProductSelector"
          >
            <template #suffix>
              <el-button link type="danger" @click.stop="clearSelectedProducts">
                清空
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="限制每日接单缴费金额" prop="dailyOrderFeeLimit">
          <el-input v-model="formData.dailyOrderFeeLimit" placeholder="请输入每日缴费金额上限">
            <template #append>
              元
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="限制同时可接单数" prop="simultaneousOrderLimit">
          <el-input v-model="formData.simultaneousOrderLimit" placeholder="请输入数量，0 表示不限制">
            <template #append>
              单
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="接单验证类型" prop="orderVerificationType">
          <el-switch
            v-model="formData.orderVerificationType"
            :active-value="1"
            :inactive-value="0"
            active-text="需要验证"
            inactive-text="无需验证"
          />
        </el-form-item>
        <el-form-item label="可自主取消接单订单" prop="canCancelOrder">
          <el-switch
            v-model="formData.canCancelOrder"
            :active-value="1"
            :inactive-value="0"
            active-text="有"
            inactive-text="无"
          />
        </el-form-item>
        <el-form-item label="可自主退款接单订单" prop="canRefundOrder">
          <el-switch
            v-model="formData.canRefundOrder"
            :active-value="1"
            :inactive-value="0"
            active-text="有"
            inactive-text="无"
          />
        </el-form-item>
        <el-form-item label="限制升级人数名额" prop="upgradeSlotLimit">
          <el-input v-model="formData.upgradeSlotLimit" placeholder="请输入名额，0 表示不限制" />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button type="primary" :disabled="formLoading" @click="submitForm">
        确 定
      </el-button>
      <el-button @click="dialogVisible = false">
        取 消
      </el-button>
    </template>
  </Dialog>
  <!-- 商品选择弹窗 -->
  <el-dialog v-model="productSelectorVisible" title="选择商品" width="900px" align-center>
    <div class="mb-3 flex items-center gap-2">
      <el-input
        v-model="productQuery.productTitle"
        placeholder="请输入商品名称"
        class="!w-[260px]"
        clearable
      />
      <el-button type="primary" @click="productHandleQuery">
        <Icon icon="ep:search" class="mr-[5px]" /> 搜索
      </el-button>
      <el-button @click="productResetQuery">
        <Icon icon="ep:refresh" class="mr-[5px]" /> 重置
      </el-button>
    </div>
    <el-table
      ref="productTableRef"
      v-loading="productLoading"
      row-key="id"
      :data="productList"
      :stripe="true"
      :show-overflow-tooltip="true"
      @selection-change="handleProductSelectionChange"
    >
      <el-table-column type="selection" width="55" reserve-selection />
      <el-table-column label="ID" prop="id" width="90" align="center" />
      <el-table-column label="商品标题" prop="productTitle" min-width="220" />
      <el-table-column label="价格" prop="productPrice" width="120" align="center" />
      <el-table-column label="分类" prop="categoryName" min-width="160" />
      <el-table-column label="上下架" prop="saleStatus" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.saleStatus ? 'success' : 'info'">
            {{ scope.row.saleStatus ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
    <div class="mt-3">
      <Pagination
        v-model:page="productQuery.pageNo"
        v-model:limit="productQuery.pageSize"
        :total="productTotal"
        @pagination="getProductList"
      />
    </div>
    <template #footer>
      <el-button type="primary" @click="confirmProductSelection">
        确 定
      </el-button>
      <el-button @click="productSelectorVisible = false">
        取 消
      </el-button>
    </template>
  </el-dialog>
</template>

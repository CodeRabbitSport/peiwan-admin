<script setup lang="ts">
import { Delete as ElIconDelete, Plus as ElIconPlus } from '@element-plus/icons-vue'

import type { LevelConfig } from '@/api/gamer/levelconfig'
import { LevelConfigApi } from '@/api/gamer/levelconfig'
import type { PrizeGroup } from '@/api/gamer/prizegroup'
import { PrizeGroupApi } from '@/api/gamer/prizegroup'
import type { Product } from '@/api/gamer/product'
import { ProductApi } from '@/api/gamer/product'
import { ProductCategoryApi } from '@/api/gamer/productcategory'
import { ProductTypeApi } from '@/api/gamer/producttype'
import { fenToYuan, yuanToFen } from '@/utils'

/** 商品 表单 */
defineOptions({ name: 'ProductForm' })

// 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success'])
const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const prizeGroupOptions = ref<PrizeGroup[]>([]) // 奖品组选项
const levelOptions = ref<LevelConfig[]>([]) // 等级选项（来自 LevelConfig 接口）
const linkedProduct = ref<Product & {
  categoryName?: string
  typeName?: string
}>()
const cascaderProps = {
  lazy: true,
  lazyLoad: (node, resolve) => {
    const { level } = node
    if (level === 0) {
      ProductCategoryApi.getProductCategoryPage().then((res) => {
        const data = res.list.map(item => ({
          value: item.id,
          label: item.categoryName,
        }))
        resolve(data)
      })
    }
    else if (level === 1) {
      ProductTypeApi.getProductTypePage({ categoryId: node.value, pageSize: 100 }).then((res) => {
        const data = res.list.map(item => ({
          value: item.id,
          label: item.typeName,
          leaf: true,
        }))
        resolve(data)
      })
    }
  },
}
const formData = ref<any>({
  id: undefined,
  productTitle: undefined,
  productDesc: undefined,
  productStock: undefined,
  productPrice: undefined,
  productLevel: undefined,
  productDetailCover: undefined,
  productMainCover: undefined,
  productContent: undefined,
  productPrizeGroupId: undefined,
  categoryId: undefined as number | undefined,
  typeId: undefined as number | undefined,
  categoryTypeValue: [] as number[], // 级联选择器的值
  scoreThreshold: undefined,
  accompanyTimeoutCancel: undefined,
  accompanySetting: undefined,
  maxBuyNum: undefined,
  commissionRate: undefined,
  refundSupported: undefined,
  virtualSales: undefined,
  virtualPrice: undefined,
  estimateAccompanyTime: undefined,
  saleStatus: true,
  isShow: true,
  isWebShow: true,
  // 接单大区（从分类移入商品：保持字段与交互不变）
  orderReceivingStatus: true,
  orderReceivingRegion: '',
  // 折扣配置
  discountConfigList: undefined,
  linkedProductId: undefined,
  syncLinkedProduct: false,
  syncProductId: undefined,
  linkedProductPrice: undefined,
  createLinkedProduct: false,
  linkedCategoryId: undefined,
  linkedTypeId: undefined,
  linkedCategoryTypeValue: [] as number[],
})

type DisplaySettingKey = 'saleStatus' | 'isShow' | 'isWebShow'

const displaySettings: Array<{
  key: DisplaySettingKey
  label: string
  activeText: string
  inactiveText: string
}> = [
  { key: 'saleStatus', label: '上下架', activeText: '上架', inactiveText: '下架' },
  { key: 'isShow', label: '小程序端显示', activeText: '显示', inactiveText: '隐藏' },
  { key: 'isWebShow', label: '网页端显示', activeText: '显示', inactiveText: '隐藏' },
]

function updateDisplaySetting(key: DisplaySettingKey, value: boolean | string | number) {
  formData.value[key] = Boolean(value)
}

const formRules = reactive({
  productTitle: [{ required: true, message: '商品标题不能为空', trigger: 'blur' }],
  categoryTypeValue: [{ required: true, message: '商品分类不能为空', trigger: 'blur' }],
  productPrice: [{ required: true, message: '商品价格不能为空', trigger: 'blur' }],
  commissionRate: [{ required: true, message: '抽成比例(陪玩到手比例)不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

// 接单大区动态表单字段（从分类移入：保持字段与交互不变）
const orderReceivingRegionFields = ref([{ region: '', price: 0 }])

// 折扣配置动态表单字段
const discountFields = ref([{ amount: 0, discount: 0, discountType: 1 }])

// 监听分类选择变化，加载该分类的接单大区
async function handleCategoryChange(value: number[]) {
  if (value && value.length > 0) {
    const categoryId = value[0]
    try {
      const categoryData = await ProductCategoryApi.getProductCategory(categoryId)
      if (categoryData.orderReceivingRegion) {
        // 从分类的接单大区（逗号分隔字符串）中获取大区列表
        const regions = String(categoryData.orderReceivingRegion)
          .split(',')
          .map(r => r.trim())
          .filter(r => r !== '')

        if (regions.length > 0) {
          // 填充到表单字段，保持对象格式，price 默认为 0
          orderReceivingRegionFields.value = regions.map(region => ({
            region,
            price: 0,
          }))
        }
        else {
          // 分类的接单大区为空，清空表单字段
          orderReceivingRegionFields.value = [{ region: '', price: 0 }]
        }
      }
      else {
        // 分类没有接单大区数据，清空表单字段
        orderReceivingRegionFields.value = [{ region: '', price: 0 }]
      }
      updateOrderReceivingRegionData()
    }
    catch (error) {
      console.error('获取分类接单大区失败:', error)
    }
  }
}

function handleLinkedCategoryChange(value: number[]) {
  formData.value.linkedCategoryId = value?.[0]
  formData.value.linkedTypeId = value?.[1]
}

function handleCreateLinkedChange(value: boolean | string | number) {
  if (!value) {
    formData.value.linkedCategoryTypeValue = []
    formData.value.linkedCategoryId = undefined
    formData.value.linkedTypeId = undefined
    formData.value.linkedProductPrice = undefined
  }
}

async function handleSyncChange(value: boolean | string | number) {
  const sync = Boolean(value)
  if (!sync) {
    formData.value.syncProductId = undefined
    return
  }
  const target = linkedProduct.value
  if (!target
    || target.id !== formData.value.linkedProductId
    || target.linkedProductId !== formData.value.id) {
    formData.value.syncLinkedProduct = false
    message.error('关联商品不存在或关联关系已失效')
    return
  }
  try {
    await message.confirm(
      `确认同步编辑关联商品 #${target.id}「${target.productTitle || '-'}」（分类 ${target.categoryName || '-'} / 类型 ${target.typeName || '-'}）？`,
      '确认关联商品',
    )
    formData.value.syncProductId = target.id
  }
  catch {
    formData.value.syncLinkedProduct = false
  }
}

/** 打开弹窗 */
async function open(type: string, id?: number) {
  dialogTitle.value = t(`action.${type}`)
  formType.value = type
  resetForm()
  // 加载奖品组选项
  await loadPrizeGroupOptions()
  dialogVisible.value = true
  await loadLevelOptions()

  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = {
        ...formData.value,
        ...await ProductApi.getProduct(id),
        syncLinkedProduct: false,
        syncProductId: undefined,
        linkedProductPrice: undefined,
        createLinkedProduct: false,
        linkedCategoryTypeValue: [],
      }
      // 如果有分类ID和类型ID，设置级联选择器的值
      if (formData.value.categoryId && formData.value.typeId) {
        formData.value.categoryTypeValue = [formData.value.categoryId, formData.value.typeId]
      }
      if (!formData.value.productContent) {
        formData.value.productContent = undefined
      }

      if (formData.value.productPrice != null) {
        formData.value.productPrice = Number(fenToYuan(formData.value.productPrice))
      }
      if (formData.value.virtualPrice != null) {
        formData.value.virtualPrice = Number(fenToYuan(formData.value.virtualPrice))
      }
      // 初始化接单大区字段
      initOrderReceivingRegionFields()
      // 初始化折扣配置字段
      initDiscountFields()
      // 编辑时将等级字符串解析为数组，便于多选
      if (formData.value.productLevel && typeof formData.value.productLevel === 'string') {
        const arr = (formData.value.productLevel as unknown as string)
          .split(',')
          .map(v => Number(v))
          .filter(v => !Number.isNaN(v))
        formData.value.productLevel = arr as any
      }
      if (formData.value.linkedProductId) {
        try {
          const target = await ProductApi.getProduct(formData.value.linkedProductId)
          if (!target || target.linkedProductId !== formData.value.id) {
            throw new Error('关联关系不是双向有效关联')
          }
          const [category, productType] = await Promise.all([
            ProductCategoryApi.getProductCategory(target.categoryId).catch(() => undefined),
            ProductTypeApi.getProductType(target.typeId).catch(() => undefined),
          ])
          linkedProduct.value = {
            ...target,
            categoryName: category?.categoryName,
            typeName: productType?.typeName,
          }
          formData.value.linkedProductPrice = Number(fenToYuan(target.productPrice))
        }
        catch {
          linkedProduct.value = undefined
          message.warning('关联商品不存在或关联关系已失效，请先修复关联关系')
        }
      }
      // 确保有默认的接单大区字段行
      if (!orderReceivingRegionFields.value || orderReceivingRegionFields.value.length === 0) {
        orderReceivingRegionFields.value = [{ region: '', price: 0 }]
      }
      // 确保有默认的折扣配置字段行
      if (!discountFields.value || discountFields.value.length === 0) {
        discountFields.value = [{ amount: 0, discount: 0, discountType: 1 }]
      }
    }
    finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 定义 success 事件，用于操作成功后的回调
async function submitForm() {
  await formRef.value.validate()
  if (formData.value.categoryTypeValue?.length !== 2) {
    message.warning('请选择完整的商品分类和类型')
    return
  }
  formData.value.categoryId = formData.value.categoryTypeValue[0]
  formData.value.typeId = formData.value.categoryTypeValue[1]

  if (formType.value === 'create' && formData.value.createLinkedProduct) {
    if (formData.value.linkedCategoryTypeValue?.length !== 2) {
      message.warning('请选择完整的关联商品分类和类型')
      return
    }
    handleLinkedCategoryChange(formData.value.linkedCategoryTypeValue)
    if (formData.value.linkedProductPrice == null) {
      message.warning('请输入关联商品价格')
      return
    }
  }

  if (formType.value === 'update' && formData.value.syncLinkedProduct) {
    if (!linkedProduct.value
      || linkedProduct.value.id !== formData.value.linkedProductId
      || linkedProduct.value.linkedProductId !== formData.value.id) {
      message.error('关联商品不存在或关联关系已失效')
      return
    }
    if (formData.value.linkedProductPrice == null) {
      message.warning('请输入关联商品价格')
      return
    }
    formData.value.syncProductId = linkedProduct.value.id
  }

  updateOrderReceivingRegionData()
  updateDiscountData()
  if (formData.value.orderReceivingStatus === true) {
    const regions = orderReceivingRegionFields.value
      .map(it => (it.region || '').trim())
      .filter((name: string) => name !== '')
    const duplicateRegion = regions.find((name, index) => regions.indexOf(name) !== index)
    if (duplicateRegion) {
      message.error(`接单大区存在重复的大区名称：${duplicateRegion}`)
      return
    }
  }

  const { categoryTypeValue, linkedCategoryTypeValue, ...submitData } = formData.value
  const data = {
    ...submitData,
    productLevel: Array.isArray(submitData.productLevel)
      ? submitData.productLevel.join(',')
      : submitData.productLevel,
    productPrice: yuanToFen(submitData.productPrice ?? 0),
    virtualPrice: yuanToFen(submitData.virtualPrice ?? 0),
    linkedProductPrice: submitData.linkedProductPrice == null
      ? undefined
      : yuanToFen(submitData.linkedProductPrice),
  } as Product

  formLoading.value = true
  try {
    if (formType.value === 'create') {
      await ProductApi.createProduct(data)
      message.success(t('common.createSuccess'))
    }
    else {
      await ProductApi.updateProduct(data)
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

// 加载奖品组数据
async function loadPrizeGroupOptions() {
  try {
    const data = await PrizeGroupApi.getPrizeGroupPage()
    prizeGroupOptions.value = data.list || []
  }
  catch (error) {
    console.error('加载奖品组失败:', error)
  }
}

// 加载等级选项（来自 LevelConfig 列表接口）
async function loadLevelOptions() {
  try {
    const data = await LevelConfigApi.getLevelConfigPage({
      categoryType: 2,
      pageSize: 100,
    })
    levelOptions.value = data.list || []
  }
  catch (error) {
    console.error('加载等级选项失败:', error)
  }
}

/** 重置表单 */
function resetForm() {
  formData.value = {
    id: undefined,
    productTitle: undefined,
    productDesc: undefined,
    productStock: undefined,
    productPrice: undefined,
    productLevel: undefined,
    productDetailCover: undefined,
    productMainCover: undefined,
    productContent: undefined,
    productPrizeGroupId: undefined,
    categoryId: undefined,
    typeId: undefined,
    categoryTypeValue: [] as number[], // 级联选择器的值
    scoreThreshold: undefined,
    accompanyTimeoutCancel: undefined,
    accompanySetting: undefined,
    maxBuyNum: undefined,
    commissionRate: undefined,
    refundSupported: undefined,
    virtualSales: undefined,
    virtualPrice: undefined,
    estimateAccompanyTime: undefined,
    saleStatus: true,
    isShow: true,
    isWebShow: true,
    // 接单大区（从分类移入商品：保持字段与交互不变）
    orderReceivingStatus: true,
    orderReceivingRegion: '',
    // 折扣配置
    discountConfigList: undefined,
    linkedProductId: undefined,
    syncLinkedProduct: false,
    syncProductId: undefined,
    linkedProductPrice: undefined,
    createLinkedProduct: false,
    linkedCategoryId: undefined,
    linkedTypeId: undefined,
    linkedCategoryTypeValue: [] as number[],
  }
  linkedProduct.value = undefined
  orderReceivingRegionFields.value = [{ region: '', price: 0 }]
  discountFields.value = [{ amount: 0, discount: 0, discountType: 1 }]
  formRef.value?.resetFields()
}

// function addOrderReceivingRegionField() {
//   orderReceivingRegionFields.value.push({ region: '', price: 0 })
//   updateOrderReceivingRegionData()
// }

// function removeOrderReceivingRegionField(index: number) {
//   if (orderReceivingRegionFields.value.length > 1) {
//     orderReceivingRegionFields.value.splice(index, 1)
//     updateOrderReceivingRegionData()
//   }
// }

function updateOrderReceivingRegionData() {
  const filtered = orderReceivingRegionFields.value
    .map(it => ({
      region: (it.region || '').trim(),
      price: Math.round(Number(it.price ?? 0) * 100), // 元转换为分
    }))
    .filter(it => it.region !== '' || it.price > 0)
  formData.value.orderReceivingRegion = filtered.length > 0 ? JSON.stringify(filtered) : ''
}

function initOrderReceivingRegionFields() {
  const value = formData.value.orderReceivingRegion as unknown as string
  if (value) {
    try {
      const parsed = JSON.parse(value)
      const parsedList = Array.isArray(parsed) ? parsed : []
      const mapped = parsedList.map((it: any) => ({
        region: it?.region ?? '',
        price: Number(it?.price ?? 0) / 100, // 分转换为元
      }))
      if (mapped.length > 0) {
        orderReceivingRegionFields.value = mapped
        return
      }
    }
    catch {
      // ignore json parse error
    }
  }
  orderReceivingRegionFields.value = [{ region: '', price: 0 }]
}

// 折扣配置相关函数
function addDiscountField() {
  discountFields.value.push({ amount: 0, discount: 0, discountType: 1 })
  updateDiscountData()
}

function removeDiscountField(index: number) {
  if (discountFields.value.length > 1) {
    discountFields.value.splice(index, 1)
    updateDiscountData()
  }
}

function updateDiscountData() {
  const filtered = discountFields.value
    .map(it => ({
      amount: Number(it.amount ?? 0),
      discount: Number(it.discount ?? 0),
      discountType: Number(it.discountType ?? 1),
    }))

  formData.value.discountConfigList = filtered.length > 0 ? JSON.stringify(filtered) : undefined
}

function initDiscountFields() {
  const value = formData.value.discountConfigList
  if (value && value !== 'null') {
    try {
      const parsed = JSON.parse(value)
      const parsedList = Array.isArray(parsed) ? parsed : []
      const mapped = parsedList.map((it: any) => ({
        amount: Number(it?.amount ?? 0),
        discount: Number(it?.discount ?? 0),
        discountType: Number(it?.discountType ?? 1),
      }))
      if (mapped.length > 0) {
        discountFields.value = mapped
        return
      }
    }
    catch {
      // ignore json parse error
    }
  }
  discountFields.value = [{ amount: 0, discount: 0, discountType: 1 }]
}
</script>

<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" align-center width="80vw">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="max-h-[70vh] overflow-y-scroll"
    >
      <!-- 基本商品信息 -->
      <el-divider content-position="left">
        基本信息
      </el-divider>
      <el-row>
        <el-col :xs="24" :sm="8">
          <el-form-item label="商品标题" prop="productTitle">
            <el-input v-model="formData.productTitle" placeholder="请输入商品标题" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-form-item label="商品价格" prop="productPrice">
            <el-input-number
              v-model="formData.productPrice" placeholder="请输入商品价格" :min="0" :precision="2"
              class="!w-full"
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-form-item label="商品库存" prop="productStock">
            <el-input-number v-model="formData.productStock" placeholder="请输入商品库存" :min="-1" class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-form-item label="商品排序" prop="sortOrder">
            <el-input-number v-model="formData.sortOrder" placeholder="请输入商品排序" :min="0" class="!w-full" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 分类配置 -->
      <el-divider content-position="left">
        分类配置
      </el-divider>
      <el-form-item label="商品分类类型" prop="categoryTypeValue" label-width="120">
        <el-cascader
          v-model="formData.categoryTypeValue"
          :props="cascaderProps"
          placeholder="请选择商品分类和类型"
          clearable
          filterable
          class="!w-full"
          @change="handleCategoryChange"
        />
      </el-form-item>

      <template v-if="formType === 'create'">
        <el-divider content-position="left">
          关联新增
        </el-divider>
        <el-form-item label="同时创建关联商品" label-width="140">
          <el-switch v-model="formData.createLinkedProduct" @change="handleCreateLinkedChange" />
        </el-form-item>
        <el-row v-if="formData.createLinkedProduct" :gutter="16">
          <el-col :xs="24" :sm="16">
            <el-form-item label="关联商品分类" prop="linkedCategoryTypeValue" label-width="120">
              <el-cascader
                v-model="formData.linkedCategoryTypeValue"
                :props="cascaderProps"
                placeholder="请选择关联商品分类和类型"
                clearable
                filterable
                class="!w-full"
                @change="handleLinkedCategoryChange"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-form-item label="关联商品价格" label-width="120">
              <el-input-number
                v-model="formData.linkedProductPrice"
                :min="0"
                :precision="2"
                placeholder="请输入关联商品价格"
                class="!w-full"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </template>

      <template v-if="formType === 'update' && formData.linkedProductId">
        <el-divider content-position="left">
          关联编辑
        </el-divider>
        <el-form-item label="关联商品">
          <el-tag v-if="linkedProduct" type="info">
            #{{ linkedProduct.id }} {{ linkedProduct.productTitle || '-' }}
            （分类 {{ linkedProduct.categoryName || '-' }} / 类型 {{ linkedProduct.typeName || '-' }}）
          </el-tag>
          <el-tag v-else type="danger">
            #{{ formData.linkedProductId }} 关联已失效
          </el-tag>
        </el-form-item>
        <el-form-item label="同步编辑">
          <el-switch
            v-model="formData.syncLinkedProduct"
            :disabled="!linkedProduct"
            @change="handleSyncChange"
          />
        </el-form-item>
        <el-form-item v-if="formData.syncLinkedProduct" label="关联商品价格" label-width="120">
          <el-input-number
            v-model="formData.linkedProductPrice"
            :min="0"
            :precision="2"
            placeholder="请输入关联商品价格"
            class="!w-full"
          />
        </el-form-item>
      </template>

      <!-- 媒体内容 -->
      <el-divider content-position="left">
        媒体内容
      </el-divider>
      <el-row>
        <el-col :xs="24" :sm="12">
          <el-form-item label="详情图" prop="productDetailCover">
            <UploadImg v-model="formData.productDetailCover" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="主页图" prop="productMainCover">
            <UploadImg v-model="formData.productMainCover" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="商品内容" prop="productContent">
        <Editor v-model="formData.productContent" height="150px" width="100%" />
      </el-form-item>

      <el-form-item label="描述" prop="productDesc">
        <el-input v-model="formData.productDesc" type="textarea" placeholder="请输入描述" />
      </el-form-item>

      <!-- 业务配置 -->
      <el-divider content-position="left">
        业务配置
      </el-divider>
      <el-row>
        <el-col :xs="24" :sm="12">
          <el-form-item label="商品等级" prop="productLevel">
            <el-select
              v-model="formData.productLevel"
              placeholder="请选择商品等级"
              clearable
              multiple
              class="!w-full"
            >
              <el-option
                v-for="lvl in levelOptions"
                :key="lvl.levelNumber"
                :label="lvl.levelName ?? (`等级 ${lvl.id}`)"
                :value="lvl.levelNumber!"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="绑定奖品组" prop="productPrizeGroupId">
            <el-select
              v-model="formData.productPrizeGroupId"
              placeholder="请选择奖品组"
              clearable
              class="!w-full"
            >
              <el-option
                v-for="prize in prizeGroupOptions"
                :key="prize.id"
                :label="prize.groupTitle"
                :value="prize.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 接单大区（从分类移入商品：保持字段与交互不变） -->
      <!-- <el-form-item label="接单大区" prop="orderReceivingStatus">
        <el-radio-group v-model="formData.orderReceivingStatus">
          <el-radio :value="false">
            不启用
          </el-radio>
          <el-radio :value="true">
            启用
          </el-radio>
        </el-radio-group>
      </el-form-item> -->
      <el-form-item label="接单大区" prop="orderReceivingRegion">
        <div class="dynamic-form w-full">
          <div v-for="(item, index) in orderReceivingRegionFields" :key="index" class="mb-2">
            <div class="flex gap-x-2">
              <div :span="2">
                大区名称
              </div>
              <div :span="3">
                <el-input v-model="item.region" placeholder="请输入大区名称" disabled readonly />
              </div>
              <div :span="2" class="mx-2">
                涨幅价格
              </div>
              <div :span="2">
                <el-input-number
                  v-model="item.price" :min="0" :step="0.01" :precision="2"
                  @change="updateOrderReceivingRegionData"
                />
              </div>
              <!-- <div :span="1">
                <el-button
                  type="danger"
                  :icon="ElIconDelete"
                  size="small"
                  :disabled="orderReceivingRegionFields.length <= 1"
                  @click="removeOrderReceivingRegionField(index)"
                />
              </div> -->
            </div>
          </div>
          <!-- <el-button type="primary" :icon="ElIconPlus" size="small" class="mt-2 !w-[400px]" @click="addOrderReceivingRegionField">
            添加大区
          </el-button> -->
        </div>
      </el-form-item>

      <el-form-item label="展示控制">
        <el-table :data="displaySettings" border size="small" class="w-full">
          <el-table-column label="设置项" prop="label" min-width="140" />
          <el-table-column label="状态" align="center" width="160">
            <template #default="scope">
              <el-switch
                :model-value="formData[scope.row.key]"
                :active-text="scope.row.activeText"
                :inactive-text="scope.row.inactiveText"
                inline-prompt
                @change="updateDisplaySetting(scope.row.key, $event)"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <!-- 业务规则 -->
      <el-divider content-position="left">
        业务规则
      </el-divider>
      <el-row>
        <el-col :xs="24" :sm="12">
          <el-form-item label="派单超时取消" prop="accompanyTimeoutCancel">
            <el-input-number
              v-model="formData.accompanyTimeoutCancel" placeholder="请输入派单超时自动取消(分钟),-1代表无限制" :min="-1"
              class="!w-full"
            >
              <template #suffix>
                分钟
              </template>
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="陪陪分配置" prop="accompanySetting">
            <el-input-number v-model="formData.accompanySetting" placeholder="请输入陪陪分配置" :min="0" class="!w-full" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :xs="24" :sm="12">
          <el-form-item label="接单分数门槛" prop="scoreThreshold">
            <el-input-number v-model="formData.scoreThreshold" placeholder="请输入接单分数门槛" :min="0" class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="最高购买数量" prop="maxBuyNum">
            <el-input-number v-model="formData.maxBuyNum" placeholder="请输入最高购买数量" :min="1" class="!w-full" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :xs="24" :sm="12">
          <el-form-item label="打手到手比例" prop="commissionRate" label-width="120">
            <el-input-number
              v-model="formData.commissionRate" placeholder="请输入抽成比例" :min="0" :max="100" :precision="2"
              class="!w-full"
            >
              <template #suffix>
                %
              </template>
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="是否支持退款" prop="refundSupported">
            <el-radio-group v-model="formData.refundSupported">
              <el-radio :value="true">
                是
              </el-radio>
              <el-radio :value="false">
                否
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 营销配置 -->
      <el-divider content-position="left">
        营销配置
      </el-divider>
      <el-row>
        <el-col :xs="24" :sm="12">
          <el-form-item label="虚拟销量" prop="virtualSales">
            <el-input-number v-model="formData.virtualSales" placeholder="请输入虚拟销量" :min="0" class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="虚拟价格" prop="virtualPrice">
            <el-input-number
              v-model="formData.virtualPrice" placeholder="请输入虚拟价格" :min="0" :precision="2"
              class="!w-full"
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="是否开启产品弹窗" label-width="150px" prop="popUpEnabled">
            <el-radio-group v-model="formData.popUpEnabled">
              <el-radio :value="true">
                开启
              </el-radio>
              <el-radio :value="false">
                关闭
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-form-item label="弹窗内容" prop="popUp">
          <Editor v-model="formData.popUp" height="150px" width="100%" />
        </el-form-item>
        <el-col :xs="24" :sm="24">
          <el-form-item label="是否开启产品折扣" label-width="150px" prop="discountEnabled">
            <el-radio-group v-model="formData.discountEnabled">
              <el-radio :value="true">
                开启
              </el-radio>
              <el-radio :value="false">
                关闭
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-form-item label="折扣配置" prop="discountConfigList">
          <div class="dynamic-form w-full">
            <div v-for="(item, index) in discountFields" :key="index" class="mb-2">
              <div class="flex gap-x-2">
                <div :span="2">
                  订单数量
                </div>
                <div :span="3">
                  <el-input-number
                    v-model="item.amount"
                    placeholder="请输入订单数量"
                    :min="0"
                    class="!w-full"
                    @change="updateDiscountData"
                  />
                </div>
                <div :span="2" class="mx-2">
                  折扣类型
                </div>
                <div :span="3">
                  <el-radio-group v-model="item.discountType" @change="updateDiscountData">
                    <el-radio :value="1">
                      折扣
                    </el-radio>
                    <el-radio :value="2">
                      送单
                    </el-radio>
                  </el-radio-group>
                </div>
                <div :span="2" class="mx-2">
                  折扣/送单值
                </div>
                <div :span="2">
                  <el-input-number
                    v-model="item.discount" :min="0" :max="100" :step="0.01" :precision="2"
                    class="!w-full" @change="updateDiscountData"
                  >
                    <template #suffix>
                      %
                    </template>
                  </el-input-number>
                </div>
                <div :span="1">
                  <el-button
                    type="danger" :icon="ElIconDelete" size="small"
                    :disabled="discountFields.length <= 1"
                    @click="removeDiscountField(index)"
                  />
                </div>
              </div>
            </div>
            <el-button
              type="primary" :icon="ElIconPlus" size="small" class="mt-2 !w-[400px]"
              @click="addDiscountField"
            >
              添加折扣
            </el-button>
          </div>
        </el-form-item>
      </el-row>
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

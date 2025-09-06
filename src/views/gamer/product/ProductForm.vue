<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" align-center width="80vw">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
      class="max-h-[70vh] overflow-y-scroll">
      <!-- 基本商品信息 -->
      <el-divider content-position="left">基本信息</el-divider>
      <el-row>
        <el-col :xs="24" :sm="8">
          <el-form-item label="商品标题" prop="productTitle">
            <el-input v-model="formData.productTitle" placeholder="请输入商品标题" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-form-item label="商品价格" prop="productPrice">
            <el-input-number v-model="formData.productPrice" placeholder="请输入商品价格" :min="0" :precision="2"
              class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-form-item label="商品库存" prop="productStock">
            <el-input-number v-model="formData.productStock" placeholder="请输入商品库存" :min="-1" class="!w-full" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 分类配置 -->
      <el-divider content-position="left">分类配置</el-divider>
      <el-form-item label="商品分类类型" prop="categoryTypeValue">
        <el-cascader
          v-model="formData.categoryTypeValue"
          :options="cascaderOptions"
          :props="cascaderProps"
          placeholder="请选择商品分类和类型"
          clearable
          filterable
          @change="handleCascaderChange"
          class="!w-full" />
      </el-form-item>

      <!-- 媒体内容 -->
      <el-divider content-position="left">媒体内容</el-divider>
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
        <el-input type="textarea" v-model="formData.productDesc" placeholder="请输入描述" />
      </el-form-item>

      <!-- 业务配置 -->
      <el-divider content-position="left">业务配置</el-divider>
      <el-row>
        <el-col :xs="24" :sm="12">
          <el-form-item label="商品等级" prop="productLevel">
            <el-select
              v-model="formData.productLevel"
              placeholder="请选择商品等级"
              clearable
              multiple
              class="!w-full">
              <el-option
                v-for="lvl in levelOptions"
                :key="lvl.levelNumber"
                :label="lvl.levelName ?? ('等级 ' + lvl.id)"
                :value="lvl.levelNumber!" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="绑定奖品组" prop="productPrizeGroupId">
            <el-select
              v-model="formData.productPrizeGroupId"
              placeholder="请选择奖品组"
              clearable
              class="!w-full">
              <el-option
                v-for="prize in prizeGroupOptions"
                :key="prize.id"
                :label="prize.groupTitle"
                :value="prize.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :xs="24" :sm="12">
          <el-form-item label="预估陪玩时长" prop="estimateAccompanyTime">
            <el-input-number v-model="formData.estimateAccompanyTime" placeholder="请输入预估陪玩时长(分钟)" :min="1"
              class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="上下架状态" prop="saleStatus">
            <el-radio-group v-model="formData.saleStatus">
              <el-radio :value="true">上架</el-radio>
              <el-radio :value="false">下架</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 业务规则 -->
      <el-divider content-position="left">业务规则</el-divider>
      <el-row>
        <el-col :xs="24" :sm="12">
          <el-form-item label="派单超时取消" prop="accompanyTimeoutCancel">
            <el-input-number v-model="formData.accompanyTimeoutCancel" placeholder="请输入派单超时自动取消(分钟),-1代表无限制" :min="-1"
              class="!w-full">
              <template #suffix>分钟</template>
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="陪陪分配置" prop="accompanySettting">
            <el-input-number v-model="formData.accompanySettting" placeholder="请输入陪陪分配置" :min="0" class="!w-full" />
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
          <el-form-item label="抽成比例" prop="commissionRate">
            <el-input-number v-model="formData.commissionRate" placeholder="请输入抽成比例" :min="0" :max="100" :precision="2"
              class="!w-full">
              <template #suffix>
                %
              </template>
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="是否支持退款" prop="refundSupported">
            <el-radio-group v-model="formData.refundSupported">
              <el-radio :value="true">是</el-radio>
              <el-radio :value="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 营销配置 -->
      <el-divider content-position="left">营销配置</el-divider>
      <el-row>
        <el-col :xs="24" :sm="12">
          <el-form-item label="虚拟销量" prop="virtualSales">
            <el-input-number v-model="formData.virtualSales" placeholder="请输入虚拟销量" :min="0" class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="虚拟价格" prop="virtualPrice">
            <el-input-number v-model="formData.virtualPrice" placeholder="请输入虚拟价格" :min="0" :precision="2"
              class="!w-full" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { ProductApi, Product } from '@/api/gamer/product'
import { ProductCategoryApi, ProductCategory } from '@/api/gamer/productcategory'
import { ProductTypeApi, ProductType } from '@/api/gamer/producttype'
import { PrizeGroupApi, PrizeGroup } from '@/api/gamer/prizegroup'
import { LevelConfigApi, LevelConfig } from '@/api/gamer/levelconfig'

// 定义级联选择器的选项类型
interface CascaderOption {
  value: number
  label: string
  children?: CascaderOption[]
}

/** 商品 表单 */
defineOptions({ name: 'ProductForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const categoryOptions = ref<ProductCategory[]>([]) // 分类选项
const cascaderOptions = ref<CascaderOption[]>([]) // 级联选择器选项
const prizeGroupOptions = ref<PrizeGroup[]>([]) // 奖品组选项
const levelOptions = ref<LevelConfig[]>([]) // 等级选项（来自 LevelConfig 接口）
const cascaderProps = {
  value: 'value',
  label: 'label',
  children: 'children',
  expandTrigger: 'hover' as const
}
const formData = ref({
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
  accompanySettting: undefined,
  maxBuyNum: undefined,
  commissionRate: undefined,
  refundSupported: undefined,
  virtualSales: undefined,
  virtualPrice: undefined,
  estimateAccompanyTime: undefined,
  saleStatus: undefined
})
const formRules = reactive({
  productTitle: [{ required: true, message: '商品标题不能为空', trigger: 'blur' }],
  commissionRate: [{ required: true, message: '抽成比例(陪玩到手比例)不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 构建级联选择器选项
  await buildCascaderOptions()
  // 加载奖品组选项
  await loadPrizeGroupOptions()
  // 加载等级选项

  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await ProductApi.getProduct(id)
      // 如果有分类ID和类型ID，设置级联选择器的值
      if (formData.value.categoryId && formData.value.typeId) {
        formData.value.categoryTypeValue = [formData.value.categoryId, formData.value.typeId]
      }
      if (!formData.value.productContent) {
        formData.value.productContent = undefined
      }
      // 编辑时将等级字符串解析为数组，便于多选
      if (formData.value.productLevel && typeof formData.value.productLevel === 'string') {
        const arr = (formData.value.productLevel as unknown as string)
          .split(',')
          .map((v) => Number(v))
          .filter((v) => !Number.isNaN(v))
        // @ts-ignore
        formData.value.productLevel = arr as any
      }
      await loadLevelOptions()

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
    // 确保级联选择器的值已经同步到categoryId和typeId
    if (formData.value.categoryTypeValue && formData.value.categoryTypeValue.length === 2) {
      formData.value.categoryId = formData.value.categoryTypeValue[0]
      formData.value.typeId = formData.value.categoryTypeValue[1]
    }
    if (formData.value.productLevel && Array.isArray(formData.value.productLevel)) {
      formData.value.productLevel = (formData.value.productLevel as any).join(',')
    }
    // 创建提交数据，排除级联选择器字段
    const { categoryTypeValue, ...submitData } = formData.value
    const data = submitData as unknown as Product

    if (formType.value === 'create') {
      await ProductApi.createProduct(data)
      message.success(t('common.createSuccess'))
    } else {
      await ProductApi.updateProduct(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

// 构建级联选择器数据
const buildCascaderOptions = async () => {
  try {
    // 加载所有分类
    const categoryData = await ProductCategoryApi.getProductCategoryPage()
    const categories = categoryData.list

    // 为每个分类构建级联结构
    const cascaderData = await Promise.all(categories.map(async (category) => {
      try {
        const typeData = await ProductTypeApi.getProductTypePage({ categoryId: category.id })
        return {
          value: category.id,
          label: category.categoryName,
          children: typeData.list.map((type: ProductType) => ({
            value: type.id,
            label: type.typeName
          }))
        }
      } catch (error) {
        console.error(`加载分类 ${category.id} 的类型失败:`, error)
        return {
          value: category.id,
          label: category.categoryName,
          children: []
        }
      }
    }))

    cascaderOptions.value = cascaderData
    categoryOptions.value = categories
  } catch (error) {
    console.error('构建级联选项失败:', error)
  }
}

// 加载奖品组数据
const loadPrizeGroupOptions = async () => {
  try {
    const data = await PrizeGroupApi.getPrizeGroupPage()
    prizeGroupOptions.value = data.list || []
  } catch (error) {
    console.error('加载奖品组失败:', error)
  }
}

// 加载等级选项（来自 LevelConfig 列表接口）
const loadLevelOptions = async () => {
  try {
    const data = await LevelConfigApi.getLevelConfigPage({
      categoryType: formData.value.categoryId
    })
    levelOptions.value = data.list || []
  } catch (error) {
    console.error('加载等级选项失败:', error)
  }
}

// 处理级联选择器变化
const handleCascaderChange = (value: number[]) => {
  if (value && value.length === 2) {
    formData.value.categoryId = value[0]
    formData.value.typeId = value[1]
  } else {
    formData.value.categoryId = undefined
    formData.value.typeId = undefined
  }
}

/** 重置表单 */
const resetForm = () => {
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
    accompanySettting: undefined,
    maxBuyNum: undefined,
    commissionRate: undefined,
    refundSupported: undefined,
    virtualSales: undefined,
    virtualPrice: undefined,
    estimateAccompanyTime: undefined,
    saleStatus: undefined
  }
  formRef.value?.resetFields()
}
</script>

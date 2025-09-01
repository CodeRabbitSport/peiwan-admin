<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading">
      <el-form-item label="类型名称" prop="typeName">
        <el-input v-model="formData.typeName" placeholder="请输入类型名称" />
      </el-form-item>
      <el-form-item label="商品分类" prop="categoryId">
        <el-select
          v-model="formData.categoryId"
          placeholder="请选择商品分类"
          clearable
          filterable
          :loading="categoryLoading"
          class="w-full">
          <el-option
            v-for="item in categoryOptions"
            :key="item.id"
            :label="item.categoryName"
            :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否显示" prop="isShow">
        <el-radio-group v-model="formData.isShow">
          <el-radio :value="true">显示</el-radio>
          <el-radio :value="false">隐藏</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="排序" prop="sortOrder">
        <el-input-number v-model="formData.sortOrder" placeholder="请输入排序" :min="0" class="w-full" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { ProductTypeApi, ProductType } from '@/api/gamer/producttype'
import { ProductCategoryApi, ProductCategory } from '@/api/gamer/productcategory'

/** 產品分類 表单 */
defineOptions({ name: 'ProductTypeForm' })

// 接收props
const props = defineProps({
  categoryId: {
    type: Number,
    default: undefined
  }
})

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const categoryLoading = ref(false) // 分类搜索加载中
const categoryOptions = ref<ProductCategory[]>([]) // 分类选项
const formData = ref({
  id: undefined,
  typeName: undefined,
  categoryId: undefined as number | undefined,
  isShow: true,
  sortOrder: undefined
})
const formRules = reactive({
  categoryId: [{ required: true, message: '商品分类不能为空', trigger: 'blur' }]
})

// 根据ID加载分类信息
const loadCategoryById = async (categoryId: number) => {
  try {
    const data = await ProductCategoryApi.getProductCategoryPage({
      pageNo: 1,
      pageSize: 100
    })
    const category = data.list.find(item => item.id === categoryId)
    if (category) {
      categoryOptions.value = [category, ...categoryOptions.value.filter(item => item.id !== categoryId)]
    }
  } catch (error) {
    console.error('加载分类信息失败:', error)
  }
}
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
      formData.value = await ProductTypeApi.getProductType(id)
      // 如果有分类ID，需要加载对应的分类信息
      if (formData.value.categoryId) {
        await loadCategoryById(formData.value.categoryId)
      }
    } finally {
      formLoading.value = false
    }
  } else {
    // 新增时加载初始分类选项
    await loadInitialCategories()
    // 如果有传入categoryId，则设置默认值
    if (props.categoryId) {
      formData.value.categoryId = props.categoryId
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
    const data = formData.value as unknown as ProductType
    if (formType.value === 'create') {
      await ProductTypeApi.createProductType(data)
      message.success(t('common.createSuccess'))
    } else {
      await ProductTypeApi.updateProductType(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}
// 初始化时加载一些分类选项
const loadInitialCategories = async () => {
  try {
    const data = await ProductCategoryApi.getProductCategoryPage()
    categoryOptions.value = data.list
  } catch (error) {
    console.error('加载分类选项失败:', error)
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    typeName: undefined,
    categoryId: undefined,
    isShow: true,
    sortOrder: undefined
  }
  formRef.value?.resetFields()
}
</script>

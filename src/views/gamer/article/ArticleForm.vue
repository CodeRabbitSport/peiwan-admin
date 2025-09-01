<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" align-center class="!w-[80vw]">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="140px"
      v-loading="formLoading"
      class="max-h-[70vh] overflow-y-scroll">
      <el-form-item label="文章分类" prop="categoryId">
        <el-select v-model="formData.categoryId" placeholder="请选择分类" clearable class="!w-full">
          <el-option
            v-for="category in categoryList"
            :key="category.id"
            :label="category.categoryName"
            :value="category.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="文章标题" prop="articleTitle">
        <el-input v-model="formData.articleTitle" placeholder="请输入文章标题" />
      </el-form-item>
      <el-form-item label="文章简介" prop="articleDesc">
        <el-input v-model="formData.articleDesc" type="textarea" placeholder="请输入文章简介" />
      </el-form-item>
      <el-form-item label="文章内容" prop="articleContent">
        <Editor v-model="formData.articleContent" height="150px" />
      </el-form-item>
      <el-form-item label="封面图" prop="cover">
        <UploadImg v-model="formData.cover" />
      </el-form-item>

      <el-form-item label="文章隐藏内容" prop="articleHideContent">
        <Editor v-model="formData.articleHideContent" height="150px" />
      </el-form-item>
      <el-form-item label="隐藏内容获取方式" prop="hideActiveType">
        <el-select v-model="formData.hideActiveType"
          placeholder="请选择隐藏内容获取方式">
          <el-option :value="1" label="所有人可见"></el-option>
          <el-option :value="2" label="登录用户可见"></el-option>
          <el-option :value="3" label="下过单的用户可见"></el-option>
          <el-option :value="4" label="累计金额消费过x元"></el-option>
          <el-option :value="5" label="累计下单超过x次"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="formData.hideActiveType === 4 || formData.hideActiveType === 5" label="请输入数值"
        prop="hideActiveCount">
        <el-input v-model="formData.hideActiveCount" placeholder="请输入数值" />
      </el-form-item>
      <el-form-item label="排序" prop="sortOrder">
        <el-input v-model="formData.sortOrder" placeholder="请输入排序" />
      </el-form-item>

    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { ArticleApi, Article } from '@/api/gamer/article'
import { ArticleCategoryApi, ArticleCategory } from '@/api/gamer/articlecategory'

interface Props {
  defaultCategoryId?: number
}

const props = defineProps<Props>()

/** 文章 表单 */
defineOptions({ name: 'ArticleForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined as number | undefined,
  articleTitle: undefined as string | undefined,
  articleDesc: undefined as string | undefined,
  articleContent: undefined as string | undefined,
  articleHideContent: undefined as string | undefined,
  hideActiveType: undefined as number | undefined,
  hideActiveCount: undefined as number | undefined,
  cover: undefined as string | undefined,
  sortOrder: undefined as number | undefined,
  categoryId: undefined as number | undefined
})
const formRules = reactive({
  categoryId: [{ required: true, message: '分类ID不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref
const categoryList = ref<ArticleCategory[]>([]) // 分类列表

/** 获取分类列表 */
const getCategoryList = async () => {
  try {
    const data = await ArticleCategoryApi.getArticleCategoryPage()
    categoryList.value = data.list || []
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 获取分类列表
  await getCategoryList()
  // 如果是创建模式且有默认categoryId，则设置默认值
  if (type === 'create' && props.defaultCategoryId) {
    formData.value.categoryId = props.defaultCategoryId
  }
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await ArticleApi.getArticle(id)
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
    const data = formData.value as unknown as Article
    if (formType.value === 'create') {
      await ArticleApi.createArticle(data)
      message.success(t('common.createSuccess'))
    } else {
      await ArticleApi.updateArticle(data)
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
    id: undefined as number | undefined,
    articleTitle: undefined as string | undefined,
    articleDesc: undefined as string | undefined,
    articleContent: undefined as string | undefined,
    articleHideContent: undefined as string | undefined,
    hideActiveType: undefined as number | undefined,
    hideActiveCount: undefined as number | undefined,
    cover: undefined as string | undefined,
    sortOrder: undefined as number | undefined,
    categoryId: (props.defaultCategoryId || undefined) as number | undefined
  }
  formRef.value?.resetFields()
}
</script>

<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="动态ID" prop="momentId">
        <el-input v-model="formData.momentId" placeholder="请输入动态ID" />
      </el-form-item>
      <el-form-item label="评论用户ID" prop="userId">
        <el-input v-model="formData.userId" placeholder="请输入评论用户ID" />
      </el-form-item>
      <el-form-item label="评论内容" prop="content">
        <el-input v-model="formData.content" type="textarea" placeholder="请输入评论内容" />
      </el-form-item>
      <el-form-item label="父评论ID" prop="parentId">
        <el-input v-model="formData.parentId" placeholder="请输入父评论ID" />
      </el-form-item>
      <el-form-item label="发布地点" prop="location">
        <el-input v-model="formData.location" placeholder="请输入发布地点" />
      </el-form-item>
      <el-form-item label="发布IP" prop="publishIp">
        <el-input v-model="formData.publishIp" placeholder="请输入发布IP" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { UserMomentCommentApi, UserMomentComment } from '@/api/gamer/usermomentcomment'

/** 用户动态评论 表单 */
defineOptions({ name: 'UserMomentCommentForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  momentId: undefined,
  userId: undefined,
  content: undefined,
  parentId: undefined,
  location: undefined,
  publishIp: undefined
})
const formRules = reactive({
  momentId: [{ required: true, message: '动态ID不能为空', trigger: 'blur' }],
  userId: [{ required: true, message: '评论用户ID不能为空', trigger: 'blur' }],
  content: [{ required: true, message: '评论内容不能为空', trigger: 'blur' }]
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
      formData.value = await UserMomentCommentApi.getUserMomentComment(id)
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
    const data = formData.value as unknown as UserMomentComment
    if (formType.value === 'create') {
      await UserMomentCommentApi.createUserMomentComment(data)
      message.success(t('common.createSuccess'))
    } else {
      await UserMomentCommentApi.updateUserMomentComment(data)
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
    momentId: undefined,
    userId: undefined,
    content: undefined,
    parentId: undefined,
    location: undefined,
    publishIp: undefined
  }
  formRef.value?.resetFields()
}
</script>
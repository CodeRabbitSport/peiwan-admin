<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="发布用户ID" prop="userId">
        <el-input v-model="formData.userId" placeholder="请输入发布用户ID" />
      </el-form-item>
      <el-form-item label="动态类型" prop="momentType">
        <el-radio-group v-model="formData.momentType">
          <el-radio value="1">文字/图片</el-radio>
          <el-radio value="2">语音</el-radio>
          <el-radio value="3">投票</el-radio>
          <el-radio value="4">红包</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="话题(多个使用#分割)" prop="topic">
        <el-input v-model="formData.topic" placeholder="请输入话题(多个使用#分割)" />
      </el-form-item>
      <el-form-item label="发布地点" prop="location">
        <el-input v-model="formData.location" placeholder="请输入发布地点" />
      </el-form-item>
      <el-form-item label="发布IP" prop="publishIp">
        <el-input v-model="formData.publishIp" placeholder="请输入发布IP" />
      </el-form-item>
      <el-form-item label="优先级: 0=普通,1=置顶" prop="priority">
        <el-input v-model="formData.priority" placeholder="请输入优先级: 0=普通,1=置顶" />
      </el-form-item>
      <el-form-item label="优先级过期时间" prop="priorityExpireTime">
        <el-date-picker
          v-model="formData.priorityExpireTime"
          type="date"
          value-format="x"
          placeholder="选择优先级过期时间"
        />
      </el-form-item>
      <el-form-item label="最后刷新时间" prop="lastRefreshTime">
        <el-date-picker
          v-model="formData.lastRefreshTime"
          type="date"
          value-format="x"
          placeholder="选择最后刷新时间"
        />
      </el-form-item>
      <el-form-item label="点赞数" prop="likeCount">
        <el-input v-model="formData.likeCount" placeholder="请输入点赞数" />
      </el-form-item>
      <el-form-item label="浏览数" prop="browseCount">
        <el-input v-model="formData.browseCount" placeholder="请输入浏览数" />
      </el-form-item>
      <el-form-item label="评论数" prop="commentCount">
        <el-input v-model="formData.commentCount" placeholder="请输入评论数" />
      </el-form-item>
      <el-form-item label="分享数" prop="shareCount">
        <el-input v-model="formData.shareCount" placeholder="请输入分享数" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="formData.status" placeholder="请选择状态">
          <el-option label="待审核" value="0" />
          <el-option label="审核通过" value="1" />
          <el-option label="审核不通过" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="审核时间" prop="auditTime">
        <el-date-picker
          v-model="formData.auditTime"
          type="date"
          value-format="x"
          placeholder="选择审核时间"
        />
      </el-form-item>
      <el-form-item label="拒绝原因" prop="auditReason">
        <el-input v-model="formData.auditReason" type="textarea" placeholder="请输入拒绝原因" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { UserMomentApi, UserMoment } from '@/api/gamer/usermoment'

/** 用户动态 表单 */
defineOptions({ name: 'UserMomentForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  userId: undefined,
  momentType: undefined,
  topic: undefined,
  location: undefined,
  publishIp: undefined,
  priority: undefined,
  priorityExpireTime: undefined,
  lastRefreshTime: undefined,
  likeCount: undefined,
  browseCount: undefined,
  commentCount: undefined,
  shareCount: undefined,
  status: undefined,
  auditTime: undefined,
  auditReason: undefined
})
const formRules = reactive({
  userId: [{ required: true, message: '发布用户ID不能为空', trigger: 'blur' }],
  momentType: [{ required: true, message: '动态类型: 1=文字/图片,2=语音,3=投票,4=红包不能为空', trigger: 'blur' }]
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
      formData.value = await UserMomentApi.getUserMoment(id)
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
    const data = formData.value as unknown as UserMoment
    if (formType.value === 'create') {
      await UserMomentApi.createUserMoment(data)
      message.success(t('common.createSuccess'))
    } else {
      await UserMomentApi.updateUserMoment(data)
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
    momentType: undefined,
    topic: undefined,
    location: undefined,
    publishIp: undefined,
    priority: undefined,
    priorityExpireTime: undefined,
    lastRefreshTime: undefined,
    likeCount: undefined,
    browseCount: undefined,
    commentCount: undefined,
    shareCount: undefined,
    status: undefined,
    auditTime: undefined,
    auditReason: undefined
  }
  formRef.value?.resetFields()
}
</script>

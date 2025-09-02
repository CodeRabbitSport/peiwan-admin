<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="用户ID" prop="userId">
        <el-input v-model="formData.userId" placeholder="请输入用户ID" />
      </el-form-item>
      <el-form-item label="所属商品分类ID" prop="productCategoryId">
        <el-input v-model="formData.productCategoryId" placeholder="请输入所属商品分类ID" />
      </el-form-item>
      <el-form-item label="等级类型" prop="levelType">
        <el-select v-model="formData.levelType" placeholder="请选择等级类型">
          <el-option label="打手" value="1" />
          <el-option label="陪玩" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="级别" prop="level">
        <el-input v-model="formData.level" placeholder="请输入级别" />
      </el-form-item>
      <el-form-item label="个人介绍" prop="personalIntroduction">
        <el-input v-model="formData.personalIntroduction" type="textarea" placeholder="请输入个人介绍" />
      </el-form-item>
      <el-form-item label="驳回原因" prop="rejectReason">
        <el-input v-model="formData.rejectReason" type="textarea" placeholder="请输入驳回原因" />
      </el-form-item>
      <el-form-item label="联系方式(json字符串)" prop="contact">
        <el-input v-model="formData.contact" placeholder="请输入联系方式(json字符串)" />
      </el-form-item>
      <el-form-item label="图片附件" prop="imageAttachment">
        <UploadImg v-model="formData.imageAttachment" />
      </el-form-item>
      <el-form-item label="附件" prop="attachment">
        <UploadFile v-model="formData.attachment" />
      </el-form-item>
      <el-form-item label="审核状态" prop="auditStatus">
        <el-select v-model="formData.auditStatus" placeholder="请选择审核状态">
          <el-option label="待审核" value="0" />
          <el-option label="通过" value="1" />
          <el-option label="拒绝" value="2" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { LevelApplyApi, LevelApply } from '@/api/gamer/levelapply'

/** 打手/陪玩等级申请 表单 */
defineOptions({ name: 'LevelApplyForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  userId: undefined,
  productCategoryId: undefined,
  levelType: undefined,
  level: undefined,
  personalIntroduction: undefined,
  rejectReason: undefined,
  contact: undefined,
  imageAttachment: undefined,
  attachment: '',
  auditStatus: undefined
})
const formRules = reactive({
  userId: [{ required: true, message: '用户ID不能为空', trigger: 'blur' }],
  productCategoryId: [{ required: true, message: '所属商品分类ID不能为空', trigger: 'blur' }],
  levelType: [{ required: true, message: '等级类型(1打手2陪玩)不能为空', trigger: 'change' }],
  level: [{ required: true, message: '级别不能为空', trigger: 'blur' }]
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
      formData.value = await LevelApplyApi.getLevelApply(id)
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
    const data = formData.value as unknown as LevelApply
    if (formType.value === 'create') {
      await LevelApplyApi.createLevelApply(data)
      message.success(t('common.createSuccess'))
    } else {
      await LevelApplyApi.updateLevelApply(data)
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
    productCategoryId: undefined,
    levelType: undefined,
    level: undefined,
    personalIntroduction: undefined,
    rejectReason: undefined,
    contact: undefined,
    imageAttachment: undefined,
    attachment: '',
    auditStatus: undefined
  }
  formRef.value?.resetFields()
}
</script>

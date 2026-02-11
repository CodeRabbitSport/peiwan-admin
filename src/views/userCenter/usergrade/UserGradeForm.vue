<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="等级编号" prop="levelNumber">
        <el-input v-model="formData.levelNumber" placeholder="请输入等级编号" />
      </el-form-item>
      <el-form-item label="等级名称" prop="levelName">
        <el-input v-model="formData.levelName" placeholder="请输入等级名称" />
      </el-form-item>
      <el-form-item label="等级图标" prop="levelIcon">
        <UploadImg v-model="formData.levelIcon" />
      </el-form-item>
      <el-form-item label="等级封面" prop="levelCover">
        <UploadImg v-model="formData.levelCover" />
      </el-form-item>
      <el-form-item label="等级描述" prop="levelDescription">
        <Editor v-model="formData.levelDescription" height="150px" />
      </el-form-item>
      <el-form-item label="等级权益(存json)" prop="levelPrivileges">
        <el-input v-model="formData.levelPrivileges" placeholder="请输入等级权益(存json)" />
      </el-form-item>
      <el-form-item label="升级所需数" prop="levelUpgradePoints">
        <el-input v-model="formData.levelUpgradePoints" placeholder="请输入升级所需数" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { UserGradeApi, UserGrade } from '@/api/userCenter/usergrade'

/** 用户等级配置 表单 */
defineOptions({ name: 'UserGradeForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  levelNumber: undefined,
  levelName: undefined,
  levelIcon: undefined,
  levelCover: undefined,
  levelDescription: undefined,
  levelPrivileges: undefined,
  levelUpgradePoints: undefined
})
const formRules = reactive({
  levelNumber: [{ required: true, message: '等级编号不能为空', trigger: 'blur' }],
  levelName: [{ required: true, message: '等级名称不能为空', trigger: 'blur' }],
  levelIcon: [{ required: true, message: '等级图标不能为空', trigger: 'blur' }],
  levelCover: [{ required: true, message: '等级封面不能为空', trigger: 'blur' }],
  levelUpgradePoints: [{ required: true, message: '升级所需数不能为空', trigger: 'blur' }]
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
      formData.value = await UserGradeApi.getUserGrade(id)
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
    const data = formData.value as unknown as UserGrade
    if (formType.value === 'create') {
      await UserGradeApi.createUserGrade(data)
      message.success(t('common.createSuccess'))
    } else {
      await UserGradeApi.updateUserGrade(data)
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
    levelNumber: undefined,
    levelName: undefined,
    levelIcon: undefined,
    levelCover: undefined,
    levelDescription: undefined,
    levelPrivileges: undefined,
    levelUpgradePoints: undefined
  }
  formRef.value?.resetFields()
}
</script>
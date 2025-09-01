<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" align-center>
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
      class="max-h-[70vh] overflow-y-scroll">
      <el-form-item label="分组ID" prop="groupId" class="!hidden">
        <el-input v-model="formData.groupId" placeholder="请输入分组ID" />
      </el-form-item>
      <el-form-item label="奖品标题" prop="prizeTitle">
        <el-input v-model="formData.prizeTitle" placeholder="请输入奖品标题" />
      </el-form-item>
      <el-form-item label="概率" prop="prizeRate">
        <el-input-number class="!w-full" v-model="formData.prizeRate" placeholder="请输入概率" />
      </el-form-item>
      <el-form-item label="描述" prop="prizeDesc">
        <el-input type="textarea" v-model="formData.prizeDesc" placeholder="请输入描述" />
      </el-form-item>
      <el-form-item label="封面图" prop="prizeCover">
        <UploadImg v-model="formData.prizeCover" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { PrizeApi, Prize } from '@/api/gamer/prize'

interface Props {
  defaultGroupId?: number
}

const props = defineProps<Props>()

/** 奖品配置 表单 */
defineOptions({ name: 'PrizeForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined as number | undefined,
  groupId: undefined as number | undefined,
  prizeTitle: undefined as string | undefined,
  prizeRate: undefined as number | undefined,
  prizeDesc: undefined as string | undefined,
  prizeCover: undefined as string | undefined
})
const formRules = reactive({
  groupId: [{ required: true, message: '分组ID不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 如果是创建模式且有默认groupId，则设置默认值
  if (type === 'create' && props.defaultGroupId) {
    formData.value.groupId = props.defaultGroupId
  }
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await PrizeApi.getPrize(id)
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
    const data = formData.value as unknown as Prize
    if (formType.value === 'create') {
      await PrizeApi.createPrize(data)
      message.success(t('common.createSuccess'))
    } else {
      await PrizeApi.updatePrize(data)
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
    groupId: (props.defaultGroupId || undefined) as number | undefined,
    prizeTitle: undefined as string | undefined,
    prizeRate: undefined as number | undefined,
    prizeDesc: undefined as string | undefined,
    prizeCover: undefined as string | undefined
  }
  formRef.value?.resetFields()
}
</script>

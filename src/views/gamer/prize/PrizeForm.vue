<script setup lang="ts">
import type { Prize } from '@/api/gamer/prize'
import { PrizeApi } from '@/api/gamer/prize'

interface Props {
  defaultGroupId?: number
}

/** 奖品配置 表单 */
defineOptions({ name: 'PrizeForm' })

const props = defineProps<Props>()

// 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success'])
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
  prizeCover: undefined as string | undefined,
})
const formRules = reactive({
  groupId: [{ required: true, message: '分组ID不能为空', trigger: 'blur' }],
  prizeRate: [{ required: true, message: '概率不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
async function open(type: string, id?: number) {
  dialogVisible.value = true
  dialogTitle.value = t(`action.${type}`)
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
    }
    finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 定义 success 事件，用于操作成功后的回调
async function submitForm() {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as Prize
    if (formType.value === 'create') {
      await PrizeApi.createPrize(data)
      message.success(t('common.createSuccess'))
    }
    else {
      await PrizeApi.updatePrize(data)
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
    id: undefined as number | undefined,
    groupId: (props.defaultGroupId || undefined) as number | undefined,
    prizeTitle: undefined as string | undefined,
    prizeRate: undefined as number | undefined,
    prizeDesc: undefined as string | undefined,
    prizeCover: undefined as string | undefined,
  }
  formRef.value?.resetFields()
}
</script>

<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" align-center>
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="max-h-[70vh] overflow-y-scroll"
    >
      <el-form-item label="分组ID" prop="groupId" class="!hidden">
        <el-input v-model="formData.groupId" placeholder="请输入分组ID" />
      </el-form-item>
      <el-form-item label="奖品标题" prop="prizeTitle">
        <el-input v-model="formData.prizeTitle" placeholder="请输入奖品标题" />
      </el-form-item>
      <el-form-item label="概率" prop="prizeRate">
        <el-input-number v-model="formData.prizeRate" class="!w-full" placeholder="请输入概率" />
      </el-form-item>
      <el-form-item label="描述" prop="prizeDesc">
        <el-input v-model="formData.prizeDesc" type="textarea" placeholder="请输入描述" />
      </el-form-item>
      <el-form-item label="封面图" prop="prizeCover">
        <UploadImg v-model="formData.prizeCover" />
      </el-form-item>
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

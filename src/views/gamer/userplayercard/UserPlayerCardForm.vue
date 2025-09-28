<script setup lang="ts">
import { ProductCategoryApi } from '@/api/gamer/productcategory'
import type { UserPlayerCard } from '@/api/gamer/userplayercard'
import { UserPlayerCardApi } from '@/api/gamer/userplayercard'

/** 用戶游戏名片 表单 */
defineOptions({ name: 'UserPlayerCardForm' })

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
  id: undefined,
  categoryName: undefined,
  categoryId: undefined,
  userId: undefined,
  cardInfo: undefined,
})
const formRules = reactive({
  categoryId: [{ required: true, message: '请选择游戏分类', trigger: 'change' }],
  userId: [{ required: true, message: '用户ID不能为空', trigger: 'blur' }],
  cardInfo: [{ required: true, message: '名片信息不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref
const cardEntries = ref<Array<{ key: string, value: string }>>([])
const categoryOptions = ref<{ label: string, value: number }[]>([])

/** 打开弹窗 */
async function open(type: string, id?: number) {
  dialogVisible.value = true
  dialogTitle.value = t(`action.${type}`)
  formType.value = type
  resetForm()
  if (!categoryOptions.value.length)
    await loadCategoryOptions()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await UserPlayerCardApi.getUserPlayerCard(id)
      parseCardEntries(formData.value.cardInfo)
    }
    finally {
      formLoading.value = false
    }
  }
  else {
    parseCardEntries()
  }
}
defineExpose({ open }) // 定义 success 事件，用于操作成功后的回调
async function submitForm() {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as UserPlayerCard
    data.cardInfo = stringifyCardEntries()
    if (formType.value === 'create') {
      await UserPlayerCardApi.createUserPlayerCard(data)
      message.success(t('common.createSuccess'))
    }
    else {
      await UserPlayerCardApi.updateUserPlayerCard(data)
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
    id: undefined,
    categoryName: undefined,
    categoryId: undefined,
    userId: undefined,
    cardInfo: undefined,
  }
  formRef.value?.resetFields()
  cardEntries.value = []
}

async function loadCategoryOptions() {
  try {
    const { list = [] } = await ProductCategoryApi.getProductCategoryPage({ pageNo: 1, pageSize: 500 })
    categoryOptions.value = list.map((item: any) => ({
      label: item.categoryName,
      value: item.id,
    }))
  }
  catch {}
}

function parseCardEntries(cardInfo?: string) {
  cardEntries.value = []
  if (!cardInfo) return
  try {
    const parsed = JSON.parse(cardInfo)
    if (parsed && typeof parsed === 'object') {
      cardEntries.value = Object.entries(parsed).map(([key, value]) => ({
        key,
        value: value != null ? String(value) : '',
      }))
    }
  }
  catch {
    // ignore invalid json
  }
}

function stringifyCardEntries() {
  const obj: Record<string, string> = {}
  cardEntries.value.forEach((entry) => {
    const key = entry.key?.trim()
    if (!key) return
    obj[key] = entry.value ?? ''
  })
  return Object.keys(obj).length ? JSON.stringify(obj) : undefined
}

function addCardEntry() {
  cardEntries.value.push({ key: '', value: '' })
}

function removeCardEntry(index: number) {
  cardEntries.value.splice(index, 1)
}
</script>

<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="游戏分类" prop="categoryId">
        <el-select
          v-model="formData.categoryId"
          placeholder="请选择游戏分类"
          filterable
          clearable
          :loading="!categoryOptions.length"
        >
          <el-option
            v-for="item in categoryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="用户ID" prop="userId">
        <UserSelectInput
          v-model="formData.userId"
          placeholder="请选择用户"
          @change="(_, user) => { if (user) formData.userId = user.id }"
        />
      </el-form-item>
      <el-form-item label="名片信息" prop="cardInfo">
        <div class="w-full flex flex-col gap-2">
          <div class="flex flex-col gap-2">
            <div
              v-for="(entry, index) in cardEntries"
              :key="index"
              class="flex items-center gap-2"
            >
              <p>
                {{ entry.key }}
              </p>
              <el-input
                v-model="entry.value"
                placeholder="字段值"
                class="flex-1"
              />
              <el-button type="danger" link @click="removeCardEntry(index)">
                删除
              </el-button>
            </div>
            <el-empty v-if="!cardEntries.length" description="暂无名片信息" :image-size="80" />
          </div>
          <el-button type="primary" plain @click="addCardEntry">
            新增字段
          </el-button>
        </div>
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

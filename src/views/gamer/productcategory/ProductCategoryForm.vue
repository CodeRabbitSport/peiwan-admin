<script setup lang="ts">
import { Delete as ElIconDelete, Plus as ElIconPlus } from '@element-plus/icons-vue'

import type { ProductCategory } from '@/api/gamer/productcategory'
import { ProductCategoryApi } from '@/api/gamer/productcategory'
import UploadImg from '@/components/UploadFile/src/UploadImg.vue'

/** 产品分类 表单 */
defineOptions({ name: 'ProductCategoryForm' })

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
  categoryType: undefined,
  categoryIcon: undefined,
  categoryDemo: undefined,
  gameCard: '',
  orderReceivingStatus: undefined,
  orderReceivingRegion: '',
  skilledPositionStatus: undefined,
  skilledPosition: undefined,
  accompanyTypeStatus: undefined,
  accompanyType: undefined,
  sortOrder: undefined,
  gameType: undefined,
})

// 游戏名片动态表单字段
const gameCardFields = ref([{ type: 'text', label: '', value: '' }])
// 接单大区动态表单字段
const orderReceivingRegionFields = ref([''])
const formRules = reactive({
  // categoryType: [{ required: true, message: '类型不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
async function open(type: string, id?: number) {
  dialogVisible.value = true
  dialogTitle.value = t(`action.${type}`)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await ProductCategoryApi.getProductCategory(id)
      // 初始化游戏名片字段
      initGameCardFields()
      // 初始化接单大区字段
      initOrderReceivingRegionFields()
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
    // 提交前确保数据与表单项同步（尤其兼容旧格式/未触发输入变更的情况）
    updateGameCardData()
    updateOrderReceivingRegionData()
    // 重复校验：接单大区名称不得重复
    const regions = orderReceivingRegionFields.value
      .map(it => (it || '').trim())
      .filter(n => n !== '')
    const seen = new Set<string>()
    let dupName: string | null = null
    for (const n of regions) {
      if (seen.has(n)) {
        dupName = n
        break
      }
      seen.add(n)
    }
    if (dupName) {
      message.error(`接单大区存在重复的大区名称：${dupName}`)
      return
    }
    const data = formData.value as unknown as ProductCategory
    if (formType.value === 'create') {
      await ProductCategoryApi.createProductCategory(data)
      message.success(t('common.createSuccess'))
    }
    else {
      await ProductCategoryApi.updateProductCategory(data)
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

// 添加游戏名片字段
function addGameCardField() {
  gameCardFields.value.push({ type: 'text', label: '', value: '' })
  updateGameCardData()
}

// 移除游戏名片字段
function removeGameCardField(index: number) {
  if (gameCardFields.value.length > 1) {
    gameCardFields.value.splice(index, 1)
    updateGameCardData()
  }
}

// 更新游戏名片数据
function updateGameCardData() {
  formData.value.gameCard = JSON.stringify(gameCardFields.value)
}

// 初始化游戏名片字段
function initGameCardFields() {
  if (formData.value.gameCard) {
    try {
      const parsed = JSON.parse(formData.value.gameCard)
      if (Array.isArray(parsed) && parsed.length > 0) {
        gameCardFields.value = parsed
      }
      else {
        gameCardFields.value = [{ type: 'text', label: '', value: '' }]
      }
    }
    catch (error) {
      gameCardFields.value = [{ type: 'text', label: '', value: '' }]
    }
  }
  else {
    gameCardFields.value = [{ type: 'text', label: '', value: '' }]
  }
}

// 添加接单大区字段
function addOrderReceivingRegionField() {
  orderReceivingRegionFields.value.push('')
  updateOrderReceivingRegionData()
}

// 移除接单大区字段（与游戏名片一致：至少保留 1 行）
function removeOrderReceivingRegionField(index: number) {
  if (orderReceivingRegionFields.value.length > 1) {
    orderReceivingRegionFields.value.splice(index, 1)
    updateOrderReceivingRegionData()
  }
}

// （按需求）不再提供清空全部按钮，仅支持逐项删除

// 检查接单大区是否重复
function checkDuplicateRegion(currentValue: string, currentIndex: number): boolean {
  if (!currentValue || currentValue.trim() === '') {
    return false
  }
  const trimmedValue = currentValue.trim()
  return orderReceivingRegionFields.value.some((region, index) => {
    return index !== currentIndex && (region || '').trim() === trimmedValue
  })
}

// 处理接单大区输入变化
function handleRegionInput(index: number) {
  const currentValue = orderReceivingRegionFields.value[index]
  if (checkDuplicateRegion(currentValue, index)) {
    message.warning(`大区名称 "${currentValue.trim()}" 已存在，不能重复`)
  }
  updateOrderReceivingRegionData()
}

// 更新接单大区数据
function updateOrderReceivingRegionData() {
  const filtered = orderReceivingRegionFields.value
    .map(it => (it || '').trim())
    .filter(it => it !== '')
  formData.value.orderReceivingRegion = filtered.join(',')
}

// 初始化接单大区字段
function initOrderReceivingRegionFields() {
  const value = formData.value.orderReceivingRegion as unknown as string
  if (value) {
    try {
      // 先尝试解析旧的 JSON 格式
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed) && parsed.length > 0) {
        orderReceivingRegionFields.value = parsed.map((it: any) => it?.region ?? '')
        return
      }
    }
    catch (e) {
      // 不是 JSON 格式，按逗号分隔解析
    }
    // 逗号分隔格式
    const names = String(value).split(',').map(n => n.trim()).filter(Boolean)
    orderReceivingRegionFields.value = names.length ? names : ['']
  }
  else {
    orderReceivingRegionFields.value = ['']
  }
}

/** 重置表单 */
function resetForm() {
  formData.value = {
    id: undefined,
    categoryName: undefined,
    categoryType: undefined,
    categoryIcon: undefined,
    categoryDemo: undefined,
    gameCard: '',
    orderReceivingStatus: undefined,
    orderReceivingRegion: '',
    skilledPositionStatus: undefined,
    skilledPosition: undefined,
    accompanyTypeStatus: undefined,
    accompanyType: undefined,
    sortOrder: undefined,
    gameType: undefined,
  }
  gameCardFields.value = [{ type: 'text', label: '', value: '' }]
  orderReceivingRegionFields.value = ['']
  formRef.value?.resetFields()
  // 同步序列化默认值，避免未操作时为 undefined
  updateGameCardData()
  updateOrderReceivingRegionData()
}
</script>

<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" align-center width="80vw">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="max-h-[70vh] overflow-y-scroll"
    >
      <el-form-item label="分类名称" prop="categoryName">
        <el-input v-model="formData.categoryName" placeholder="请输入分类名称" />
      </el-form-item>

      <!-- <el-form-item label="游戏类型" prop="gameType">
        <el-radio-group v-model="formData.gameType">
          <el-radio :value="1">端游</el-radio>
          <el-radio :value="2">手游</el-radio>
        </el-radio-group>
      </el-form-item> -->
      <!-- <el-form-item label="类型" prop="categoryType">
        <el-radio-group v-model="formData.categoryType">
          <el-radio :value="2">打手</el-radio>
          <el-radio :value="1">陪玩</el-radio>
        </el-radio-group>
      </el-form-item> -->
      <el-form-item label="类别图标" prop="categoryIcon">
        <UploadImg v-model="formData.categoryIcon" />
      </el-form-item>
      <el-form-item label="申请页介绍" prop="categoryDemo">
        <!-- <UploadImg v-model="formData.categoryDemo" /> -->
        <Editor v-model="formData.categoryDemo" height="150px" />
      </el-form-item>
      <el-form-item label="游戏名片" prop="gameCard">
        <div class="dynamic-form w-full">
          <div
            v-for="(item, index) in gameCardFields"
            :key="index"
            class="mb-2 w-[500px]"
          >
            <el-row :gutter="10" align="middle">
              <el-col :span="4">
                输入框名称
              </el-col>
              <el-col :span="13">
                <el-input
                  v-model="item.value"
                  label="输入框名称"
                  placeholder="输入框内容"
                  @input="updateGameCardData"
                />
              </el-col>
              <el-col :span="1">
                <el-button
                  type="danger"
                  :icon="ElIconDelete"
                  size="small"
                  :disabled="gameCardFields.length <= 1"
                  @click="removeGameCardField(index)"
                />
              </el-col>
            </el-row>
          </div>
          <el-button
            type="primary"
            :icon="ElIconPlus"
            size="small"
            class="mt-2 !w-[400px]"
            @click="addGameCardField"
          >
            添加字段
          </el-button>
        </div>
      </el-form-item>
      <!-- <el-form-item label="接单大区" prop="orderReceivingStatus">
        <el-radio-group v-model="formData.orderReceivingStatus">
          <el-radio :value="false">
            不启用
          </el-radio>
          <el-radio :value="true">
            启用
          </el-radio>
        </el-radio-group>

      </el-form-item> -->
      <el-form-item label="接单大区" prop="orderReceivingRegion">
        <div class="dynamic-form w-full">
          <div
            v-for="(_, index) in orderReceivingRegionFields"
            :key="index"
            class="mb-2"
          >
            <div class="flex gap-x-2">
              <div :span="2">
                大区名称
              </div>
              <div :span="3">
                <el-input
                  v-model="orderReceivingRegionFields[index]"
                  placeholder="请输入大区名称"
                  @input="handleRegionInput(index)"
                />
              </div>
              <div :span="1">
                <el-button
                  type="danger"
                  :icon="ElIconDelete"
                  size="small"
                  :disabled="orderReceivingRegionFields.length <= 1"
                  @click="removeOrderReceivingRegionField(index)"
                />
              </div>
            </div>
          </div>
          <el-button
            type="primary"
            :icon="ElIconPlus"
            size="small"
            class="mt-2 !w-[400px]"
            @click="addOrderReceivingRegionField"
          >
            添加大区
          </el-button>
        </div>
      </el-form-item>
      <!-- <el-form-item label="擅长位置" prop="skilledPositionStatus">
        <el-radio-group v-model="formData.skilledPositionStatus">
          <el-radio :value="false">不启用</el-radio>
          <el-radio :value="true">启用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="擅长位置" prop="skilledPosition">
        <el-input type="text-area" v-model="formData.skilledPosition" placeholder="请输入擅长位置(多个使用@分割)" />
      </el-form-item> -->
      <!-- <el-form-item label="陪玩类型" prop="accompanyTypeStatus">
        <el-radio-group v-model="formData.accompanyTypeStatus">
          <el-radio :value="false">
            不启用
          </el-radio>
          <el-radio :value="true">
            启用
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="陪玩類型" prop="accompanyType">
        <el-input v-model="formData.accompanyType" type="text-area" placeholder="请输入陪玩類型(多个使用@分割)" />
      </el-form-item> -->
      <el-form-item label="排序" prop="sortOrder">
        <el-input-number v-model="formData.sortOrder" placeholder="请输入排序" :min="0" class="w-full" />
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

<style lang="scss" scoped>
.dynamic-form {
  .dynamic-form-item {
    margin-bottom: 10px;

    &:last-of-type {
      margin-bottom: 15px;
    }
  }

  .el-button {
    width: 100%;
  }
}
</style>

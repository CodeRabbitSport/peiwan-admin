<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" align-center width="80vw">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
      class="max-h-[70vh] overflow-y-scroll">
      <el-form-item label="类别名称" prop="categoryName">
        <el-input v-model="formData.categoryName" placeholder="请输入类别名称" />
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
      <el-form-item label="申请演示图" prop="categoryDemo">
        <UploadImg v-model="formData.categoryDemo" />
      </el-form-item>
      <el-form-item label="游戏名片" prop="gameCard">
        <div class="dynamic-form w-full">
          <div
            v-for="(item, index) in gameCardFields"
            :key="index"
            class="w-[500px] mb-2">
            <el-row :gutter="10" align="middle">
              <el-col :span="4">
                输入框名称
              </el-col>
              <el-col :span="13">
                <el-input
                  label="输入框名称"
                  v-model="item.value"
                  placeholder="输入框内容"
                  @input="updateGameCardData" />
              </el-col>
              <el-col :span="1">
                <el-button
                  type="danger"
                  :icon="ElIconDelete"
                  size="small"
                  @click="removeGameCardField(index)"
                  :disabled="gameCardFields.length <= 1" />
              </el-col>
            </el-row>
          </div>
          <el-button
            type="primary"
            :icon="ElIconPlus"
            size="small"
            @click="addGameCardField"
            class="mt-2 !w-[400px]">
            添加字段
          </el-button>
        </div>
      </el-form-item>
      <el-form-item label="接单大区" prop="orderReceivingStatus">
        <el-radio-group v-model="formData.orderReceivingStatus">
          <el-radio :value="false">不启用</el-radio>
          <el-radio :value="true">启用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="接单大区" prop="orderReceivingRegion">
        <div class="dynamic-form w-full">
          <div
            v-for="(item, index) in orderReceivingRegionFields"
            :key="index"
            class="mb-2">
            <div class="flex gap-x-2">
              <div :span="2">
                大区名称
              </div>
              <div :span="3">
                <el-input
                  v-model="item.region"
                  placeholder="请输入大区名称"
                  @input="updateOrderReceivingRegionData" />
              </div>
              <div :span="2" class="mx-2">
                涨幅价格
              </div>
              <div :span="2">
                <el-input-number
                  v-model="item.price"
                  :min="0"
                  :step="1"
                  @change="updateOrderReceivingRegionData" />
              </div>
              <div :span="1">
                <el-button
                  type="danger"
                  :icon="ElIconDelete"
                  size="small"
                  @click="removeOrderReceivingRegionField(index)"
                  :disabled="orderReceivingRegionFields.length <= 1" />
              </div>
            </div>
          </div>
          <el-button
            type="primary"
            :icon="ElIconPlus"
            size="small"
            @click="addOrderReceivingRegionField"
            class="mt-2 !w-[400px]">
            添加大区
          </el-button>
        </div>
      </el-form-item>
      <el-form-item label="擅长位置" prop="skilledPositionStatus">
        <el-radio-group v-model="formData.skilledPositionStatus">
          <el-radio :value="false">不启用</el-radio>
          <el-radio :value="true">启用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="擅长位置" prop="skilledPosition">
        <el-input type="text-area" v-model="formData.skilledPosition" placeholder="请输入擅长位置(多个使用@分割)" />
      </el-form-item>
      <el-form-item label="陪玩类型" prop="accompanyTypeStatus">
        <el-radio-group v-model="formData.accompanyTypeStatus">
          <el-radio :value="false">不启用</el-radio>
          <el-radio :value="true">启用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="陪玩類型" prop="accompanyType">
        <el-input type="text-area" v-model="formData.accompanyType" placeholder="请输入陪玩類型(多个使用@分割)" />
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
import { ProductCategoryApi, ProductCategory } from '@/api/gamer/productcategory'
import UploadImg from '@/components/UploadFile/src/UploadImg.vue'
import { Plus as ElIconPlus, Delete as ElIconDelete } from '@element-plus/icons-vue'

/** 产品分类 表单 */
defineOptions({ name: 'ProductCategoryForm' })

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
  gameType: undefined
})

// 游戏名片动态表单字段
const gameCardFields = ref([{ type: 'text', label: '', value: '' }])
// 接单大区动态表单字段
const orderReceivingRegionFields = ref([{ region: '', price: 0 }])
const formRules = reactive({
  // categoryType: [{ required: true, message: '类型不能为空', trigger: 'blur' }]
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
      formData.value = await ProductCategoryApi.getProductCategory(id)
      // 初始化游戏名片字段
      initGameCardFields()
      // 初始化接单大区字段
      initOrderReceivingRegionFields()
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
    // 提交前确保数据与表单项同步（尤其兼容旧格式/未触发输入变更的情况）
    updateGameCardData()
    updateOrderReceivingRegionData()
    // 重复校验：接单大区名称不得重复（只在启用时校验）
    if (formData.value.orderReceivingStatus === true) {
      const regions = orderReceivingRegionFields.value
        .map((it) => (it.region || '').trim())
        .filter((n) => n !== '')
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
    }
    const data = formData.value as unknown as ProductCategory
    if (formType.value === 'create') {
      await ProductCategoryApi.createProductCategory(data)
      message.success(t('common.createSuccess'))
    } else {
      await ProductCategoryApi.updateProductCategory(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

// 添加游戏名片字段
const addGameCardField = () => {
  gameCardFields.value.push({ type: 'text', label: '', value: '' })
  updateGameCardData()
}

// 移除游戏名片字段
const removeGameCardField = (index: number) => {
  if (gameCardFields.value.length > 1) {
    gameCardFields.value.splice(index, 1)
    updateGameCardData()
  }
}

// 更新游戏名片数据
const updateGameCardData = () => {
  formData.value.gameCard = JSON.stringify(gameCardFields.value)
}

// 初始化游戏名片字段
const initGameCardFields = () => {
  if (formData.value.gameCard) {
    try {
      const parsed = JSON.parse(formData.value.gameCard)
      if (Array.isArray(parsed) && parsed.length > 0) {
        gameCardFields.value = parsed
      } else {
        gameCardFields.value = [{ type: 'text', label: '', value: '' }]
      }
    } catch (error) {
      gameCardFields.value = [{ type: 'text', label: '', value: '' }]
    }
  } else {
    gameCardFields.value = [{ type: 'text', label: '', value: '' }]
  }
}

// 添加接单大区字段
const addOrderReceivingRegionField = () => {
  orderReceivingRegionFields.value.push({ region: '', price: 0 })
  updateOrderReceivingRegionData()
}

// 移除接单大区字段（与游戏名片一致：至少保留 1 行）
const removeOrderReceivingRegionField = (index: number) => {
  if (orderReceivingRegionFields.value.length > 1) {
    orderReceivingRegionFields.value.splice(index, 1)
    updateOrderReceivingRegionData()
  }
}

// （按需求）不再提供清空全部按钮，仅支持逐项删除

// 更新接单大区数据
const updateOrderReceivingRegionData = () => {
  const filtered = orderReceivingRegionFields.value
    .map((it) => ({ region: (it.region || '').trim(), price: Number(it.price ?? 0) }))
    .filter((it) => it.region !== '' || it.price > 0)
  formData.value.orderReceivingRegion = filtered.length > 0 ? JSON.stringify(filtered) : ''
}

// 初始化接单大区字段
const initOrderReceivingRegionFields = () => {
  const value = formData.value.orderReceivingRegion as unknown as string
  if (value) {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed) && parsed.length > 0) {
        orderReceivingRegionFields.value = parsed.map((it: any) => ({
          region: it?.region ?? '',
          price: Number(it?.price ?? 0)
        }))
        return
      }
    } catch (e) {
      // ignore json parse error and try legacy format
    }
    // 兼容旧格式：使用 @ 分割的大区名称串
    const names = String(value).split('@').filter(Boolean)
    orderReceivingRegionFields.value = names.length
      ? names.map((n: string) => ({ region: n, price: 0 }))
      : [{ region: '', price: 0 }]
  } else {
    orderReceivingRegionFields.value = [{ region: '', price: 0 }]
  }
}

/** 重置表单 */
const resetForm = () => {
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
    gameType: undefined
  }
  gameCardFields.value = [{ type: 'text', label: '', value: '' }]
  orderReceivingRegionFields.value = [{ region: '', price: 0 }]
  formRef.value?.resetFields()
  // 同步序列化默认值，避免未操作时为 undefined
  updateGameCardData()
  updateOrderReceivingRegionData()
}
</script>

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

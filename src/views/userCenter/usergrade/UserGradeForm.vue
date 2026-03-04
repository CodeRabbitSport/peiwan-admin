<script setup lang="ts">
import { Delete as ElIconDelete, Plus as ElIconPlus } from '@element-plus/icons-vue'

import type { UserGrade } from '@/api/userCenter/usergrade'
import { UserGradeApi } from '@/api/userCenter/usergrade'
import { Editor } from '@/components/Editor'
import UploadImg from '@/components/UploadFile/src/UploadImg.vue'

/** 等级权益单项 */
interface LevelPrivilegeItem {
  icon?: string
  subTitle?: string
  title?: string
}

/** 用户等级配置 表单 */
defineOptions({ name: 'UserGradeForm' })

// 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success'])
const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref<{
  id?: number
  levelNumber?: number
  levelName?: string
  levelIcon?: string
  levelCover?: string
  levelDescription?: string
  levelPrivileges?: string
  levelUpgradePoints?: number
}>({
  id: undefined,
  levelNumber: undefined,
  levelName: undefined,
  levelIcon: undefined,
  levelCover: undefined,
  levelDescription: undefined,
  levelPrivileges: undefined,
  levelUpgradePoints: undefined,
})

// 等级权益动态表单
const levelPrivilegesFields = ref<LevelPrivilegeItem[]>([{ icon: '', subTitle: '', title: '' }])

const formRules = reactive({
  levelNumber: [{ required: true, message: '等级编号不能为空', trigger: 'blur' }],
  // levelName: [{ required: true, message: '等级名称不能为空', trigger: 'blur' }],
  levelIcon: [{ required: true, message: '等级图标不能为空', trigger: 'blur' }],
  levelCover: [{ required: true, message: '等级封面不能为空', trigger: 'blur' }],
  levelUpgradePoints: [{ required: true, message: '升级所需数不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

function addLevelPrivilegeField() {
  levelPrivilegesFields.value.push({ icon: '', subTitle: '', title: '' })
  updateLevelPrivilegesData()
}

function removeLevelPrivilegeField(index: number) {
  if (levelPrivilegesFields.value.length <= 1) return
  levelPrivilegesFields.value.splice(index, 1)
  updateLevelPrivilegesData()
}

function updateLevelPrivilegesData() {
  formData.value.levelPrivileges = JSON.stringify(levelPrivilegesFields.value)
}

function initLevelPrivilegesFields() {
  const raw = formData.value.levelPrivileges
  if (raw && typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        levelPrivilegesFields.value = parsed.map((it: any) => ({
          icon: it.icon ?? '',
          subTitle: it.subTitle ?? '',
          title: it.title ?? '',
        }))
        return
      }
    }
    catch {
      // ignore
    }
  }
  levelPrivilegesFields.value = [{ icon: '', subTitle: '', title: '' }]
}

/** 打开弹窗 */
async function open(type: string, id?: number) {
  dialogVisible.value = true
  dialogTitle.value = t(`action.${type}`)
  formType.value = type
  resetForm()
  if (id) {
    formLoading.value = true
    try {
      formData.value = await UserGradeApi.getUserGrade(id)
      // 回显时除以100
      if (formData.value.levelUpgradePoints) {
        formData.value.levelUpgradePoints = Number(formData.value.levelUpgradePoints) / 100
      }
      initLevelPrivilegesFields()
    }
    finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 定义 success 事件，用于操作成功后的回调
async function submitForm() {
  await formRef.value.validate()
  updateLevelPrivilegesData()
  formLoading.value = true
  try {
    const data = formData.value as unknown as UserGrade
    if (data.levelUpgradePoints) {
      data.levelUpgradePoints = Number(data.levelUpgradePoints) * 100
    }
    if (formType.value === 'create') {
      await UserGradeApi.createUserGrade(data)
      message.success(t('common.createSuccess'))
    }
    else {
      await UserGradeApi.updateUserGrade(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
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
    levelNumber: undefined,
    levelName: undefined,
    levelIcon: undefined,
    levelCover: undefined,
    levelDescription: undefined,
    levelPrivileges: undefined,
    levelUpgradePoints: undefined,
  }
  levelPrivilegesFields.value = [{ icon: '', subTitle: '', title: '' }]
  formRef.value?.resetFields()
}
</script>

<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="80vw">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="max-h-[70vh] overflow-y-auto"
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
      <el-form-item label="等级权益" prop="levelPrivileges">
        <div class="dynamic-form w-full">
          <div
            v-for="(item, index) in levelPrivilegesFields"
            :key="index"
            class="mb-3 border border-gray-200 rounded p-3"
          >
            <div class="flex flex-wrap items-start gap-2">
              <div class="flex flex-col gap-1">
                <span class="text-sm text-gray-600">图标</span>
                <UploadImg
                  v-model="item.icon"
                  height="80px"
                  width="80px"
                  @update:model-value="updateLevelPrivilegesData"
                />
              </div>
              <div class="min-w-[120px] flex-1">
                <span class="text-sm text-gray-600">标题</span>
                <el-input
                  v-model="item.title"
                  placeholder="请输入标题"
                  class="mt-1"
                  @input="updateLevelPrivilegesData"
                />
              </div>
              <div class="min-w-[120px] flex-1">
                <span class="text-sm text-gray-600">副标题</span>
                <el-input
                  v-model="item.subTitle"
                  placeholder="请输入副标题"
                  class="mt-1"
                  @input="updateLevelPrivilegesData"
                />
              </div>
              <el-button
                type="danger"
                :icon="ElIconDelete"
                size="small"
                class="mt-6"
                :disabled="levelPrivilegesFields.length <= 1"
                @click="removeLevelPrivilegeField(index)"
              />
            </div>
          </div>
          <el-button
            type="primary"
            :icon="ElIconPlus"
            size="small"
            class="mt-2"
            @click="addLevelPrivilegeField"
          >
            添加权益项
          </el-button>
        </div>
      </el-form-item>
      <el-form-item label="升级所需数" prop="levelUpgradePoints">
        <el-input v-model="formData.levelUpgradePoints" placeholder="请输入升级所需数" />
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

<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus'

import type { SensitiveWordVO } from '@/api/gamer/sensitiveword'
import * as SensitiveWordApi from '@/api/gamer/sensitiveword'

defineOptions({ name: 'SystemSensitiveWordForm' })

const emit = defineEmits<{ success: [] }>()
const message = useMessage()
const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref<FormInstance>()
const formData = ref<SensitiveWordVO>({ word: '', status: 0, remark: '' })
const rules: FormRules = {
  word: [
    { required: true, whitespace: true, message: '请输入敏感词', trigger: 'blur' },
    { max: 100, message: '敏感词不能超过 100 个字符', trigger: 'blur' },
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

async function open(id?: number) {
  formData.value = { word: '', status: 0, remark: '' }
  dialogVisible.value = true
  await nextTick()
  formRef.value?.clearValidate()
  if (id !== undefined) {
    loading.value = true
    try {
      formData.value = await SensitiveWordApi.getSensitiveWord(id)
    }
    finally {
      loading.value = false
    }
  }
}
defineExpose({ open })

async function submit() {
  if (!formRef.value || !await formRef.value.validate()) return
  loading.value = true
  try {
    const data = { ...formData.value, word: formData.value.word.trim() }
    if (data.id === undefined) {
      await SensitiveWordApi.createSensitiveWord(data)
    }
    else {
      await SensitiveWordApi.updateSensitiveWord(data)
    }
    message.success('保存成功')
    dialogVisible.value = false
    emit('success')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <Dialog v-model="dialogVisible" :title="formData.id === undefined ? '新增敏感词' : '编辑敏感词'" width="520px">
    <el-form ref="formRef" v-loading="loading" :model="formData" :rules="rules" label-width="80px">
      <el-form-item label="敏感词" prop="word">
        <el-input v-model="formData.word" placeholder="例如：加我微信" maxlength="100" show-word-limit />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :value="0">
            启用
          </el-radio>
          <el-radio :value="1">
            停用
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" :rows="3" maxlength="255" show-word-limit />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" :loading="loading" @click="submit">
        保存
      </el-button>
      <el-button :disabled="loading" @click="dialogVisible = false">
        取消
      </el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import type { UserFine } from '@/api/gamer/userfine'
import { UserFineApi } from '@/api/gamer/userfine'
import { fenToYuan } from '@/utils'
import { formatDate } from '@/utils/formatTime'

/** 罚款弹窗：开罚单 + 查看该成员罚款记录 */
defineOptions({ name: 'UserFineDialog' })

const message = useMessage()

const visible = ref(false)
const submitting = ref(false)
const member = ref<{ userId: number, nickname?: string, levelType: number }>()
const formRef = ref()
const formData = reactive({
  content: '',
  amountYuan: undefined as number | undefined,
})
const formRules = {
  content: [{
    required: true,
    validator: (_: any, value: string, callback: (err?: Error) => void) => {
      // 编辑器清空后会留下 <p><br></p>，按纯文本和图片判断是否为空
      const hasText = (value || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '').trim().length > 0
      const hasImage = /<img\b/i.test(value || '')
      hasText || hasImage ? callback() : callback(new Error('请输入罚款内容'))
    },
    trigger: 'blur',
  }],
  amountYuan: [{ required: true, message: '请输入罚款金额', trigger: 'blur' }],
}

const statusMap: Record<number, { text: string, type: 'danger' | 'success' | 'info' }> = {
  0: { text: '未缴纳', type: 'danger' },
  1: { text: '已缴纳', type: 'success' },
  2: { text: '已撤销', type: 'info' },
}

const historyLoading = ref(false)
const historyList = ref<UserFine[]>([])

async function loadHistory() {
  if (!member.value)
    return
  historyLoading.value = true
  try {
    const data = await UserFineApi.getUserFinePage({
      pageNo: 1,
      pageSize: 50,
      userId: member.value.userId,
      levelType: member.value.levelType,
    })
    historyList.value = data.list || []
  }
  finally {
    historyLoading.value = false
  }
}

function open(userId: number, nickname: string | undefined, levelType: number) {
  member.value = { userId, nickname, levelType }
  formData.content = ''
  formData.amountYuan = undefined
  visible.value = true
  formRef.value?.clearValidate()
  loadHistory()
}
defineExpose({ open })

async function submit() {
  if (!member.value)
    return
  await formRef.value.validate()
  const amount = Math.round(Number(formData.amountYuan) * 100)
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    message.warning('请输入大于0的罚款金额')
    return
  }
  try {
    await message.confirm(`确认对“${member.value.nickname || member.value.userId}”罚款 ¥${fenToYuan(amount)}？罚款缴清前该成员无法接单。`)
    submitting.value = true
    await UserFineApi.createUserFine({
      userId: member.value.userId,
      levelType: member.value.levelType,
      content: formData.content,
      amount,
    })
    message.success('罚单已创建')
    formData.content = ''
    formData.amountYuan = undefined
    formRef.value?.clearValidate()
    await loadHistory()
  }
  catch {}
  finally {
    submitting.value = false
  }
}

async function cancelFine(row: UserFine) {
  try {
    await message.confirm(`确认撤销罚单 ${row.no}？`)
    await UserFineApi.cancelUserFine(row.id)
    message.success('已撤销')
    await loadHistory()
  }
  catch {}
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="`罚款 - ${member?.nickname || member?.userId || ''}`"
    width="760px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="90px">
      <el-form-item label="罚款内容" prop="content">
        <Editor v-model="formData.content" height="220px" />
      </el-form-item>
      <el-form-item label="罚款金额" prop="amountYuan">
        <el-input-number
          v-model="formData.amountYuan"
          :min="0.01"
          :max="9999999"
          :precision="2"
          :step="1"
          controls-position="right"
          class="!w-[220px]"
        />
        <span class="ml-2 text-[#909399]">元</span>
      </el-form-item>
    </el-form>

    <el-divider content-position="left">
      罚款记录
    </el-divider>
    <el-table v-loading="historyLoading" :data="historyList" max-height="260" size="small">
      <el-table-column label="罚单号" prop="no" min-width="150" />
      <el-table-column label="金额" width="100" align="center">
        <template #default="{ row }">
          ¥{{ fenToYuan(row.amount) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="statusMap[row.status]?.type" size="small">
            {{ statusMap[row.status]?.text || '-' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="时间" min-width="200">
        <template #default="{ row }">
          <div class="flex flex-col text-xs">
            <span>开单：{{ row.createTime ? formatDate(row.createTime) : '--' }}</span>
            <span v-if="row.status === 1">缴纳：{{ row.payTime ? formatDate(row.payTime) : '--' }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80" align="center">
        <template #default="{ row }">
          <el-button v-if="row.status === 0" link type="danger" @click="cancelFine(row)">
            撤销
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <el-button :disabled="submitting" @click="visible = false">
        关闭
      </el-button>
      <el-button type="primary" :loading="submitting" @click="submit">
        确认罚款
      </el-button>
    </template>
  </el-dialog>
</template>

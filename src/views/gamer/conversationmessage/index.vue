<script setup lang="ts">
import type { ConversationMessage } from '@/api/gamer/conversationmessage'
import { ConversationMessageApi } from '@/api/gamer/conversationmessage'
import download from '@/utils/download'
import { dateFormatter } from '@/utils/formatTime'
import { isEmpty } from '@/utils/is'

import ConversationMessageForm from './ConversationMessageForm.vue'

/** 会话消息 列表 */
defineOptions({ name: 'ConversationMessage' })

// 列表的总页数
const props = defineProps<{ embed?: boolean, conversationId?: number }>()
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<ConversationMessage[]>([]) // 列表的数据
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  conversationId: undefined,
  senderId: undefined,
  senderType: undefined,
  messageType: undefined,
  isRead: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

function messageTypeLabel(type?: number) {
  switch (type) {
    case 1: return '文本'
    case 2: return '图片'
    case 3: return '文件'
    case 4: return '音频'
    case 5: return '视频'
    case 6: return '游戏名片'

    default: return String(type ?? '')
  }
}
function messageTypeTag(type?: number) {
  switch (type) {
    case 1: return 'primary'
    case 2: return 'success'
    case 3: return 'warning'
    case 4: return 'info'
    case 5: return 'danger'
    default: return 'primary'
  }
}

/** 查询列表 */
async function getList() {
  loading.value = true
  try {
    const data = await ConversationMessageApi.getConversationMessagePage(queryParams)
    list.value = data.list
    total.value = data.total
  }
  finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  queryFormRef.value.resetFields()
  handleQuery()
}

// 外部传入会话ID时，自动带参查询（放在函数定义之后避免 lint use-before-define）
watch(
  () => props.conversationId,
  (val) => {
    if (val) {
      // @ts-expect-error allow assign number
      queryParams.conversationId = val
      handleQuery()
    }
  },
  { immediate: true },
)

/** 添加/修改操作 */
const formRef = ref()
function openForm(type: string, id?: number) {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
async function handleDelete(id: number) {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await ConversationMessageApi.deleteConversationMessage(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  }
  catch {}
}

const checkedIds = ref<number[]>([])

/** 批量删除会话消息 */
async function handleDeleteBatch() {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await ConversationMessageApi.deleteConversationMessageList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  }
  catch {}
}

function handleRowCheckboxChange(records: ConversationMessage[]) {
  checkedIds.value = records.map(item => item.id!)
}

/** 导出按钮操作 */
async function handleExport() {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await ConversationMessageApi.exportConversationMessage(queryParams)
    download.excel(data, '会话消息.xls')
  }
  catch {
  }
  finally {
    exportLoading.value = false
  }
}

/** 初始化 */
onMounted(() => {
  getList()
})
</script>

<template>
  <ContentWrap v-if="!props.embed">
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryFormRef"
      class="-mb-[15px]"
      :model="queryParams"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="会话ID" prop="conversationId">
        <el-input
          v-model="queryParams.conversationId"
          placeholder="请输入会话ID"
          clearable
          class="!w-[240px]"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="发送人类型" prop="senderType">
        <el-select
          v-model="queryParams.senderType"
          placeholder="请选择发送人类型"
          clearable
          class="!w-[240px]"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="消息类型" prop="messageType">
        <el-select
          v-model="queryParams.messageType"
          placeholder="请选择消息类型"
          clearable
          class="!w-[240px]"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>

      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-[220px]"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" class="mr-[5px]" /> 搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-[5px]" /> 重置
        </el-button>
        <el-button
          v-hasPermi="['gamer:conversation-message:create']"
          type="primary"
          plain
          @click="openForm('create')"
        >
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button>
        <el-button
          v-hasPermi="['gamer:conversation-message:export']"
          type="success"
          plain
          :loading="exportLoading"
          @click="handleExport"
        >
          <Icon icon="ep:download" class="mr-[5px]" /> 导出
        </el-button>
        <el-button
          v-hasPermi="['gamer:conversation-message:delete']"
          type="danger"
          plain
          :disabled="isEmpty(checkedIds)"
          @click="handleDeleteBatch"
        >
          <Icon icon="ep:delete" class="mr-[5px]" /> 批量删除
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      v-loading="loading"
      row-key="id"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
      @selection-change="handleRowCheckboxChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="消息ID" align="center" prop="id" />
      <el-table-column label="会话ID" align="center" prop="conversationId" />
      <el-table-column label="发送人ID" align="center" prop="senderId" />
      <el-table-column label="发送人" align="center" prop="senderType">
        <template #default="{ row }">
          <el-tag :type="row.senderType === 1 ? 'info' : row.senderType === 2 ? 'primary' : 'info'">
            {{ row.senderType === 1 ? '系统' : row.senderType === 2 ? '用户' : row.senderType }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="消息类型" align="center" prop="messageType">
        <template #default="{ row }">
          <el-tag :type="messageTypeTag(row.messageType)">
            {{ messageTypeLabel(row.messageType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="内容" align="center" min-width="200">
        <template #default="{ row }">
          <span v-if="row.messageType === 1">{{ row.messageContent }}</span>
          <el-image
            v-else-if="row.messageType === 2"
            :src="row.fileUrl"
            :preview-src-list="[row.fileUrl]"
            fit="cover"
            style="height: 60px; width: 60px"
          />
          <el-link
            v-else-if="row.messageType === 3"
            :href="row.fileUrl"
            :download="row.fileName || ''"
            target="_blank"
            type="primary"
          >
            {{ row.fileName || '下载文件' }}
          </el-link>
          <audio v-else-if="row.messageType === 4" :src="row.fileUrl" controls style="height: 32px" />
          <video v-else-if="row.messageType === 5" :src="row.fileUrl" controls style="width: 200px; max-width: 100%" />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="是否已读" align="center" prop="isRead">
        <template #default="slotProps">
          {{ slotProps.row.isRead ? '是' : '否' }}
        </template>
      </el-table-column>
      <el-table-column
        label="已读时间"
        align="center"
        prop="readAt"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="发送时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column v-if="!props.embed" label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            v-hasPermi="['gamer:conversation-message:update']"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-hasPermi="['gamer:conversation-message:delete']"
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <ConversationMessageForm ref="formRef" @success="getList" />
</template>

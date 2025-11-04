<script setup lang="ts">
import type { AccOrderConversationMessage } from '@/api/gamer/accorderconversationmessage'
import { AccOrderConversationMessageApi } from '@/api/gamer/accorderconversationmessage'
import { dateFormatter } from '@/utils/formatTime'

/** 陪玩订单会话消息 列表 */
defineOptions({ name: 'AccOrderConversationMessage' })

// 列表的总页数
const props = defineProps<{ embed?: boolean, conversationId?: number }>()
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<AccOrderConversationMessage[]>([]) // 列表的数据
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  orderId: undefined,
  conversationId: undefined,
  senderType: undefined,
  messageType: undefined,
  createTime: [],
})

/** 查询列表 */
async function getList() {
  loading.value = true
  try {
    const data = await AccOrderConversationMessageApi.getAccOrderConversationMessagePage(queryParams)
    list.value = data.list
    console.log()
    total.value = data.total
  }
  finally {
    loading.value = false
  }
}

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
    await AccOrderConversationMessageApi.deleteAccOrderConversationMessage(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  }
  catch { }
}

/** 初始化 */
onMounted(() => {
  getList()
})

// 外部传入会话ID时，自动带参查询
watch(
  () => props.conversationId,
  (val) => {
    if (val) {
      // @ts-expect-error assign number
      queryParams.conversationId = val
      getList()
    }
  },
  { immediate: true },
)

function orderSenderTypeLabel(type?: number) {
  switch (type) {
    case 1: return '客户'
    case 2: return '接单人'
    case 3: return '管理员'
    case 4: return '系统'
    default: return String(type ?? '')
  }
}
function orderSenderTypeTag(type?: number) {
  switch (type) {
    case 1: return 'primary'
    case 2: return 'success'
    case 3: return 'warning'
    case 4: return 'info'
    default: return 'primary'
  }
}
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
</script>

<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <!-- <el-form
      ref="queryFormRef"
      class="-mb-[15px]"
      :model="queryParams"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="订单ID" prop="orderId">
        <el-input
          v-model="queryParams.orderId"
          placeholder="请输入订单ID"
          clearable
          class="!w-[240px]"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
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
          v-hasPermi="['gamer:order-conversation-message:create']"
          type="primary"
          plain
          @click="openForm('create')"
        >
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button>
        <el-button
          v-hasPermi="['gamer:order-conversation-message:export']"
          type="success"
          plain
          :loading="exportLoading"
          @click="handleExport"
        >
          <Icon icon="ep:download" class="mr-[5px]" /> 导出
        </el-button>
        <el-button
          v-hasPermi="['gamer:order-conversation-message:delete']"
          type="danger"
          plain
          :disabled="isEmpty(checkedIds)"
          @click="handleDeleteBatch"
        >
          <Icon icon="ep:delete" class="mr-[5px]" /> 批量删除
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap> -->

    <!-- 列表 -->
    <ContentWrap>
      <el-table
        v-loading="loading"
        row-key="id"
        :data="list"
        :stripe="true"
        :show-overflow-tooltip="true"
      >
        <el-table-column label="消息ID" align="center" prop="id" />
        <el-table-column label="订单ID" align="center" prop="orderId" />
        <el-table-column label="会话ID" align="center" prop="conversationId" />
        <el-table-column label="发送人ID" align="center" prop="senderId" />
        <el-table-column label="发送人" align="center" prop="senderType">
          <template #default="{ row }">
            <el-tag :type="orderSenderTypeTag(row.senderType)">
              {{ orderSenderTypeLabel(row.senderType) }}
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
              v-else-if="row.messageType === 2" :src="row.fileUrl" :preview-src-list="[row.fileUrl]" fit="cover"
              style="height: 60px; width: 60px"
            />
            <el-link
              v-else-if="row.messageType === 3" :href="row.fileUrl" :download="row.fileName || ''"
              target="_blank" type="primary"
            >
              {{ row.fileName || '下载文件' }}
            </el-link>
            <audio v-else-if="row.messageType === 4" :src="row.fileUrl" controls style="height: 32px" />
            <video
              v-else-if="row.messageType === 5" :src="row.fileUrl" controls
              style="width: 200px; max-width: 100%"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" :formatter="dateFormatter" width="180px" />
        <el-table-column v-if="!props.embed" label="操作" align="center" min-width="120px">
          <template #default="scope">
            <el-button
              v-hasPermi="['gamer:order-conversation-message:update']"
              link
              type="primary"
              @click="openForm('update', scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              v-hasPermi="['gamer:order-conversation-message:delete']"
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
        v-model:page="queryParams.pageNo" v-model:limit="queryParams.pageSize" :total="total"
        @pagination="getList"
      />
    </ContentWrap>

    <!-- 表单弹窗：添加/修改 -->
    <!-- <AccOrderConversationMessageForm ref="formRef" @success="getList" /> -->
  </contentwrap>
</template>

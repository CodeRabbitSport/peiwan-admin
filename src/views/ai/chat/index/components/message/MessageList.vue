<script setup lang="ts">
import type { PropType } from 'vue'

import { ArrowDownBold, Edit, RefreshRight } from '@element-plus/icons-vue'
import { useClipboard } from '@vueuse/core'

import type { ChatConversationVO } from '@/api/ai/chat/conversation'
import type { ChatMessageVO } from '@/api/ai/chat/message'
import { ChatMessageApi } from '@/api/ai/chat/message'
import roleAvatarDefaultImg from '@/assets/ai/gpt.svg'
import userAvatarDefaultImg from '@/assets/imgs/logo.png'
import MarkdownView from '@/components/MarkdownView/index.vue'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'
import { formatDate } from '@/utils/formatTime'

import MessageFiles from './MessageFiles.vue'
import MessageKnowledge from './MessageKnowledge.vue'
import MessageReasoning from './MessageReasoning.vue'
import MessageWebSearch from './MessageWebSearch.vue'

// 定义 props
const props = defineProps({
  conversation: {
    type: Object as PropType<ChatConversationVO>,
    required: true,
  },
  list: {
    type: Array as PropType<ChatMessageVO[]>,
    required: true,
  },
}) // 消息列表

const emits = defineEmits(['onDeleteSuccess', 'onRefresh', 'onEdit']); const message = useMessage() // 消息弹窗
const { copy } = useClipboard() // 初始化 copy 到粘贴板
const userStore = useUserStore()
const appStore = useAppStore()

// 判断"消息列表"滚动的位置(用于判断是否需要滚动到消息最下方)
const messageContainer: any = ref(null)
const isScrolling = ref(false) // 用于判断用户是否在滚动

const userAvatar = computed(() => userStore.user.avatar || appStore.getSiteLogoUrl || userAvatarDefaultImg)
const roleAvatar = computed(() => props.conversation.roleAvatar ?? roleAvatarDefaultImg)

const { list } = toRefs(props) // 定义 emits

// ============ 处理对话滚动 ==============

/** 滚动到底部 */
async function scrollToBottom(isIgnore?: boolean) {
  // 注意要使用 nextTick 以免获取不到 dom
  await nextTick()
  if (isIgnore || !isScrolling.value) {
    messageContainer.value.scrollTop
      = messageContainer.value.scrollHeight - messageContainer.value.offsetHeight
  }
}

function handleScroll() {
  const scrollContainer = messageContainer.value
  const scrollTop = scrollContainer.scrollTop
  const scrollHeight = scrollContainer.scrollHeight
  const offsetHeight = scrollContainer.offsetHeight
  if (scrollTop + offsetHeight < scrollHeight - 100) {
    // 用户开始滚动并在最底部之上，取消保持在最底部的效果
    isScrolling.value = true
  }
  else {
    // 用户停止滚动并滚动到最底部，开启保持到最底部的效果
    isScrolling.value = false
  }
}

/** 回到底部 */
async function handleGoBottom() {
  const scrollContainer = messageContainer.value
  scrollContainer.scrollTop = scrollContainer.scrollHeight
}

/** 回到顶部 */
async function handlerGoTop() {
  const scrollContainer = messageContainer.value
  scrollContainer.scrollTop = 0
}

defineExpose({ scrollToBottom, handlerGoTop }) // 提供方法给 parent 调用

// ============ 处理消息操作 ==============

/** 复制 */
async function copyContent(content: string) {
  await copy(content)
  message.success('复制成功！')
}

/** 删除 */
async function onDelete(id) {
  // 删除 message
  await ChatMessageApi.deleteChatMessage(id)
  message.success('删除成功！')
  // 回调
  emits('onDeleteSuccess')
}

/** 刷新 */
async function onRefresh(message: ChatMessageVO) {
  emits('onRefresh', message)
}

/** 编辑 */
async function onEdit(message: ChatMessageVO) {
  emits('onEdit', message)
}

/** 初始化 */
onMounted(async () => {
  messageContainer.value.addEventListener('scroll', handleScroll)
})
</script>

<template>
  <div ref="messageContainer" class="relative h-100% overflow-y-auto">
    <div v-for="(item, index) in list" :key="index" class="flex flex-col overflow-y-hidden px-20px">
      <!-- 靠左 message：system、assistant 类型 -->
      <div v-if="item.type !== 'user'" class="mt-50px flex flex-row">
        <div class="avatar">
          <el-avatar :src="roleAvatar" />
        </div>
        <div class="mx-15px flex flex-col text-left">
          <div>
            <el-text class="text-left leading-30px">
              {{ formatDate(item.createTime) }}
            </el-text>
          </div>
          <div
            ref="markdownViewRef"
            class="relative flex flex-col break-words rounded-10px bg-[var(--el-fill-color-light)] px-10px pb-5px pt-10px shadow-[0_0_0_1px_var(--el-border-color-light)]"
          >
            <MessageReasoning
              :reasoning-content="item.reasoningContent || ''"
              :content="item.content || ''"
            />
            <MarkdownView
              class="text-[0.95rem] text-[var(--el-text-color-primary)]"
              :content="item.content"
            />
            <MessageFiles :attachment-urls="item.attachmentUrls" />
            <MessageKnowledge v-if="item.segments" :segments="item.segments" />
            <MessageWebSearch v-if="item.webSearchPages" :web-search-pages="item.webSearchPages" />
          </div>
          <div class="mt-8px flex flex-row">
            <el-button
              class="flex items-center bg-transparent hover:cursor-pointer hover:bg-[var(--el-fill-color-lighter)]"
              link
              @click="copyContent(item.content)"
            >
              <img class="h-20px" src="@/assets/ai/copy.svg">
            </el-button>
            <el-button
              v-if="item.id > 0"
              class="flex items-center bg-transparent hover:cursor-pointer hover:bg-[var(--el-fill-color-lighter)]"
              link
              @click="onDelete(item.id)"
            >
              <img class="h-17px" src="@/assets/ai/delete.svg">
            </el-button>
          </div>
        </div>
      </div>
      <!-- 靠右 message：user 类型 -->
      <div v-if="item.type === 'user'" class="mt-50px flex flex-row-reverse justify-start">
        <div class="avatar">
          <el-avatar :src="userAvatar" />
        </div>
        <div class="mx-15px flex flex-col text-left">
          <div>
            <el-text class="text-left leading-30px">
              {{ formatDate(item.createTime) }}
            </el-text>
          </div>
          <!-- 附件显示行 -->
          <div
            v-if="item.attachmentUrls && item.attachmentUrls.length > 0"
            class="mb-8px flex flex-row-reverse"
          >
            <MessageFiles :attachment-urls="item.attachmentUrls" />
          </div>
          <!-- 文本内容行 -->
          <div class="flex flex-row-reverse">
            <div
              v-if="item.content && item.content.trim()"
              class="inline w-auto whitespace-pre-wrap break-words rounded-10px bg-[var(--el-color-primary)] p-10px text-[0.95rem] text-[var(--el-color-white)] shadow-[0_0_0_1px_var(--el-color-primary)]"
            >
              {{ item.content }}
            </div>
          </div>
          <div class="mt-8px flex flex-row-reverse">
            <el-button
              class="flex items-center bg-transparent hover:cursor-pointer hover:bg-[var(--el-fill-color-lighter)]"
              link
              @click="copyContent(item.content)"
            >
              <img class="h-20px" src="@/assets/ai/copy.svg">
            </el-button>
            <el-button
              class="flex items-center bg-transparent hover:cursor-pointer hover:bg-[var(--el-fill-color-lighter)]"
              link
              @click="onDelete(item.id)"
            >
              <img class="mr-12px h-17px" src="@/assets/ai/delete.svg">
            </el-button>
            <el-button
              class="flex items-center bg-transparent hover:cursor-pointer hover:bg-[var(--el-fill-color-lighter)]"
              link
              @click="onRefresh(item)"
            >
              <el-icon size="17">
                <RefreshRight />
              </el-icon>
            </el-button>
            <el-button
              class="flex items-center bg-transparent hover:cursor-pointer hover:bg-[var(--el-fill-color-lighter)]"
              link
              @click="onEdit(item)"
            >
              <el-icon size="17">
                <Edit />
              </el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- 回到底部 -->
  <div v-if="isScrolling" class="absolute bottom-0 right-50% z-1000" @click="handleGoBottom">
    <el-button :icon="ArrowDownBold" circle />
  </div>
</template>

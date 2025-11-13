<script setup lang="ts">
import { formatDate } from '@/utils/formatTime'

const props = defineProps<{
  items: any[]
  height?: string
}>()

const height = computed(() => props.height || '70vh')
</script>

<template>
  <div class="chat-container" :style="{ height }">
    <el-scrollbar class="chat-scroll">
      <div class="chat-inner">
        <div
          v-for="item in items"
          :key="item.id"
          class="chat-row left"
        >
          <el-avatar :src="(item as any).senderAvatar" class="avatar" />
          <div class="content">
            <div class="meta">
              {{ item.senderId === 0 ? "系统" : (item as any).senderNickname }}
              <el-tag v-if="(item as any).senderType === 1" size="small" type="primary" style="margin-left: 6px">
                用户
              </el-tag>
              <el-tag v-else-if="(item as any).senderType === 2" size="small" type="success" style="margin-left: 6px">
                接单人
              </el-tag>
            </div>
            <div class="bubble">
              <template v-if="(item as any).messageType === 1">
                {{ (item as any).messageContent }}
              </template>
              <el-image
                v-else-if="(item as any).messageType === 2"
                :src="(item as any).fileUrl"
                :preview-src-list="[(item as any).fileUrl]"
                fit="contain"
                class="img"
                preview-teleported
              />
              <el-link
                v-else-if="(item as any).messageType === 3"
                :href="(item as any).fileUrl"
                :download="(item as any).fileName || ''"
                target="_blank"
                type="primary"
              >
                {{ (item as any).fileName || '下载文件' }}
              </el-link>
              <audio v-else-if="(item as any).messageType === 4" :src="(item as any).fileUrl" controls class="audio" />
              <video v-else-if="(item as any).messageType === 5" :src="(item as any).fileUrl" controls class="video" />
              <span v-else>-</span>
            </div>
            <div class="time">
              {{ formatDate((item as any).createTime) }}
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<style scoped>
.chat-container {
  display: flex;
}
.chat-scroll {
  width: 100%;
}
.chat-inner {
  padding: 10px 12px;
  width: 100%;
}
.chat-row {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
}
.chat-row.left {
  justify-content: flex-start;
}
.avatar {
  width: 40px;
  height: 40px;
}
.content {
  max-width: 80%;
  display: flex;
  flex-direction: column;
}
.meta {
  font-size: 12px;
  color: #666;
  margin: 0 8px 6px;
}
.bubble {
  max-width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fff;
  color: #333;
  word-break: break-word;
}
.bubble .img {
  max-width: 320px;
}
.bubble .audio {
  height: 32px;
}
.bubble .video {
  width: 320px;
  max-width: 100%;
}
.time {
  font-size: 12px;
  color: #999;
  margin: 6px 8px 0;
}
</style>

<script setup lang="ts">
import type { LoadingOptionsResolved } from 'element-plus'
import type { PropType } from 'vue'

import { Delete, Download, More, RefreshRight } from '@element-plus/icons-vue'
import { ElLoading } from 'element-plus'

import type { ImageMidjourneyButtonsVO, ImageVO } from '@/api/ai/image'
import { AiImageStatusEnum } from '@/views/ai/utils/constants'

// 消息

const props = defineProps({
  detail: {
    type: Object as PropType<ImageVO>,
    require: true,
  },
})
const emits = defineEmits(['onBtnClick', 'onMjBtnClick'])
const message = useMessage()
const cardImageRef = ref<any>() // 卡片 image ref
const cardImageLoadingInstance = ref<any>() // 卡片 image ref

/** 处理点击事件  */
async function handleButtonClick(type, detail: ImageVO) {
  emits('onBtnClick', type, detail)
}

/** 处理 Midjourney 按钮点击事件  */
async function handleMidjourneyBtnClick(button: ImageMidjourneyButtonsVO) {
  // 确认窗体
  await message.confirm(`确认操作 "${button.label} ${button.emoji}" ?`)
  emits('onMjBtnClick', button, props.detail)
}

// emits

/** 监听详情 */
const { detail } = toRefs(props)
watch(detail, async (newVal, oldVal) => {
  await handleLoading(newVal.status as string)
})

/** 处理加载状态 */
async function handleLoading(status: number) {
  // 情况一：如果是生成中，则设置加载中的 loading
  if (status === AiImageStatusEnum.IN_PROGRESS) {
    cardImageLoadingInstance.value = ElLoading.service({
      target: cardImageRef.value,
      text: '生成中...',
    } as LoadingOptionsResolved)
    // 情况二：如果已经生成结束，则移除 loading
  }
  else {
    if (cardImageLoadingInstance.value) {
      cardImageLoadingInstance.value.close()
      cardImageLoadingInstance.value = null
    }
  }
}

/** 初始化 */
onMounted(async () => {
  await handleLoading(props.detail.status as string)
})
</script>

<template>
  <el-card
    body-class=""
    class="!relative !h-auto !w-80 !flex !flex-col !rounded-[10px]"
  >
    <div class="!flex !flex-row !justify-between">
      <div>
        <el-button v-if="detail?.status === AiImageStatusEnum.IN_PROGRESS" type="primary" text bg>
          生成中
        </el-button>
        <el-button v-else-if="detail?.status === AiImageStatusEnum.SUCCESS" text bg>
          已完成
        </el-button>
        <el-button v-else-if="detail?.status === AiImageStatusEnum.FAIL" type="danger" text bg>
          异常
        </el-button>
      </div>
      <!-- 操作区 -->
      <div>
        <el-button
          class="!m-0 !p-[10px]"
          text
          :icon="Download"
          @click="handleButtonClick('download', detail)"
        />
        <el-button
          class="!m-0 !p-[10px]"
          text
          :icon="RefreshRight"
          @click="handleButtonClick('regeneration', detail)"
        />
        <el-button
          class="!m-0 !p-[10px]"
          text
          :icon="Delete"
          @click="handleButtonClick('delete', detail)"
        />
        <el-button
          class="!m-0 !p-[10px]"
          text
          :icon="More"
          @click="handleButtonClick('more', detail)"
        />
      </div>
    </div>
    <div ref="cardImageRef" class="!mt-[20px] !h-[280px] !flex-1 !overflow-hidden">
      <el-image
        class="!w-full !rounded-[10px]"
        :src="detail?.picUrl"
        :preview-src-list="[detail.picUrl]"
        preview-teleported
      />
      <div v-if="detail?.status === AiImageStatusEnum.FAIL">
        {{ detail?.errorMessage }}
      </div>
    </div>
    <!-- Midjourney 专属操作 -->
    <div class="!mt-[5px] !w-full !flex !flex-row !flex-wrap !justify-start">
      <el-button
        v-for="button in detail?.buttons"
        :key="button"
        size="small"
        class="ml-0 mr-[10px] mt-[5px] min-w-[40px]"
        @click="handleMidjourneyBtnClick(button)"
      >
        {{ button.label }}{{ button.emoji }}
      </el-button>
    </div>
  </el-card>
</template>

<script lang="ts" setup>
// import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
import { ServiceOrderApi } from '@/api/gamer/serviceorder'
import routerSearch from '@/components/RouterSearch/index.vue'
import { useDesign } from '@/hooks/web/useDesign'
// import { isDark } from '@/utils/is'
import { useEmitt } from '@/hooks/web/useEmitt'
import { useAppStore } from '@/store/modules/app'

defineOptions({ name: 'APP' })

const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('app')
const appStore = useAppStore()
const currentSize = computed(() => appStore.getCurrentSize)
const greyMode = computed(() => appStore.getGreyMode)
// const { wsCache } = useCache()

// 根据浏览器当前主题设置系统主题色
// const setDefaultTheme = () => {
//   let isDarkTheme = wsCache.get(CACHE_KEY.IS_DARK)
//   if (isDarkTheme === null) {
//     isDarkTheme = isDark()
//   }
//   appStore.setIsDark(isDarkTheme)
// }
// setDefaultTheme()

// 轮训订单，如果有新订单播放音乐
const firstOrderId = ref<number | null>(null) // 存储第一条订单的 id
const pollOrderInterval = ref<ReturnType<typeof setInterval> | null>(null) // 轮询定时器
const audio = ref<HTMLAudioElement | null>(null) // 音频对象
const orderSoundEnabled = ref(false) // 铃声开关状态

// 初始化音频
onMounted(() => {
  audio.value = new Audio('/order.MP3')
  audio.value.preload = 'auto'
})

// 接收头部的开关事件
useEmitt({
  name: 'order-sound-toggle',
  callback: (enabled: boolean) => {
    orderSoundEnabled.value = enabled
  },
})

watch(orderSoundEnabled, (enabled) => {
  if (enabled) {
    enableOrderSound()
  }
  else {
    stopPollOrder()
  }
})

async function enableOrderSound() {
  await initFirstOrderId()
  startPollOrder()
}

// 初始化第一条订单 id
async function initFirstOrderId() {
  try {
    const data = await ServiceOrderApi.getServiceOrderPage({
      pageNo: 1,
      pageSize: 1,
      payStatus: 1,
    })
    if (data.list && data.list.length > 0) {
      firstOrderId.value = data.list[0].id
    }
  }
  catch {
    // 初始化失败，忽略
  }
}

// 轮询订单
async function pollOrder() {
  try {
    const data = await ServiceOrderApi.getServiceOrderPage({
      pageNo: 1,
      pageSize: 1,
      payStatus: 1,
    })

    if (data.list && data.list.length > 0) {
      const currentFirstOrderId = data.list[0].id
      // 如果第一条订单 id 不同，说明有新订单
      if (firstOrderId.value !== currentFirstOrderId) {
        // 播放音乐
        if (audio.value) {
          audio.value.play().catch(() => {
            // 播放失败，忽略（可能是用户未交互）
          })
        }
      }
      // 更新存储的第一条订单 id
      firstOrderId.value = currentFirstOrderId
    }
  }
  catch {
    // 轮询失败，忽略
  }
}

// 开始轮询
function startPollOrder() {
  stopPollOrder()
  pollOrderInterval.value = setInterval(() => {
    pollOrder()
  }, 10000)
  pollOrder()
}

function stopPollOrder() {
  if (pollOrderInterval.value) {
    clearInterval(pollOrderInterval.value)
    pollOrderInterval.value = null
  }
}

// 清理
onUnmounted(() => {
  stopPollOrder()
  if (audio.value) {
    audio.value.pause()
    audio.value = null
  }
})
</script>

<template>
  <ConfigGlobal :size="currentSize">
    <RouterView :class="greyMode ? `${prefixCls}-grey-mode` : ''" />
    <routerSearch />
  </ConfigGlobal>
</template>

<style lang="scss">
$prefix-cls: #{$namespace}-app;

.size {
  width: 100%;
  height: 100%;
}

html,
body {
  @extend .size;

  padding: 0 !important;
  margin: 0;
  overflow: hidden;

  #app {
    @extend .size;
  }
}

.#{$prefix-cls}-grey-mode {
  filter: grayscale(100%);
}
</style>
align items-center

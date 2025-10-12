<script setup lang="ts">
import type { ComponentSize } from 'element-plus'

import { useWindowSize } from '@vueuse/core'
import { ElConfigProvider } from 'element-plus'
import { computed, onMounted, provide, watch } from 'vue'

import { useDesign } from '@/hooks/web/useDesign'
import { useAppStore } from '@/store/modules/app'
import { useLocaleStore } from '@/store/modules/locale'
import { setCssVar } from '@/utils'
import { propTypes } from '@/utils/propTypes'

const props = defineProps({
  size: propTypes.oneOf<ComponentSize>(['default', 'small', 'large']).def('default'),
})

const { variables } = useDesign()

const appStore = useAppStore()

provide('configGlobal', props)

// 初始化主题与暗黑调色
onMounted(() => {
  // 依据缓存中的暗黑状态，应用对应的菜单/头部调色
  appStore.setIsDark(appStore.getIsDark)
  appStore.setCssVarTheme()
})

const { width } = useWindowSize()

// 监听窗口变化
watch(
  () => width.value,
  (width: number) => {
    if (width < 768) {
      !appStore.getMobile ? appStore.setMobile(true) : undefined
      setCssVar('--left-menu-min-width', '0')
      appStore.setCollapse(true)
      appStore.getLayout !== 'classic' ? appStore.setLayout('classic') : undefined
    }
    else {
      appStore.getMobile ? appStore.setMobile(false) : undefined
      setCssVar('--left-menu-min-width', '80px')
    }
  },
  {
    immediate: true,
  },
)

// 多语言相关
const localeStore = useLocaleStore()

const currentLocale = computed(() => localeStore.currentLocale)
</script>

<template>
  <ElConfigProvider
    :namespace="variables.elNamespace"
    :locale="currentLocale.elLocale"
    :message="{ max: 5 }"
    :dialog="{ alignCenter: true }"
    :size="size"
  >
    <slot />
  </ElConfigProvider>
</template>

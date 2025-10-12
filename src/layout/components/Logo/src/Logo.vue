<script lang="ts" setup>
import { computed, onMounted, ref, unref, watch } from 'vue'

import { useDesign } from '@/hooks/web/useDesign'
import { useAppStore } from '@/store/modules/app'

defineOptions({ name: 'Logo' })

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('logo')

const appStore = useAppStore()

const show = ref(true)

const title = computed(() => appStore.getTitle)

const layout = computed(() => appStore.getLayout)

const collapse = computed(() => appStore.getCollapse)

onMounted(() => {
  if (unref(collapse)) show.value = false
})

watch(
  () => collapse.value,
  (collapse: boolean) => {
    if (unref(layout) === 'topLeft' || unref(layout) === 'cutMenu') {
      show.value = true
      return
    }
    if (!collapse) {
      setTimeout(() => {
        show.value = !collapse
      }, 400)
    }
    else {
      show.value = !collapse
    }
  },
)

watch(
  () => layout.value,
  (layout) => {
    if (layout === 'top' || layout === 'cutMenu') {
      show.value = true
    }
    else {
      if (unref(collapse)) {
        show.value = false
      }
      else {
        show.value = true
      }
    }
  },
)
</script>

<template>
  <div>
    <router-link
      class="relative flex cursor-pointer items-center overflow-hidden pl-[8px] decoration-none !h-[var(--logo-height)]" :class="[
        prefixCls,
        layout !== 'classic' ? `${prefixCls}__Top` : '',
      ]"
      to="/"
    >
      <img
        class="h-[calc(var(--logo-height)-10px)] w-[calc(var(--logo-height)-10px)]"
        src="@/assets/imgs/logo.png"
      >
      <div
        v-if="show"
        class="ml-[10px] text-[16px] font-bold"
        :style="{ color: 'var(--logo-title-text-color)' }"
      >
        {{ title }}
      </div>
    </router-link>
  </div>
</template>

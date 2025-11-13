<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { isPhone } from '@/utils/device'

const props = withDefaults(defineProps<{
  itemSelector?: string
  expandText?: string
  collapseText?: string
}>(), {
  itemSelector: '.el-form-item:not([data-rf-toggle])',
  expandText: '展开',
  collapseText: '收起',
})

const rootRef = ref<HTMLElement | null>(null)
const expanded = ref(false)
const firstRowIdxSet = ref<Set<number>>(new Set())
const hasOverflow = ref(false)
const hasOverflowOnce = ref(false)

let rafId = 0

function scheduleMeasure() {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    measure()
    rafId = 0
  })
}

function measure() {
  const root = rootRef.value
  if (!root) return
  const items = Array.from(root.querySelectorAll<HTMLElement>(props.itemSelector))
  items.forEach((el, idx) => el.setAttribute('data-rf-idx', String(idx)))
  if (!items.length) {
    firstRowIdxSet.value = new Set()
    hasOverflow.value = false
    return
  }
  // 先全部显示，避免上一次隐藏影响本次测量
  items.forEach((el) => {
    el.style.display = ''
  })
  const tops = items.map(el => el.offsetTop)
  const minTop = Math.min(...tops)
  const firstRowIdx: number[] = []
  items.forEach((el, idx) => {
    if (el.offsetTop <= minTop + 2) firstRowIdx.push(idx)
  })
  firstRowIdxSet.value = new Set(firstRowIdx)
  hasOverflow.value = firstRowIdx.length < items.length
  if (hasOverflow.value) hasOverflowOnce.value = true
  applyVisibility()
}

function applyVisibility() {
  const root = rootRef.value
  if (!root) return
  const items = Array.from(root.querySelectorAll<HTMLElement>(props.itemSelector))
  items.forEach((el, idx) => {
    const inFirst = firstRowIdxSet.value.has(idx)
    const show = expanded.value || !isPhone() || inFirst
    el.style.display = show ? '' : 'none'
  })
}

function handleResize() {
  scheduleMeasure()
}

onMounted(async () => {
  await nextTick()
  // 初次渲染后测量（两次 rAF，确保布局稳定）
  scheduleMeasure()
  requestAnimationFrame(scheduleMeasure)

  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
})
// 折叠状态切换时仅更新可见性
watch(() => expanded.value, () => applyVisibility())
</script>

<template>
  <div ref="rootRef" class="rf-root">
    <slot />
    <el-form-item v-if="isPhone() && hasOverflow" data-rf-toggle>
      <el-button link type="primary" @click="expanded = !expanded">
        {{ expanded ? props.collapseText : props.expandText }}
      </el-button>
    </el-form-item>
  </div>
</template>

<style scoped>
.rf-root {
  display: contents;
}
</style>

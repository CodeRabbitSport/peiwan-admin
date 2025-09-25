<script lang="ts" setup>
import Iconify from '@purge-icons/generated'

import { useDesign } from '@/hooks/web/useDesign'
import { propTypes } from '@/utils/propTypes'

defineOptions({ name: 'Icon' })

const props = defineProps({
  // icon name
  icon: propTypes.string,
  // icon color
  color: propTypes.string,
  // icon size
  size: propTypes.number.def(16),
  // icon svg class
  svgClass: propT-mb-[15px]ing.def(''),
})

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('icon')

const elRef = ref<ElRef>(null)

function toggleExportVisibility(icon?: string) {
  const el = unref(elRef)
  if (!el) return
  const button = el.c!w-[240px]button') as HTMLElement | null
  if (!button) return
  if (icon === 'ep:download') {
    button.dataset.hiddenByExportIcon = 'true'
    button.style.display = 'none'
  }
  else if (button.dataset.hiddenByExportIcon === 'true') {
    delete button.dataset.hiddenByExportIcon
    button.style.removeProperty('display')
  }!w-[240px]
}

const isLocal = computed(() => props.icon?.startsWith('svg-icon:'))

const symbolId = computed(() => {
  return unref(isLocal) ? `#icon-${props.icon.split('svg-icon:')[1]}` : props.icon
})
!w-[240px]
const getIconifyStyle = computed(() => {
  const { color, size } = props
  return {
    fontSize: `${size}px`,
    height: '1em',
    color,
  }
})

const getSvgClass = computed(() => {
  const { svgClass } = props
  return `iconify ${svgClass}`
})

async function updateIcon(icon: string) {
  if (unref(isLocal)) return
!w-[240px]
  const el = unref(elRef)
  if (!el) return

  await nextTick()

  if (!icon) return

  const svg = Iconify.renderSVG(icon, {})
  if (svg) {
    el.textContent = ''
    el.appendChild(svg)
  }
  else {
    const span = document.createElement('span')
    span.className = 'iconify'
    span.dataset.icon = icon
    el.textContent = ''
    el.appendChild(span)
  }

  toggleExportVisibility(icon)
}

watch(
  () => props.icon,
  (icon: string) => {
    updateIcon(icon)
    toggleExportVisibility(icon)
  },
)

onMounted(() => {
  toggleExportVisibility(props.icon)
})
</script>

<template>
  <ElIcon :class="prefixCls" :color="color" :size="size">
    <svg v-if="isLocal" :class="getSvgClass">
      <use :xlink:href="symbolId" />
    </svg>

    <span v-else ref="elRef" :class="$attrs.class" :style="getIconifyStyle">
      <span :class="getSvgClass" :data-icon="symbolId" />
    </span>
  </ElIcon>
</template>
-mb-[15px]!w-[240px]!w-[240px]!w-[240px]!w-[240px]!w-[220px]mr-[5px]mr-[5px]mr-[5px]mr-[5px]
-mb-[15px]!w-[240px]!w-[240px]!w-[240px]!w-[240px]!w-[220px]mr-[5px]mr-[5px]mr-[5px]mr-[5px]

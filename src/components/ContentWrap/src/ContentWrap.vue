<script lang="ts" setup>
import { useDesign } from '@/hooks/web/useDesign'
import { propTypes } from '@/utils/propTypes'

defineOptions({ name: 'ContentWrap' })

defineProps({
  title: propTypes.string.def(''),
  message: propTypes.string.def(''),
  bodyStyle: propTypes.object.def({ padding: '10px' }),
})

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('content-wrap')
</script>

<template>
  <ElCard :body-style="bodyStyle" class="mb-[15px]" :class="[prefixCls]" shadow="never">
    <template v-if="title" #header>
      <div class="flex items-center">
        <span class="text-[16px] font-bold">{{ title }}</span>
        <ElTooltip v-if="message" effect="dark" placement="right">
          <template #content>
            <div class="max-w-[200px]">
              {{ message }}
            </div>
          </template>
          <Icon :size="14" class="ml-[5px]" icon="ep:question-filled" />
        </ElTooltip>
        <div class="flex flex-grow pl-[20px]">
          <slot name="header" />
        </div>
      </div>
    </template>
    <slot />
  </ElCard>
</template>

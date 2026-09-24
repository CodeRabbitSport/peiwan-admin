<template>
  <el-divider content-position="left">
    客户端展示
  </el-divider>

  <el-form-item label="显示顺序">
    <el-input-number v-model="display.sort" :min="0" :max="999" controls-position="right" class="!w-[160px]" />
    <span class="ml-8px text-12px text-gray-500">越小越靠前；留空排最后</span>
  </el-form-item>

  <el-form-item label="适用平台">
    <el-select
      v-model="display.platforms"
      class="!w-[420px]"
      multiple
      clearable
      collapse-tags
      collapse-tags-tooltip
      placeholder="请选择适用平台，可多选"
    >
      <el-option
        v-for="item in PAY_METHOD_PLATFORMS"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
    <div class="ml-8px text-12px text-gray-500">
      没选中的平台不会展示该支付方式
    </div>
  </el-form-item>

  <template v-for="platform in selectedPlatforms" :key="platform.value">
    <el-divider content-position="left">
      {{ platform.label }}
    </el-divider>
    <el-form-item label="安卓名称">
      <el-input
        v-model="display.configs[platform.value].name"
        clearable
        placeholder="留空则不在该平台的客户端支付弹窗中展示"
      />
    </el-form-item>
    <el-form-item label="安卓图标">
      <UploadImg v-model="display.configs[platform.value].icon" width="80px" height="80px" :show-btn-text="false" />
    </el-form-item>
    <el-form-item label="苹果名称">
      <el-input
        v-model="display.configs[platform.value].nameIos"
        clearable
        placeholder="留空则与安卓名称一致"
      />
    </el-form-item>
    <el-form-item label="苹果图标">
      <UploadImg v-model="display.configs[platform.value].iconIos" width="80px" height="80px" :show-btn-text="false" />
      <span class="ml-8px text-12px text-gray-500">留空则与安卓图标一致</span>
    </el-form-item>
  </template>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue'

defineOptions({ name: 'PayMethodDisplayFields' })

// 展示配置，绑定到渠道 config 的 display 字段
const display = defineModel<Record<string, any>>('display', { required: true })

// 适用平台，与客户端 platformKey 对应
const PAY_METHOD_PLATFORMS = [
  { value: 'mp-weixin', label: '微信小程序（不分系统）' },
  { value: 'mp-weixin-android', label: '微信小程序 · 安卓' },
  { value: 'mp-weixin-ios', label: '微信小程序 · iOS' },
  { value: 'h5', label: '公众号 / H5' },
  { value: 'app', label: 'App' },
  { value: 'all', label: '全部端' },
]

// 已选平台，按 PAY_METHOD_PLATFORMS 的顺序展示
const selectedPlatforms = computed(() =>
  PAY_METHOD_PLATFORMS.filter(item => (display.value.platforms || []).includes(item.value)),
)

// 平台增删时，同步 configs 的 key，避免残留无用配置
watch(
  () => display.value.platforms,
  (platforms: string[] | undefined) => {
    if (!display.value.configs)
      display.value.configs = {}
    const configs = display.value.configs
    for (const platform of platforms || []) {
      configs[platform] ||= { name: '', icon: '', nameIos: '', iconIos: '' }
    }
    for (const key of Object.keys(configs)) {
      if (!(platforms || []).includes(key))
        delete configs[key]
    }
  },
  { immediate: true, deep: true },
)
</script>

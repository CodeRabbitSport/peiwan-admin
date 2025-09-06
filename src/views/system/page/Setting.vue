<template>
  <ContentWrap>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="基础配置" name="basic">
        <el-form label-width="140px" class="max-w-[900px]">
          <el-form-item label="客户端 LOGO">
            <UploadImg v-model="form.baseClientLogo" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="首页配置" name="home">
        <el-form label-width="180px" class="max-w-[900px]">
          <el-form-item label="是否开启回收">
            <el-switch v-model="form.homeEnableRecycle" />
          </el-form-item>
          <el-form-item label="本周服务虚拟订单数">
            <el-input-number v-model="form.homeWeekVirtualOrders" :min="0" class="!w-full" />
          </el-form-item>
          <el-form-item label="弹窗公告内容">
            <Editor v-model="form.homePopupAnnouncement" height="220px" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="“我的”页面配置" name="mine">
        <el-form label-width="180px" class="max-w-[900px]">
          <el-form-item label="是否开启语音房功能">
            <el-switch v-model="form.myEnableVoiceRoom" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="隐私协议配置" name="privacy">
        <Editor v-model="form.privacyPolicyContent" height="350px" />
      </el-tab-pane>

      <el-tab-pane label="下单页面配置" name="place">
        <Editor v-model="form.placePageContent" height="350px" />
      </el-tab-pane>

      <el-tab-pane label="订单详情页配置" name="orderDetail">
        <Editor v-model="form.orderDetailPageContent" height="350px" />
      </el-tab-pane>

      <el-tab-pane label="打手入驻页配置" name="proApply">
        <Editor v-model="form.proGamerApplyPageContent" height="350px" />
      </el-tab-pane>

      <el-tab-pane label="打手中心页配置" name="proCenter">
        <Editor v-model="form.proGamerCenterPageContent" height="350px" />
      </el-tab-pane>

      <el-tab-pane label="俱乐部中心页配置" name="clubCenter">
        <Editor v-model="form.clubCenterPageContent" height="350px" />
      </el-tab-pane>
    </el-tabs>

    <div class="mt-4 flex gap-2">
      <el-button type="primary" :loading="saving" @click="saveCurrentTab">保存当前</el-button>
      <el-button :loading="saving" @click="saveAll">保存全部</el-button>
      <el-button @click="reload">刷新</el-button>
    </div>
  </ContentWrap>
</template>

<script setup lang="ts">
import { SystemConfigApi, SystemConfig } from '@/api/gamer/systemconfig'

const { t } = useI18n()
const message = useMessage()

const activeTab = ref('basic')
const saving = ref(false)

// 配置键定义
const CONFIG_KEYS = {
  baseClientLogo: 'base.clientLogo',
  homeEnableRecycle: 'home.enableRecycle',
  homeWeekVirtualOrders: 'home.weekVirtualOrders',
  homePopupAnnouncement: 'home.popupAnnouncement',
  myEnableVoiceRoom: 'my.enableVoiceRoom',
  privacyPolicyContent: 'privacy.policy',
  placePageContent: 'order.placePageContent',
  orderDetailPageContent: 'order.detailPageContent',
  proGamerApplyPageContent: 'proGamer.applyPageContent',
  proGamerCenterPageContent: 'proGamer.centerPageContent',
  clubCenterPageContent: 'club.centerPageContent'
} as const

// 每个 Tab 对应需要保存的 Key
const TAB_KEYS: Record<string, string[]> = {
  basic: [CONFIG_KEYS.baseClientLogo],
  home: [
    CONFIG_KEYS.homeEnableRecycle,
    CONFIG_KEYS.homeWeekVirtualOrders,
    CONFIG_KEYS.homePopupAnnouncement
  ],
  mine: [CONFIG_KEYS.myEnableVoiceRoom],
  privacy: [CONFIG_KEYS.privacyPolicyContent],
  place: [CONFIG_KEYS.placePageContent],
  orderDetail: [CONFIG_KEYS.orderDetailPageContent],
  proApply: [CONFIG_KEYS.proGamerApplyPageContent],
  proCenter: [CONFIG_KEYS.proGamerCenterPageContent],
  clubCenter: [CONFIG_KEYS.clubCenterPageContent]
}

// 标题与描述（可用于服务端展示或审计）
const TITLE_MAP: Record<string, string> = {
  [CONFIG_KEYS.baseClientLogo]: '客户端 LOGO',
  [CONFIG_KEYS.homeEnableRecycle]: '首页-是否开启回收',
  [CONFIG_KEYS.homeWeekVirtualOrders]: '首页-本周服务虚拟订单数',
  [CONFIG_KEYS.homePopupAnnouncement]: '首页-弹窗公告内容',
  [CONFIG_KEYS.myEnableVoiceRoom]: '“我的”页面-是否开启语音房功能',
  [CONFIG_KEYS.privacyPolicyContent]: '隐私协议内容',
  [CONFIG_KEYS.placePageContent]: '下单页面内容',
  [CONFIG_KEYS.orderDetailPageContent]: '订单详情页内容',
  [CONFIG_KEYS.proGamerApplyPageContent]: '打手入驻页内容',
  [CONFIG_KEYS.proGamerCenterPageContent]: '打手中心页内容',
  [CONFIG_KEYS.clubCenterPageContent]: '俱乐部中心页内容'
}

// 已存在配置的 map，便于 update
const existingMap = ref<Record<string, SystemConfig>>({})

// 表单数据
const form = reactive({
  baseClientLogo: '' as string,
  homeEnableRecycle: false as boolean,
  homeWeekVirtualOrders: 0 as number,
  homePopupAnnouncement: '' as string,

  myEnableVoiceRoom: false as boolean,

  privacyPolicyContent: '' as string,
  placePageContent: '' as string,
  orderDetailPageContent: '' as string,
  proGamerApplyPageContent: '' as string,
  proGamerCenterPageContent: '' as string,
  clubCenterPageContent: '' as string
})

// 工具：字符串 => 布尔
const toBool = (val: any) => {
  if (typeof val === 'boolean') return val
  if (val === 1 || val === '1' || val === 'true' || val === 'TRUE') return true
  return false
}

// 读取所有配置
const fetchAll = async () => {
  try {
    const data = await SystemConfigApi.getSystemConfigPage({ pageNo: 1, pageSize: 1000 })
    const list: SystemConfig[] = data.list || []
    const map: Record<string, SystemConfig> = {}
    list.forEach((item) => {
      if (item.configKey) map[item.configKey] = item
    })
    existingMap.value = map

    // 回填表单
    if (map[CONFIG_KEYS.baseClientLogo]) {
      form.baseClientLogo = map[CONFIG_KEYS.baseClientLogo].configValue || ''
    }
    if (map[CONFIG_KEYS.homeEnableRecycle]) {
      form.homeEnableRecycle = toBool(map[CONFIG_KEYS.homeEnableRecycle].configValue)
    }
    if (map[CONFIG_KEYS.homeWeekVirtualOrders]) {
      const v = Number(map[CONFIG_KEYS.homeWeekVirtualOrders].configValue)
      form.homeWeekVirtualOrders = Number.isNaN(v) ? 0 : v
    }
    if (map[CONFIG_KEYS.homePopupAnnouncement]) {
      form.homePopupAnnouncement = map[CONFIG_KEYS.homePopupAnnouncement].configValue || ''
    }
    if (map[CONFIG_KEYS.myEnableVoiceRoom]) {
      form.myEnableVoiceRoom = toBool(map[CONFIG_KEYS.myEnableVoiceRoom].configValue)
    }
    if (map[CONFIG_KEYS.privacyPolicyContent]) {
      form.privacyPolicyContent = map[CONFIG_KEYS.privacyPolicyContent].configValue || ''
    }
    if (map[CONFIG_KEYS.placePageContent]) {
      form.placePageContent = map[CONFIG_KEYS.placePageContent].configValue || ''
    }
    if (map[CONFIG_KEYS.orderDetailPageContent]) {
      form.orderDetailPageContent = map[CONFIG_KEYS.orderDetailPageContent].configValue || ''
    }
    if (map[CONFIG_KEYS.proGamerApplyPageContent]) {
      form.proGamerApplyPageContent = map[CONFIG_KEYS.proGamerApplyPageContent].configValue || ''
    }
    if (map[CONFIG_KEYS.proGamerCenterPageContent]) {
      form.proGamerCenterPageContent = map[CONFIG_KEYS.proGamerCenterPageContent].configValue || ''
    }
    if (map[CONFIG_KEYS.clubCenterPageContent]) {
      form.clubCenterPageContent = map[CONFIG_KEYS.clubCenterPageContent].configValue || ''
    }
  } catch (err) {
    console.error('加载配置失败:', err)
  }
}

// 构造保存数据
const buildConfigs = (keys: string[]): Partial<SystemConfig>[] => {
  const payload: Partial<SystemConfig>[] = []
  keys.forEach((key) => {
    let value = ''
    switch (key) {
      case CONFIG_KEYS.baseClientLogo:
        value = form.baseClientLogo || ''
        break
      case CONFIG_KEYS.homeEnableRecycle:
        value = form.homeEnableRecycle ? '1' : '0'
        break
      case CONFIG_KEYS.homeWeekVirtualOrders:
        value = String(form.homeWeekVirtualOrders ?? 0)
        break
      case CONFIG_KEYS.homePopupAnnouncement:
        value = form.homePopupAnnouncement || ''
        break
      case CONFIG_KEYS.myEnableVoiceRoom:
        value = form.myEnableVoiceRoom ? '1' : '0'
        break
      case CONFIG_KEYS.privacyPolicyContent:
        value = form.privacyPolicyContent || ''
        break
      case CONFIG_KEYS.placePageContent:
        value = form.placePageContent || ''
        break
      case CONFIG_KEYS.orderDetailPageContent:
        value = form.orderDetailPageContent || ''
        break
      case CONFIG_KEYS.proGamerApplyPageContent:
        value = form.proGamerApplyPageContent || ''
        break
      case CONFIG_KEYS.proGamerCenterPageContent:
        value = form.proGamerCenterPageContent || ''
        break
      case CONFIG_KEYS.clubCenterPageContent:
        value = form.clubCenterPageContent || ''
        break
    }

    const existing = existingMap.value[key]
    if (existing) {
      payload.push({
        id: existing.id,
        configKey: key,
        configValue: value,
        title: TITLE_MAP[key],
        description: existing.description
      })
    } else {
      payload.push({
        configKey: key,
        configValue: value,
        title: TITLE_MAP[key],
        description: ''
      })
    }
  })
  return payload
}

// 保存当前 Tab
const saveCurrentTab = async () => {
  const keys = TAB_KEYS[activeTab.value] || []
  await doSave(keys)
}

// 保存全部
const saveAll = async () => {
  const keys = Object.values(CONFIG_KEYS)
  await doSave(keys)
}

const doSave = async (keys: string[]) => {
  if (!keys.length) return
  saving.value = true
  try {
    const payload = buildConfigs(keys)
    // 拆分 update 与 create
    const tasks: Promise<any>[] = []
    payload.forEach((item) => {
      if (item.id) tasks.push(SystemConfigApi.updateSystemConfig(item as SystemConfig))
      else tasks.push(SystemConfigApi.createSystemConfig(item as SystemConfig))
    })
    await Promise.all(tasks)
    message.success('保存成功')
    await fetchAll()
  } catch (err) {
    console.error('保存失败:', err)
    message.error('保存失败')
  } finally {
    saving.value = false
  }
}

const reload = () => fetchAll()

onMounted(() => {
  fetchAll()
})
</script>

<script setup lang="ts">
import type { UserMoment } from '@/api/gamer/usermoment'
import { UserMomentApi } from '@/api/gamer/usermoment'
import { dateFormatter } from '@/utils/formatTime'
import { isEmpty } from '@/utils/is'

import UserMomentContent from '../usermomentcontent/index.vue'
import UserMomentRedPacket from '../usermomentredpacket/index.vue'
import UserMomentVoice from '../usermomentvoice/index.vue'
import UserMomentVote from '../usermomentvote/index.vue'
import UserMomentForm from './UserMomentForm.vue'

/** 用户动态 列表 */
defineOptions({ name: 'UserMoment' })

// 接收来自父层弹窗传入的用户ID（可选）
const props = defineProps<{ userId?: number }>()

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<UserMoment[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: undefined,
  momentType: undefined,
  topic: undefined,
  location: undefined,
  publishIp: undefined,
  priority: undefined,
  priorityExpireTime: [],
  lastRefreshTime: [],
  status: undefined,
  auditTime: [],
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单

/** 查询列表 */
async function getList() {
  loading.value = true
  try {
    const data = await UserMomentApi.getUserMomentPage(queryParams)
    list.value = data.list
    total.value = data.total
  }
  finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  queryFormRef.value.resetFields()
  handleQuery()
}

// 当从父组件传入 userId 时，自动按该用户筛选
watch(
  () => props.userId,
  (val) => {
    if (val !== undefined && val !== null) {
      queryParams.userId = val as any
      handleQuery()
    }
  },
  { immediate: true },
)

/** 添加/修改操作 */
const formRef = ref()
// function openForm(type: string, id?: number) {
//   formRef.value.open(type, id)
// }

async function handleToggleMomentStatus(row: UserMoment, val: number) {
  try {
    await UserMomentApi.approveUserMoment({ id: row.id, status: val })
    message.success('状态已更新')
    await getList()
  }
  catch { }
}

// 动态子内容弹窗逻辑
type SubViewKey = 'content' | 'voice' | 'vote' | 'redpacket'
const subViewDialogVisible = ref(false)
const selectedMomentId = ref<number | undefined>(undefined)
const activeView = ref<SubViewKey | ''>('')
const subViewTitle = ref('')
const subViewMap = {
  content: UserMomentContent,
  voice: UserMomentVoice,
  vote: UserMomentVote,
  redpacket: UserMomentRedPacket,
} as const
const activeComponent = computed(() => (activeView.value ? subViewMap[activeView.value] : null))
// const typeTitleMap: Record<SubViewKey, string> = {
//   content: '动态内容',
//   voice: '用户语音',
//   vote: '用户投票',
//   redpacket: '用户动态红包',
// }

// function openMomentSubView(_cmd: any, row: UserMoment) {
//   activeView.value = _cmd
//   selectedMomentId.value = row.id
//   subViewTitle.value = `${typeTitleMap[_cmd]} - 动态ID：${row.id}`
//   subViewDialogVisible.value = true
// }

// 处理下拉菜单的明细命令
// function onDetailCommand(_cmd: any, row: UserMoment) {
//   // 目前各菜单项按 momentType 条件显示，无需区分 cmd，直接打开对应子视图
//   openMomentSubView(_cmd, row)
// }

// ===== 媒体预览（图片/视频/音频） =====
type PreviewType = 'image' | 'video' | 'audio' | ''
const mediaPreview = reactive({
  visible: false,
  type: '' as PreviewType,
  title: '预览',
  images: [] as string[],
  videoUrl: '',
  audioUrl: '',
})

function normalizeImages(val: unknown): string[] {
  if (!val) return []
  if (Array.isArray(val)) return (val as any[]).map(String).filter(Boolean)
  if (typeof val === 'string') {
    const s = (val as string).trim()
    if (!s) return []
    try {
      const parsed = JSON.parse(s)
      if (Array.isArray(parsed)) return parsed.map(item => decodeURIComponent(item)).filter(Boolean)
    }
    catch {}
    return s.split(',').map(v => v.trim()).filter(Boolean)
  }
  return []
}

function openImagePreview(row: any) {
  mediaPreview.type = 'image'
  mediaPreview.title = `图片预览 - 动态ID：${row.id}`
  mediaPreview.images = normalizeImages(row.images)
  mediaPreview.videoUrl = ''
  mediaPreview.audioUrl = ''
  mediaPreview.visible = true
}

function openVideoPreview(row: any) {
  if (!row?.videoUrl) return
  mediaPreview.type = 'video'
  mediaPreview.title = `视频预览 - 动态ID：${row.id}`
  mediaPreview.images = []
  mediaPreview.videoUrl = row.videoUrl
  mediaPreview.audioUrl = ''
  mediaPreview.visible = true
}

function openAudioPreview(row: any) {
  if (!row?.voiceUrl) return
  mediaPreview.type = 'audio'
  mediaPreview.title = `音频预览 - 动态ID：${row.id}`
  mediaPreview.images = []
  mediaPreview.videoUrl = ''
  mediaPreview.audioUrl = row.voiceUrl
  mediaPreview.visible = true
}

// 审核通过操作
// async function onPassCommand(row: UserMoment) {
//   try {
//     await message.confirm('确认通过该动态吗？')
//     await UserMomentApi.approveUserMoment({ id: row.id, status: 1 })
//     message.success('审核通过成功')
//     await getList()
//   }
//   catch { }
// }

// // 审核不通过操作
// async function onRejectCommand(row: UserMoment) {
//   try {
//     const data = await message.prompt('请输入拒绝原因', t('common.reminder'))
//     if (!data || (data as any).action !== 'confirm') return
//     const reason = (data as any).value ? String((data as any).value).trim() : ''
//     if (!reason) {
//       message.warning('请输入拒绝原因')
//       return
//     }
//     await UserMomentApi.approveUserMoment({ id: row.id, auditReason: reason, status: 2 })
//     message.success('已驳回该动态')
//     await getList()
//   }
//   catch { }
// }

/** 删除按钮操作 */
async function handleDelete(id: number) {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await UserMomentApi.deleteUserMoment(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  }
  catch { }
}
const checkedIds = ref<number[]>([])

/** 批量删除用户动态 */
async function handleDeleteBatch() {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await UserMomentApi.deleteUserMomentList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  }
  catch { }
}

function handleRowCheckboxChange(records: UserMoment[]) {
  checkedIds.value = records.map(item => item.id)
}

/** 初始化 */
onMounted(() => {
  getList()
})
</script>

<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryFormRef"
      class="-mb-[15px]"
      :model="queryParams"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="用户ID" prop="userId">
        <UserMultiSelectInput
          v-model="queryParams.userId"
          :multiple="false"
          placeholder="请选择用户"
          @change="handleQuery"
        />
      </el-form-item>
      <el-form-item label="动态类型" prop="momentType">
        <el-select
          v-model="queryParams.momentType"
          placeholder="请选择动态类型"
          clearable
          class="!w-[240px]"
        >
          <el-option label="图文" :value="1" />
          <el-option label="音频" :value="2" />
          <el-option label="视频" :value="5" />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="话题" prop="topic">
        <el-input
          v-model="queryParams.topic"
          placeholder="请输入话题"
          clearable
          class="!w-[240px]"
        />
      </el-form-item> -->
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          class="!w-[240px]"
        >
          <el-option label="待审核" :value="0" />
          <el-option label="审核通过" :value="1" />
          <el-option label="审核不通过" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-[220px]"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" class="mr-[5px]" /> 搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-[5px]" /> 重置
        </el-button>
        <!-- <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['gamer:user-moment:create']">
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button> -->
        <el-button
          v-hasPermi="['gamer:user-moment:delete']"
          type="danger"
          plain
          :disabled="isEmpty(checkedIds)"
          @click="handleDeleteBatch"
        >
          <Icon icon="ep:delete" class="mr-[5px]" /> 批量删除
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 动态子内容弹窗：根据动态类型展示对应子页面，并按 momentId 自动筛选 -->
  <el-dialog
    v-model="subViewDialogVisible"
    :title="subViewTitle"
    width="80%"
    destroy-on-close
    append-to-body
  >
    <component :is="activeComponent" v-if="activeComponent" :moment-id="selectedMomentId" />
  </el-dialog>

  <!-- 媒体预览弹窗（图片/视频/音频） -->
  <el-dialog
    v-model="mediaPreview.visible"
    :title="mediaPreview.title"
    width="60%"
    append-to-body
    destroy-on-close
  >
    <template v-if="mediaPreview.type === 'image'">
      <el-carousel height="400px" indicator-position="outside" :autoplay="false" arrow="hover">
        <el-carousel-item v-for="(img, idx) in mediaPreview.images" :key="idx">
          <el-image :src="img" fit="contain" class="h-full w-full" />
        </el-carousel-item>
      </el-carousel>
    </template>
    <template v-else-if="mediaPreview.type === 'video'">
      <video v-if="mediaPreview.videoUrl" :src="mediaPreview.videoUrl" class="w-full" controls />
    </template>
    <template v-else-if="mediaPreview.type === 'audio'">
      <audio v-if="mediaPreview.audioUrl" :src="mediaPreview.audioUrl" class="w-full" controls />
    </template>
  </el-dialog>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      v-loading="loading"
      row-key="id"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
      @selection-change="handleRowCheckboxChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="用户ID" align="center" prop="userId" />
      <el-table-column label="用户昵称" align="center" prop="nickname" />
      <el-table-column label="类型" align="center" prop="momentType" width="80px">
        <template #default="scope">
          <div class="flex flex-col gap-y-1">
            <el-tag
              v-for="v, k in scope?.row?.momentType?.split(',')"
              :key="k"
              :type="Number(v) === 1 ? 'success' : Number(v) === 2 ? 'danger' : Number(v) === 5 ? 'info' : 'warning'"
            >
              {{ Number(v) === 1 ? '图文' : Number(v) === 2 ? '音频' : Number(v) === 5 ? '视频'
                : '未知' }}
            </el-tag>
          </div>
        </template>
      </el-table-column>

      <!-- 图片 -->
      <el-table-column label="图片" align="center" width="100">
        <template #default="scope">
          <template v-if="normalizeImages(scope.row.images).length">
            <img
              :src="normalizeImages(scope.row.images)[0]"
              class="h-[40px] w-[40px] cursor-pointer rounded object-cover"
              @click="openImagePreview(scope.row)"
            >
            <div v-if="normalizeImages(scope.row.images).length > 1" class="text-xs text-gray-500">
              +{{ normalizeImages(scope.row.images).length - 1 }}
            </div>
          </template>
          <span v-else class="text-xs text-gray-400">-</span>
        </template>
      </el-table-column>

      <!-- 视频 -->
      <el-table-column label="视频" align="center" width="80">
        <template #default="scope">
          <template v-if="scope.row.videoUrl">
            <el-button size="small" type="primary" plain @click="openVideoPreview(scope.row)">
              预览
            </el-button>
          </template>
          <span v-else class="text-xs text-gray-400">-</span>
        </template>
      </el-table-column>

      <!-- 音频 -->
      <el-table-column label="音频" align="center" width="80">
        <template #default="scope">
          <template v-if="scope.row.voiceUrl">
            <el-button size="small" type="success" plain @click="openAudioPreview(scope.row)">
              预览
            </el-button>
          </template>
          <span v-else class="text-xs text-gray-400">-</span>
        </template>
      </el-table-column>

      <!-- <el-table-column label="话题" align="center" prop="topic" /> -->
      <el-table-column label="发布地点" align="center" prop="location" />
      <!-- <el-table-column label="优先级" align="center" prop="priority">
        <template #default="scope">
          <el-tag :type="scope.row.priority === 0 ? 'success' : 'danger'">
            {{ scope.row.priority === 0 ? '普通' : '置顶' }}
          </el-tag>
        </template>
      </el-table-column> -->

      <el-table-column label="点赞数" align="center" prop="likeCount" />
      <!-- <el-table-column label="浏览数" align="center" prop="browseCount" /> -->
      <!-- <el-table-column label="评论数" align="center" prop="commentCount" /> -->
      <!-- <el-table-column label="分享数" align="center" prop="shareCount" /> -->
      <el-table-column label="状态" align="center" prop="status" width="160">
        <template #default="scope">
          <div class="flex flex-col items-center gap-1">
            <template v-if="scope.row.status === 0">
              <el-button-group>
                <el-button size="small" type="success" @click="handleToggleMomentStatus(scope.row, 1)">
                  通过
                </el-button>
                <el-button size="small" type="danger" @click="handleToggleMomentStatus(scope.row, 2)">
                  不通过
                </el-button>
              </el-button-group>
              <el-tag type="info">
                待审核
              </el-tag>
            </template>
            <template v-else>
              <!-- <el-switch
                :model-value="normalizedMomentStatus(scope.row.status)"
                :active-value="1"
                :inactive-value="2"
                active-text="通过"
                inactive-text="不通过"
                inline-prompt
                @change="(val) => handleToggleMomentStatus(scope.row, Number(val))"
              /> -->
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? '通过' : '不通过' }}
              </el-tag>
            </template>
          </div>
        </template>
      </el-table-column>
      <!-- <el-table-column label="审核时间" align="center" prop="auditTime" :formatter="dateFormatter" width="180px" /> -->
      <!-- <el-table-column label="拒绝原因" align="center" prop="auditReason" /> -->

      <el-table-column label="最后刷新时间" align="center" prop="lastRefreshTime" :formatter="dateFormatter" width="180px" />
      <el-table-column
        label="操作" align="center" class-name="col-actions" min-width="220px"
        :show-overflow-tooltip="false"
      >
        <template #default="scope">
          <el-space wrap size="small" class="action-space">
            <!-- 待审核：通过 / 不通过 合并为按钮组，更紧凑 -->
            <!-- <el-button-group v-if="scope.row.status === 0">
              <el-button
                v-hasPermi="['gamer:user-moment:audit']" size="small" text type="primary"
                @click="onPassCommand(scope.row)"
              >
                通过
              </el-button>
              <el-button
                v-hasPermi="['gamer:user-moment:audit']" size="small" text type="danger"
                @click="onRejectCommand(scope.row)"
              >
                不通过
              </el-button>
            </el-button-group> -->

            <!-- 内容明细下拉 -->
            <!-- <el-dropdown trigger="hover" @command="(cmd) => onDetailCommand(cmd, scope.row)">
              <el-button size="small" text class="!text-[#67C23A]">
                内容明细
                <Icon icon="ep:arrow-down" class="ml-[4px]" />
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-if="scope.row.momentType.includes('1')"
                    v-hasPermi="['gamer:user-moment-content:update']"
                    command="content"
                  >
                    内容明细
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="scope.row.momentType.includes('2')"
                    v-hasPermi="['gamer:user-moment-voice:update']"
                    command="voice"
                  >
                    语音明细
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="scope.row.momentType.includes('3')"
                    v-hasPermi="['gamer:user-moment-vote:update']"
                    command="vote"
                  >
                    投票明细
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="scope.row.momentType.includes('4')"
                    v-hasPermi="['gamer:user-moment-red-packet:update']"
                    command="redpacket"
                  >
                    红包明细
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown> -->

            <!-- <el-button
              v-hasPermi="['gamer:user-moment:update']" link size="small" type="primary"
              @click="openForm('update', scope.row.id)"
            >
              编辑
            </el-button> -->
            <el-button
              v-hasPermi="['gamer:user-moment:delete']" link size="small" type="danger"
              @click="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
          </el-space>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      v-model:page="queryParams.pageNo" v-model:limit="queryParams.pageSize" :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <UserMomentForm ref="formRef" @success="getList" />
</template>

<style scoped>
/* 仅对“操作”列允许自动换行与可见溢出，避免被省略 */
:deep(.el-table .col-actions .cell) {
  white-space: normal;
  overflow: visible;
}

/* 操作区：多行换行 + 居中 + 紧凑间距 */
.action-space {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
  /* 行间距4，列间距8 */
  justify-content: center;
}
</style>

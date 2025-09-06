<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-[15px]"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px">
      <el-form-item label="用户ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户ID"
          clearable
          @keyup.enter="handleQuery"
          class="!w-[240px]" />
      </el-form-item>
      <el-form-item label="动态类型" prop="momentType">
        <el-select
          v-model="queryParams.momentType"
          placeholder="请选择动态类型"
          clearable
          class="!w-[240px]">
          <el-option label="文字/图片" value="1" />
          <el-option label="语音" value="2" />
          <el-option label="投票" value="3" />
          <el-option label="红包" value="4" />
        </el-select>
      </el-form-item>
      <el-form-item label="话题(多个使用#分割)" prop="topic">
        <el-input
          v-model="queryParams.topic"
          placeholder="请输入话题(多个使用#分割)"
          clearable
          @keyup.enter="handleQuery"
          class="!w-[240px]" />
      </el-form-item>
      <el-form-item label="发布地点" prop="location">
        <el-input
          v-model="queryParams.location"
          placeholder="请输入发布地点"
          clearable
          @keyup.enter="handleQuery"
          class="!w-[240px]" />
      </el-form-item>
      <el-form-item label="发布IP" prop="publishIp">
        <el-input
          v-model="queryParams.publishIp"
          placeholder="请输入发布IP"
          clearable
          @keyup.enter="handleQuery"
          class="!w-[240px]" />
      </el-form-item>
      <el-form-item label="优先级" prop="priority">
        <el-select
          v-model="queryParams.priority"
          placeholder="请选择优先级"
          clearable
          class="!w-[240px]">
          <el-option label="普通" value="0" />
          <el-option label="置顶" value="1" />
        </el-select>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          class="!w-[240px]">
          <el-option label="待审核" value="0" />
          <el-option label="审核通过" value="1" />
          <el-option label="审核不通过" value="2" />
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
          class="!w-[220px]" />
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
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['gamer:user-moment:export']">
          <Icon icon="ep:download" class="mr-[5px]" /> 导出
        </el-button> -->
        <el-button
          type="danger"
          plain
          :disabled="isEmpty(checkedIds)"
          @click="handleDeleteBatch"
          v-hasPermi="['gamer:user-moment:delete']">
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
    append-to-body>
    <component :is="activeComponent" :moment-id="selectedMomentId" v-if="activeComponent" />
  </el-dialog>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      row-key="id"
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
      @selection-change="handleRowCheckboxChange">
      <el-table-column type="selection" width="55" />
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="用户ID" align="center" prop="userId" />
      <el-table-column label="类型" align="center" prop="momentType" width="80px">
        <template #default="scope">
          <div class="flex gap-y-1 flex-col ">
            <el-tag
              v-for="v in scope?.row?.momentType?.split(',')"
              :type="v == 1 ? 'success' : v == 2 ? 'danger' : v == 3 ? 'info' : 'warning'">
              {{ v == 1 ? '内容' : v == 2 ? '语音' : v == 3 ? '投票'
                : '红包' }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="话题" align="center" prop="topic" />
      <el-table-column label="发布地点" align="center" prop="location" />
      <el-table-column label="优先级" align="center" prop="priority">
        <template #default="scope">
          <el-tag :type="scope.row.priority === 0 ? 'success' : 'danger'">
            {{ scope.row.priority === 0 ? '普通' : '置顶' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="点赞数" align="center" prop="likeCount" />
      <el-table-column label="浏览数" align="center" prop="browseCount" />
      <el-table-column label="评论数" align="center" prop="commentCount" />
      <el-table-column label="分享数" align="center" prop="shareCount" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <el-tag :type="scope.row.status === 0 ? 'info' : scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 0 ? '待审核' : scope.row.status === 1 ? '通过' : '不通过' }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- <el-table-column label="审核时间" align="center" prop="auditTime" :formatter="dateFormatter" width="180px" /> -->
      <el-table-column label="拒绝原因" align="center" prop="auditReason" />

      <el-table-column label="最后刷新时间" align="center" prop="lastRefreshTime" :formatter="dateFormatter" width="180px" />
      <el-table-column label="操作" align="center" class-name="col-actions" min-width="220px"
        :show-overflow-tooltip="false">
        <template #default="scope">
          <el-space wrap size="small" class="action-space">
            <!-- 待审核：通过 / 不通过 合并为按钮组，更紧凑 -->
            <el-button-group v-if="scope.row.status === 0">
              <el-button size="small" v-hasPermi="['gamer:user-moment:audit']" text type="primary"
                @click="onPassCommand(scope.row)">通过</el-button>
              <el-button size="small" v-hasPermi="['gamer:user-moment:audit']" text type="danger"
                @click="onRejectCommand(scope.row)">不通过</el-button>
            </el-button-group>

            <!-- 内容明细下拉 -->
            <el-dropdown trigger="hover" @command="(cmd) => onDetailCommand(cmd, scope.row)">
              <el-button size="small" text class="!text-[#67C23A]">
                内容明细
                <Icon icon="ep:arrow-down" class="ml-[4px]" />
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    command="content"
                    v-if="scope.row.momentType === 1"
                    v-hasPermi="['gamer:user-moment-content:update']">
                    内容明细
                  </el-dropdown-item>
                  <el-dropdown-item
                    command="voice"
                    v-else-if="scope.row.momentType === 2"
                    v-hasPermi="['gamer:user-moment-voice:update']">
                    语音明细
                  </el-dropdown-item>
                  <el-dropdown-item
                    command="vote"
                    v-else-if="scope.row.momentType === 3"
                    v-hasPermi="['gamer:user-moment-vote:update']">
                    投票明细
                  </el-dropdown-item>
                  <el-dropdown-item
                    command="redpacket"
                    v-else-if="scope.row.momentType === 4"
                    v-hasPermi="['gamer:user-moment-red-packet:update']">
                    红包明细
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-button link size="small" type="primary" @click="openForm('update', scope.row.id)"
              v-hasPermi="['gamer:user-moment:update']">编辑</el-button>
            <el-button link size="small" type="danger" @click="handleDelete(scope.row.id)"
              v-hasPermi="['gamer:user-moment:delete']">删除</el-button>
          </el-space>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination :total="total" v-model:page="queryParams.pageNo" v-model:limit="queryParams.pageSize"
      @pagination="getList" />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <UserMomentForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { UserMomentApi, UserMoment } from '@/api/gamer/usermoment'
import UserMomentForm from './UserMomentForm.vue'
import UserMomentContent from '../usermomentcontent/index.vue'
import UserMomentVoice from '../usermomentvoice/index.vue'
import UserMomentVote from '../usermomentvote/index.vue'
import UserMomentRedPacket from '../usermomentredpacket/index.vue'

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
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await UserMomentApi.getUserMomentPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
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
  { immediate: true }
)

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
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
  redpacket: UserMomentRedPacket
} as const
const activeComponent = computed(() => (activeView.value ? subViewMap[activeView.value] : null))
const typeTitleMap: Record<SubViewKey, string> = {
  content: '动态内容',
  voice: '用户语音',
  vote: '用户投票',
  redpacket: '用户动态红包'
}
const momentTypeToKey = (mt: number): SubViewKey => (mt === 1 ? 'content' : mt === 2 ? 'voice' : mt === 3 ? 'vote' : 'redpacket')
const openMomentSubView = (row: UserMoment) => {
  const key = momentTypeToKey((row as any).momentType)
  activeView.value = key
  selectedMomentId.value = row.id
  subViewTitle.value = `${typeTitleMap[key]} - 动态ID：${row.id}`
  subViewDialogVisible.value = true
}

// 处理下拉菜单的明细命令
const onDetailCommand = (_cmd: any, row: UserMoment) => {
  // 目前各菜单项按 momentType 条件显示，无需区分 cmd，直接打开对应子视图
  openMomentSubView(row)
}

// 审核通过操作
const onPassCommand = async (row: UserMoment) => {
  try {
    await message.confirm('确认通过该动态吗？')
    await UserMomentApi.approveUserMoment({ id: row.id, status: 1 })
    message.success('审核通过成功')
    await getList()
  } catch { }
}

// 审核不通过操作
const onRejectCommand = async (row: UserMoment) => {
  try {
    const data = await message.prompt('请输入拒绝原因', t('common.reminder'))
    if (!data || (data as any).action !== 'confirm') return
    const reason = (data as any).value ? String((data as any).value).trim() : ''
    if (!reason) {
      message.warning('请输入拒绝原因')
      return
    }
    await UserMomentApi.approveUserMoment({ id:row.id, auditReason: reason, status: 2 })
    message.success('已驳回该动态')
    await getList()
  } catch { }
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await UserMomentApi.deleteUserMoment(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch { }
}

/** 批量删除用户动态 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await UserMomentApi.deleteUserMomentList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch { }
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: UserMoment[]) => {
  checkedIds.value = records.map((item) => item.id);
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await UserMomentApi.exportUserMoment(queryParams)
    download.excel(data, '用户动态.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>

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

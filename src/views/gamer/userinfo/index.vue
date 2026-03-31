<script setup lang="ts">
import type { UserInfo } from '@/api/gamer/userinfo'
import { UserInfoApi } from '@/api/gamer/userinfo'
import { fenToYuan } from '@/utils'
import { formatDate } from '@/utils/formatTime'
import UserBalanceUpdateForm from '@/views/member/user/components/UserBalanceUpdateForm.vue'

import UserIncomeExpenseDetail from '../userincomeexpensedetail/index.vue'
import UserMoment from '../usermoment/index.vue'
import UserMomentBrowse from '../usermomentbrowse/index.vue'
import UserMomentComment from '../usermomentcomment/index.vue'
import UserMomentLike from '../usermomentlike/index.vue'
import UserStatDialog from './UserStatDialog.vue'

/** 用户信息 列表 */
defineOptions({ name: 'UserInfo' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<UserInfo[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const userType = ref(undefined) // 用户类型：1-打手，2-陪玩
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  depositBalanceGt: undefined,
  openid: undefined,
  mpOpenid: undefined,
  unionid: undefined,
  id: undefined,
  mobile: undefined,
  nickname: undefined,
  avatar: undefined,
  trueHead: undefined,
  sex: undefined,
  city: undefined,
  signature: undefined,
  money: undefined,
  giftMoney: undefined,
  wealthVal: undefined,
  charmVal: undefined,
  davName: undefined,
  voiceAuditStatus: undefined,
  isSeeFollow: undefined,
  isSeeFans: undefined,
})
const queryFormRef = ref() // 搜索的表单
const UpdateBalanceFormRef = ref() // 修改用户余额表单

function formatMoney(value?: number | string | null) {
  return fenToYuan(Number(value ?? 0))
}

function formatGrowthValue(value?: number | string | null) {
  return fenToYuan(Number(value ?? 0) * 100)
}

function formatDateTime(value?: string | number | Date | null) {
  return value ? formatDate(value as Date) : '--'
}

function getUserTypeLabel(row: any) {
  if (row.levelApply?.levelName) return row.levelApply.levelName
  if (row.accompanyLevelApply?.levelName) return row.accompanyLevelApply.levelName
  return '普通用户'
}

function getUserTypeTag(row: any) {
  if (row.levelApply?.levelName) return 'success'
  if (row.accompanyLevelApply?.levelName) return 'warning'
  return 'info'
}

function getCreateTime(row: any) {
  return row.createTime || row.create_date || row.createDate
}

function getActiveTime(row: any) {
  return row.login_date || row.loginDate || row.activeTime
}

/** 查询列表 */
async function getList() {
  loading.value = true
  try {
    // 根据是否选择了用户类型来决定调用哪个接口
    const data = userType.value
      ? await UserInfoApi.getUserInfoPageByLevel({
          ...queryParams,
          depositBalanceGt: queryParams.depositBalanceGt ? Number(queryParams.depositBalanceGt) * 100 : undefined,
        })
      : await UserInfoApi.getUserInfoPage({
          ...queryParams,
          depositBalanceGt: queryParams.depositBalanceGt ? Number(queryParams.depositBalanceGt) * 100 : undefined,
        })
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

async function handleToggleUserStatus(row: any) {
  try {
    await UserInfoApi.toggleUserStatus({ userId: row.id })
    getList()
    message.success('状态已更新')
  }
  catch {
    // 失败不回写，保持原状态
    message.error('更新失败')
  }
}

// 用户相关弹窗逻辑
const userViewDialogVisible = ref(false)
const selectedUserId = ref<number | undefined>(undefined)
const userViewTitle = ref('')
const activeView = ref<'usermoment' | 'usermomentbrowse' | 'usermomentcomment' | 'usermomentlike' | 'userincome' | 'userstat' | ''>('')
const viewMap = {
  usermoment: UserMoment,
  usermomentbrowse: UserMomentBrowse,
  usermomentcomment: UserMomentComment,
  usermomentlike: UserMomentLike,
  userincome: UserIncomeExpenseDetail,
  userstat: UserStatDialog,
} as const
const activeComponent = computed(() => (activeView.value ? viewMap[activeView.value] : null))
const titleMap: Record<string, string> = {
  usermoment: '用户动态管理',
  usermomentbrowse: '用户浏览记录',
  usermomentcomment: '用户评论记录',
  usermomentlike: '用户点赞记录',
  userincome: '用户收入支出记录',
  userstat: '下级用户统计',
}
function onUserMenuCommand(cmd: keyof typeof viewMap, row: UserInfo) {
  selectedUserId.value = row.id
  activeView.value = cmd
  userViewTitle.value = `${titleMap[cmd]} - 用户ID：${row.id}`
  userViewDialogVisible.value = true
}

/** 删除按钮操作 */
async function handleDelete(id: number) {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await UserInfoApi.deleteUserInfo(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  }
  catch { }
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
      <el-form-item label="用户ID" prop="id">
        <el-input
          v-model="queryParams.id"
          placeholder="请输入用户唯一编号"
          clearable
          class="!w-[240px]"
        />
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input
          v-model="queryParams.mobile"
          placeholder="请输入手机号"
          clearable
          class="!w-[240px]"
        />
      </el-form-item>
      <el-form-item label="用户昵称" prop="nickname">
        <el-input
          v-model="queryParams.nickname"
          placeholder="请输入用户昵称"
          clearable
          class="!w-[240px]"
        />
      </el-form-item>
      <!-- 用户类型 -->
      <el-form-item label="用户类型">
        <el-select
          v-model="userType"
          placeholder="请选择用户类型"
          clearable
          class="!w-[240px]"
          @change="handleQuery"
        >
          <el-option label="打手" :value="1" />
          <el-option label="陪玩" :value="2" />
        </el-select>
      </el-form-item>

      <el-form-item label="保证金大于" prop="depositBalanceGt" label-width="100px">
        <el-input
          v-model="queryParams.depositBalanceGt"
          placeholder="请输入保证金大于"
          clearable
          type="number"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" class="mr-[5px]" /> 搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-[5px]" /> 重置
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      v-loading="loading"
      class="userinfo-table"
      row-key="id"
      :data="list"
      :show-overflow-tooltip="true"
    >
      <el-table-column label="ID" align="center" prop="id" width="90" />
      <el-table-column label="用户信息" min-width="250">
        <template #default="scope">
          <div class="user-info-cell">
            <div class="user-info-name">
              {{ scope.row.nickname || '--' }}
            </div>
            <el-image
              v-if="scope.row.avatar"
              class="user-avatar"
              :src="scope.row.avatar"
              :preview-src-list="[scope.row.avatar]"
              preview-teleported
              fit="cover"
            />
            <div v-else class="user-avatar user-avatar--empty">
              {{ (scope.row.nickname || '?').slice(0, 1) }}
            </div>
            <div class="user-info-meta">
              <span class="user-info-label">当前积分数:</span>
              <span>{{ formatMoney(scope.row.wallet?.totalExperience) }}</span>
            </div>
            <div class="user-info-meta">
              <span class="user-info-label">当前等级:</span>
              <span>{{ scope.row?.userGradeInfo?.levelName || '无等级' }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="手机号" align="center" min-width="180">
        <template #default="scope">
          <div class="table-text-block">
            {{ scope.row.mobile || scope.row.phone || '--' }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="时间" align="center" min-width="220">
        <template #default="scope">
          <div class="table-stack">
            <div>创建时间：{{ formatDateTime(getCreateTime(scope.row)) }}</div>
            <div>活跃时间：{{ formatDateTime(getActiveTime(scope.row)) }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="封禁状态" align="center" width="140">
        <template #default="scope">
          <div class="status-switch-wrap">
            <el-switch
              v-hasPermi="['gamer:user-info:update']"
              :model-value="scope.row.status"
              :active-value="true"
              inline-prompt
              :inactive-value="false"
              style="--el-switch-off-color: #dcdfe6; --el-switch-on-color: #ff4949"
              active-text="已封禁"
              inactive-text="未封禁"
              @change="() => handleToggleUserStatus(scope.row)"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="用户类别" align="center" width="140">
        <template #default="scope">
          <el-tag :type="getUserTypeTag(scope.row)" effect="plain" round>
            {{ getUserTypeLabel(scope.row) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="可用余额" align="center" width="120">
        <template #default="scope">
          <span class="amount-text">{{ formatMoney(scope.row.wallet?.balance) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="冻结余额" align="center" width="120">
        <template #default="scope">
          <span class="amount-text">{{ formatMoney(scope.row.wallet?.freezePrice) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="保证金" align="center" width="120">
        <template #default="scope">
          <span class="amount-text">{{ formatMoney(scope.row.wallet?.depositBalance) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="当前积分数" align="center" width="120">
        <template #default="scope">
          <span class="amount-text">{{ formatMoney(scope.row.wallet?.totalExperience) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180" fixed="right">
        <template #default="scope">
          <div class="table-actions">
            <el-button link type="primary" @click="onUserMenuCommand('userstat', scope.row)">
              下级用户
            </el-button>
            <el-button
              v-hasPermi="['pay:wallet:update-balance']"
              link
              type="primary"
              @click="() => UpdateBalanceFormRef.open(scope.row.id)"
            >
              修改余额
            </el-button>
            <el-dropdown trigger="click">
              <el-button link type="info">
                更多
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="onUserMenuCommand('userincome', scope.row)">
                    收入支出
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-hasPermi="['gamer:user-info:update']"
                    @click="onUserMenuCommand('usermoment', scope.row)"
                  >
                    用户动态管理
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-hasPermi="['gamer:user-info:delete']"
                    class="!text-red-500"
                    @click="handleDelete(scope.row.id)"
                  >
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      v-model:page="queryParams.pageNo" v-model:limit="queryParams.pageSize" :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 用户相关弹窗 -->
  <el-dialog
    v-model="userViewDialogVisible"
    :title="userViewTitle"
    width="80%"
    destroy-on-close
    append-to-body
  >
    <component :is="activeComponent" v-if="activeComponent" :user-id="selectedUserId" />
  </el-dialog>

  <!-- 修改用户余额弹窗 -->
  <UserBalanceUpdateForm ref="UpdateBalanceFormRef" @success="getList" />
</template>

<style scoped lang="scss">
.userinfo-table {
  :deep(.el-table__header th) {
    height: 72px;
    font-size: 14px;
    font-weight: 700;
    color: #1f2937;
    background: #fff;
  }

  :deep(.el-table__row td) {
    padding: 22px 0;
    vertical-align: middle;
  }
}

.user-info-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  line-height: 1.6;
}

.user-info-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.user-avatar {
  width: 72px;
  height: 72px;
  border-radius: 9999px;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  background: linear-gradient(135deg, #60a5fa, #2563eb);
}

.user-info-meta {
  width: 100%;
  color: #303133;
  word-break: break-word;
}

.user-info-label {
  color: #606266;
}

.table-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
  line-height: 1.8;
}

.table-text-block {
  line-height: 1.8;
  color: #303133;
}

.status-switch-wrap {
  display: flex;
  justify-content: center;
}

.amount-text {
  font-size: 16px;
  font-weight: 500;
  color: #2563eb;
}

.table-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}
</style>

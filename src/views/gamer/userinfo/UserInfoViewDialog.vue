<script setup lang="ts">
import type { UserInfo } from '@/api/gamer/userinfo'
import { UserInfoApi } from '@/api/gamer/userinfo'
import { fenToYuan } from '@/utils'
import UserBalanceUpdateForm from '@/views/member/user/components/UserBalanceUpdateForm.vue'

import UserIncomeExpenseDetail from '../userincomeexpensedetail/index.vue'
import UserMoment from '../usermoment/index.vue'
import UserMomentBrowse from '../usermomentbrowse/index.vue'
import UserMomentComment from '../usermomentcomment/index.vue'
import UserMomentLike from '../usermomentlike/index.vue'
import UserInfoForm from './UserInfoForm.vue'
import UserStatDialog from './UserStatDialog.vue'

defineOptions({ name: 'UserInfoViewDialog' })

const message = useMessage() // 消息弹窗

const dialogVisible = ref(false)
const loading = ref(false)
const list = ref<UserInfo[]>([]) // 列表的数据
const UpdateBalanceFormRef = ref() // 修改用户余额表单

/** 打开弹窗 */
async function open(userId: number) {
  dialogVisible.value = true
  loading.value = true
  try {
    const data = await UserInfoApi.getUserInfoPage({ 
      pageNo: 1,
      pageSize: 1,
      id: userId 
    })
    list.value = data.list
  } finally {
    loading.value = false
  }
}

async function handleToggleUserStatus(row: any) {
  try {
    await UserInfoApi.toggleUserStatus({ userId: row.id })
    // 重新加载当前用户数据
    const data = await UserInfoApi.getUserInfoPage({ 
      pageNo: 1,
      pageSize: 1,
      id: row.id 
    })
    list.value = data.list
    message.success('状态已更新')
  }
  catch {
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

/** 添加/修改操作 */
const formRef = ref()

// 刷新数据
async function refreshData() {
  if (list.value.length > 0) {
    const userId = list.value[0].id
    const data = await UserInfoApi.getUserInfoPage({ 
      pageNo: 1,
      pageSize: 1,
      id: userId 
    })
    list.value = data.list
  }
}

defineExpose({ open })
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="用户信息"
    width="90%"
    destroy-on-close
    :close-on-click-modal="false"
  >
    <div v-loading="loading">
      <el-table
        :data="list"
        :stripe="true"
        :show-overflow-tooltip="true"
      >
        <el-table-column label="用户ID" align="center" prop="id" />
        <el-table-column label="手机号" align="center" prop="mobile" width="120" />
        <el-table-column label="用户昵称" align="center" prop="nickname" width="120" />
        <el-table-column label="用户头像" align="center" prop="avatar">
          <template #default="scope">
            <el-image
              v-if="scope.row.avatar"
              :src="scope.row.avatar"
              :preview-src-list="[scope.row.avatar]"
              preview-teleported
              fit="cover"
              style="width: 40px; height: 40px"
            />
          </template>
        </el-table-column>
        <el-table-column label="性别" align="center" prop="sex">
          <template #default="scope">
            <el-tag :type="scope.row.sex === 1 ? 'success' : scope.row.sex === 2 ? 'danger' : 'info'">
              {{ scope.row.sex === 1 ? '男' : scope.row.sex === 2 ? '女' : '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="简介" align="center" prop="signature" />
        <!-- 用户等级列 -->
        <el-table-column label="用户等级" align="center" min-width="180px">
          <template #default="scope">
            <div class="flex flex-col items-center justify-center gap-1">
              <template v-if="scope.row.levelApply">
                <el-tag v-if="scope.row.levelApply.levelName" type="success">
                  {{ scope.row.levelApply.levelName }}
                </el-tag>
                <div>保证金：{{ fenToYuan(scope.row.depositBalance) ?? 0 }}</div>
                <div>打手评分：{{ scope.row.contributePoint ?? 0 }}</div>
              </template>
              <template v-else-if="scope.row.accompanyLevelApply">
                <el-tag v-if="scope.row.accompanyLevelApply.levelName" type="warning">
                  {{ scope.row.accompanyLevelApply.levelName }}
                </el-tag>
              </template>
              <template v-else>
                <el-tag>普通用户</el-tag>
              </template>
            </div>
          </template>
        </el-table-column>

        <!-- 资产信息列 -->
        <el-table-column label="资产信息" align="center" min-width="180px">
          <template #default="scope">
            <div class="flex flex-col items-start gap-1">
              <div>余额：{{ fenToYuan(scope.row.wallet?.balance) ?? 0 }}</div>
              <div>冻结余额：{{ fenToYuan(scope.row.wallet?.freezePrice) ?? 0 }}</div>
            </div>
          </template>
        </el-table-column>

        <!-- 封禁状态 -->
        <el-table-column label="封禁状态" align="center" width="140">
          <template #default="scope">
            <el-switch
              v-hasPermi="['gamer:user-info:update']"
              :model-value="scope.row.status"
              :active-value="true"
              inline-prompt
              :inactive-value="false"
              style="--el-switch-off-color: #13ce66; --el-switch-on-color: #ff4949"
              active-text="封禁"
              inactive-text="正常"
              @change="() => handleToggleUserStatus(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="260px">
          <template #default="scope">
            <el-popover placement="bottom-start" trigger="click" :width="240" popper-class="!p-0">
              <template #reference>
                <el-button link type="info">
                  更多
                </el-button>
              </template>
              <el-menu class="border-none" mode="vertical">
                <!-- 查看下级用户 -->
                <el-menu-item
                  index="userstat"
                  @click="onUserMenuCommand('userstat', scope.row)"
                >
                  查看下级用户
                </el-menu-item>
                
                <el-menu-item
                  v-hasPermi="['pay:wallet:update-balance']"
                  index="balance"
                  @click="() => UpdateBalanceFormRef.open(scope.row.id)"
                >
                  修改余额
                </el-menu-item>

                <el-menu-item index="income" @click="onUserMenuCommand('userincome', scope.row)">
                  收入支出
                </el-menu-item>
                <el-sub-menu index="moment">
                  <template #title>
                    动态管理
                  </template>
                  <el-menu-item v-hasPermi="['gamer:user-info:update']" index="moment-m" @click="onUserMenuCommand('usermoment', scope.row)">
                    用户动态管理
                  </el-menu-item>
                  <el-menu-item v-hasPermi="['gamer:user-info:update']" index="moment-b" @click="onUserMenuCommand('usermomentbrowse', scope.row)">
                    用户浏览记录
                  </el-menu-item>
                  <el-menu-item v-hasPermi="['gamer:user-info:update']" index="moment-c" @click="onUserMenuCommand('usermomentcomment', scope.row)">
                    用户评论记录
                  </el-menu-item>
                  <el-menu-item v-hasPermi="['gamer:user-info:update']" index="moment-l" @click="onUserMenuCommand('usermomentlike', scope.row)">
                    用户点赞记录
                  </el-menu-item>
                </el-sub-menu>
              </el-menu>
            </el-popover>
          </template>
        </el-table-column>
      </el-table>
    </div>

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

    <!-- 表单弹窗：添加/修改 -->
    <UserInfoForm ref="formRef" @success="refreshData" />

    <!-- 修改用户余额弹窗 -->
    <UserBalanceUpdateForm ref="UpdateBalanceFormRef" @success="refreshData" />
  </el-dialog>
</template>


<script setup lang="ts">
import type { UserInfo } from '@/api/gamer/userinfo'
import { UserInfoApi } from '@/api/gamer/userinfo'
import { fenToYuan } from '@/utils'
import download from '@/utils/download'
import UserBalanceUpdateForm from '@/views/member/user/components/UserBalanceUpdateForm.vue'

import UserIncomeExpenseDetail from '../userincomeexpensedetail/index.vue'
import UserMoment from '../usermoment/index.vue'
import UserMomentBrowse from '../usermomentbrowse/index.vue'
import UserMomentComment from '../usermomentcomment/index.vue'
import UserMomentLike from '../usermomentlike/index.vue'
import UserInfoForm from './UserInfoForm.vue'

/** 用户信息 列表 */
defineOptions({ name: 'UserInfo' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<UserInfo[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  openid: undefined,
  mpOpenid: undefined,
  unionid: undefined,
  userCode: undefined,
  phone: undefined,
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
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
async function getList() {
  loading.value = true
  try {
    const data = await UserInfoApi.getUserInfoPage(queryParams)
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

/** 添加/修改操作 */
const formRef = ref()
function openForm(type: string, id?: number) {
  formRef.value.open(type, id)
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
const activeView = ref<'usermoment' | 'usermomentbrowse' | 'usermomentcomment' | 'usermomentlike' | 'userincome' | ''>('')
const viewMap = {
  usermoment: UserMoment,
  usermomentbrowse: UserMomentBrowse,
  usermomentcomment: UserMomentComment,
  usermomentlike: UserMomentLike,
  userincome: UserIncomeExpenseDetail,
} as const
const activeComponent = computed(() => (activeView.value ? viewMap[activeView.value] : null))
const titleMap: Record<string, string> = {
  usermoment: '用户动态管理',
  usermomentbrowse: '用户浏览记录',
  usermomentcomment: '用户评论记录',
  usermomentlike: '用户点赞记录',
  userincome: '用户收入支出记录',
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

const checkedIds = ref<number[]>([])
function handleRowCheckboxChange(records: UserInfo[]) {
  checkedIds.value = records.map(item => item.id)
}

/** 导出按钮操作 */
async function handleExport() {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await UserInfoApi.exportUserInfo(queryParams)
    download.excel(data, '用户信息.xls')
  }
  catch {
  }
  finally {
    exportLoading.value = false
  }
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
      <el-form-item label="用户ID" prop="userCode">
        <el-input
          v-model="queryParams.userCode"
          placeholder="请输入用户唯一编号"
          clearable
          class="!w-[240px]"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="queryParams.phone"
          placeholder="请输入手机号"
          clearable
          class="!w-[240px]"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户昵称" prop="nickname">
        <el-input
          v-model="queryParams.nickname"
          placeholder="请输入用户昵称"
          clearable
          class="!w-[240px]"
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <el-form-item label="城市" prop="city">
        <el-input
          v-model="queryParams.city"
          placeholder="请输入城市"
          clearable
          class="!w-[240px]"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="语音审核状态" prop="voiceAuditStatus">
        <el-select
          v-model="queryParams.voiceAuditStatus"
          placeholder="请选择语音审核状态"
          clearable
          class="!w-[240px]"
        >
          <el-option label="审核通过" value="1" />
          <el-option label="审核失败" value="0" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" class="mr-[5px]" /> 搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-[5px]" /> 重置
        </el-button>
        <el-button
          v-hasPermi="['gamer:user-info:create']"
          type="primary"
          plain
          @click="openForm('create')"
        >
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button>
        <el-button
          v-hasPermi="['gamer:user-info:export']"
          type="success"
          plain
          :loading="exportLoading"
          @click="handleExport"
        >
          <Icon icon="ep:download" class="mr-[5px]" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

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
      <!-- <el-table-column label="头像" align="center" prop="trueHead">
        <template #default="scope">
          <el-image
            v-if="scope.row.trueHead"
            :src="scope.row.trueHead"
            :preview-src-list="[scope.row.trueHead]"
            fit="cover"
            style="width: 40px; height: 40px"
          />
        </template>
      </el-table-column> -->
      <el-table-column label="性别" align="center" prop="sex">
        <template #default="scope">
          <el-tag :type="scope.row.sex === 1 ? 'success' : scope.row.sex === 2 ? 'danger' : 'info'">
            {{ scope.row.sex === 1 ? '男' : scope.row.sex === 2 ? '女' : '未知' }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- <el-table-column label="城市" align="center" prop="city" /> -->
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
              <div>打手上班状态：{{ scope.row.authStatus ? '已上班' : '已下班' }}</div>
              <div v-if="scope.row.levelApply.contact">
                联系手机号：{{ scope.row.levelApply.contact }}
              </div>
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
            <!-- <div>财富值：{{ scope.row.wealthVal ?? 0 }}</div>
            <div>魅力值：{{ scope.row.charmVal ?? 0 }}</div> -->
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
      <!-- <el-table-column label="达人名称" align="center" prop="davName" /> -->
      <el-table-column label="操作" align="center" width="260px">
        <template #default="scope">
          <!-- <el-button
            v-hasPermi="['gamer:user-info:update']"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button> -->
          <el-button
            v-hasPermi="['gamer:user-info:delete']"
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
          >
            删除
          </el-button>

          <el-popover placement="bottom-start" trigger="click" :width="240" popper-class="!p-0">
            <template #reference>
              <el-button link type="info">
                更多
              </el-button>
            </template>
            <el-menu class="border-none" mode="vertical">
              <el-menu-item
                v-hasPermi="['pay:wallet:update-balance']"
                index="balance"
                @click="UpdateBalanceFormRef.open(scope.row.id)"
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

  <!-- 表单弹窗：添加/修改 -->
  <UserInfoForm ref="formRef" @success="getList" />

  <!-- 修改用户余额弹窗 -->
  <UserBalanceUpdateForm ref="UpdateBalanceFormRef" @success="getList" />
</template>

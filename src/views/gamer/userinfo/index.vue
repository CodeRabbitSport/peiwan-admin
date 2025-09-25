<script setup lang="ts">
import type { UserInfo } from '@/api/gamer/userinfo'
import { UserInfoApi } from '@/api/gamer/userinfo'
import download from '@/utils/download'

import UserMoment from '../usermoment/index.vue'
import UserMomentBrowse from '../usermomentbrowse/index.vue'
import UserMomentComment from '../usermomentcomment/index.vue'
import UserMomentLike from '../usermomentlike/index.vue'
import UserInfoForm from './UserInfoForm.vue'
import UserIncomeExpenseDetail from '../userincomeexpensedetail/index.vue'

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
      <el-table-column label="手机号" align="center" prop="phone" />
      <el-table-column label="用户昵称" align="center" prop="nickname" />
      <el-table-column label="用户头像" align="center" prop="avatar">
        <template #default="scope">
          <el-image
            v-if="scope.row.avatar"
            :src="scope.row.avatar"
            :preview-src-list="[scope.row.avatar]"
            fit="cover"
            style="width: 40px; height: 40px"
          />
        </template>
      </el-table-column>
      <el-table-column label="真实头像地址" align="center" prop="trueHead">
        <template #default="scope">
          <el-image
            v-if="scope.row.trueHead"
            :src="scope.row.trueHead"
            :preview-src-list="[scope.row.trueHead]"
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
      <el-table-column label="城市" align="center" prop="city" />
      <el-table-column label="个性签名/简介" align="center" prop="signature" />
      <el-table-column label="余额" align="center" prop="money" />
      <el-table-column label="礼物余额" align="center" prop="giftMoney" />
      <el-table-column label="财富值" align="center" prop="wealthVal" />
      <el-table-column label="魅力值" align="center" prop="charmVal" />
      <el-table-column label="达人名称" align="center" prop="davName" />
      <el-table-column label="操作" align="center" width="200px">
        <template #default="scope">
          <!-- 查看用户提现账号 -->
          <el-button link type="primary" @click="onUserMenuCommand('userincome', scope.row)">
            收入支出
          </el-button>
          <!-- 用户相关操作 -->
          <el-dropdown trigger="click" @command="(cmd) => onUserMenuCommand(cmd as any, scope.row)">
            <el-button
              v-hasPermi="['gamer:user-info:update']"
              link
              type="primary"
            >
              动态管理 <Icon icon="ep:arrow-down" class="ml-[4px]" />
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="usermoment">
                  用户动态管理
                </el-dropdown-item>
                <el-dropdown-item command="usermomentbrowse">
                  用户浏览记录
                </el-dropdown-item>
                <el-dropdown-item command="usermomentcomment">
                  用户评论记录
                </el-dropdown-item>
                <el-dropdown-item command="usermomentlike">
                  用户点赞记录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button
            v-hasPermi="['gamer:user-info:update']"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-hasPermi="['gamer:user-info:delete']"
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
          >
            删除
          </el-button>
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
</template>

<script setup lang="ts">
import type { LevelApply } from '@/api/gamer/levelapply'
import { LevelApply_syncUserGameRegion, LevelApplyApi } from '@/api/gamer/levelapply'
import { LevelConfigApi } from '@/api/gamer/levelconfig'
import CategorySelect from '@/components/CategorySelect/index.vue'
import UserMultiSelectInput from '@/components/UserSelectInput/UserMultiSelectInput.vue'
import { fenToYuan } from '@/utils'
import { dateFormatter } from '@/utils/formatTime'
import { checkPermi } from '@/utils/permission'

import UserBalanceUpdateForm from '../userinfo/UserBalanceUpdateForm.vue'
import UserInfoViewDialog from '../userinfo/UserInfoViewDialog.vue'
import CompanionDataDialog from './CompanionDataDialog.vue'
import RoleMemberProfileDialog from './RoleMemberProfileDialog.vue'

/** 陪玩列表（只展示已通过的申请） */
defineOptions({ name: 'Companion' })

const message = useMessage()

// 获取区服 tag 颜色（根据索引循环）
function getRegionTagType(index: number): 'success' | 'info' | 'warning' | 'danger' {
  const types: ('success' | 'info' | 'warning' | 'danger')[] = ['success', 'info', 'warning', 'danger']
  return types[index % types.length]
}

function sortVoteCount(a: LevelApply, b: LevelApply) {
  return Number(a.voteCount || 0) - Number(b.voteCount || 0)
}

const loading = ref(true) // 列表的加载中
const list = ref<LevelApply[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: undefined,
  productCategoryId: undefined,
  // 固定只查询陪玩类型的已通过申请
  levelType: 1,
  auditStatus: 1,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单

/** 查询列表 */
async function getList() {
  loading.value = true
  try {
    // 强制固定 levelType=1、auditStatus=1，只返回已通过的陪玩
    const data = await LevelApplyApi.getLevelApplyPage({ ...queryParams, levelType: 1, auditStatus: 1 })
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
  queryParams.levelType = 1
  queryParams.auditStatus = 1
  handleQuery()
}

// 用户信息弹窗
const userInfoDialogRef = ref()
function handleViewUserInfo(userId: number) {
  userInfoDialogRef.value.open(userId)
}

// 查看陪玩数据弹窗
const companionDataDialogRef = ref()
function handleViewCompanionData(row: LevelApply) {
  companionDataDialogRef.value.open(row.userId, row.userNickname, 1)
}

// 当前票数调整（沿用 companionapply 的增加/减少票数接口）
const voteDialogVisible = ref(false)
const voteSubmitting = ref(false)
const currentVoteRow = ref<LevelApply | null>(null)
const voteChangeType = ref<'add' | 'subtract'>('add')
const voteChangeCount = ref(1)
const adjustedVoteCount = computed(() => {
  const current = Number(currentVoteRow.value?.voteCount || 0)
  return voteChangeType.value === 'add' ? current + voteChangeCount.value : current - voteChangeCount.value
})

function openVoteDialog(row: LevelApply) {
  currentVoteRow.value = row
  voteChangeType.value = 'add'
  voteChangeCount.value = 1
  voteDialogVisible.value = true
}

async function confirmAdjustVoteCount() {
  if (!currentVoteRow.value) return
  const count = Math.trunc(Number(voteChangeCount.value))
  if (!Number.isFinite(count) || count <= 0) {
    message.warning('请输入大于0的整数票数')
    return
  }
  if (voteChangeType.value === 'subtract' && count > Number(currentVoteRow.value.voteCount || 0)) {
    message.warning('减少票数不能超过当前票数')
    return
  }
  const actionText = voteChangeType.value === 'add' ? '增加' : '减少'
  try {
    await message.confirm(`确认给“${currentVoteRow.value.userNickname || currentVoteRow.value.userId}”${actionText}${count}张票？`)
    voteSubmitting.value = true
    await LevelApplyApi.adjustVoteCount({
      id: currentVoteRow.value.id,
      changeCount: voteChangeType.value === 'add' ? count : -count,
    })
    message.success(`票数${actionText}成功`)
    voteDialogVisible.value = false
    await getList()
  }
  catch {}
  finally {
    voteSubmitting.value = false
  }
}

// 修改等级（沿用 companionapply / level-apply 页面流程）
const editLevelDialogVisible = ref(false)
const editLevelLoading = ref(false)
const currentEditLevelRow = ref<LevelApply | null>(null)
const selectedLevelId = ref<number | undefined>(undefined)
const levelOptions = ref<any[]>([])

async function handleEditLevel(row: LevelApply) {
  currentEditLevelRow.value = row
  selectedLevelId.value = row.level
  try {
    const data = await LevelConfigApi.getLevelConfigPage({
      categoryType: row.levelType,
      categoryId: row.levelType === 1 ? row.productCategoryId : undefined,
      pageNo: 1,
      pageSize: 100,
    })
    levelOptions.value = data.list || []
  }
  catch {
    levelOptions.value = []
  }
  editLevelDialogVisible.value = true
}

async function confirmEditLevel() {
  if (!currentEditLevelRow.value || selectedLevelId.value === undefined) {
    message.warning('请选择等级')
    return
  }
  editLevelLoading.value = true
  try {
    await LevelApplyApi.updateLevelApply({
      ...currentEditLevelRow.value,
      level: selectedLevelId.value,
    })
    await LevelApply_syncUserGameRegion(currentEditLevelRow.value.id)
    message.success('修改等级成功')
    editLevelDialogVisible.value = false
    await getList()
  }
  finally {
    editLevelLoading.value = false
  }
}

// 成员资料、余额与封禁操作
const memberProfileDialogRef = ref()
const balanceUpdateFormRef = ref()
async function handleToggleRoleBan(row: LevelApply) {
  const banned = !row.roleBanned
  const action = banned ? '封禁' : '解封'
  try {
    await message.confirm(`确认${action}“${row.userNickname || row.userId}”的陪玩身份？`)
    await LevelApplyApi.updateRoleBanStatus({
      userId: row.userId,
      levelType: 1,
      banned,
    })
    message.success(`${action}成功`)
    await getList()
  }
  catch {}
}

function handleEditProfile(row: LevelApply) {
  memberProfileDialogRef.value.open(row.userId)
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
          :category-type="1"
          placeholder="请选择用户"
          @change="handleQuery"
        />
      </el-form-item>
      <el-form-item label="所属分类" prop="productCategoryId">
        <CategorySelect
          v-model="queryParams.productCategoryId"
          class="!w-[240px]"
        />
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
    >
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="用户ID" align="center" prop="userId">
        <template #default="scope">
          <el-link type="primary" @click="handleViewUserInfo(scope.row.userId)">
            {{ scope.row.userId }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="用户信息" align="center" prop="userNickname" min-width="180">
        <template #default="scope">
          <div class="flex flex-col items-center justify-center gap-3">
            <el-avatar :size="44" :src="scope.row.userAvatar">
              {{ (scope.row.userNickname || '?').slice(0, 1) }}
            </el-avatar>
            <el-link type="primary" @click="handleViewUserInfo(scope.row.userId)">
              {{ scope.row.userNickname || '--' }}
            </el-link>
            <span class="text-xs text-[#909399]">ID：{{ scope.row.userId }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="所属分类" align="center" prop="categoryName" />
      <el-table-column label="申请区服" align="center" prop="gameRegion" width="180">
        <template #default="scope">
          <div v-if="scope.row.gameRegion" class="flex flex-wrap justify-center gap-1">
            <el-tag
              v-for="(region, idx) in scope.row.gameRegion.split(',').filter(Boolean)"
              :key="idx"
              :type="getRegionTagType(idx)"
              size="small"
            >
              {{ region.trim() }}
            </el-tag>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="等级" align="center" prop="levelName" min-width="140">
        <template #default="scope">
          <div class="flex flex-col items-center gap-1">
            <el-image
              v-if="scope.row.levelIcon"
              :src="scope.row.levelIcon"
              :preview-src-list="[scope.row.levelIcon]"
              fit="contain"
              preview-teleported
              class="h-10 w-10"
            />
            <span>{{ scope.row.levelName || '--' }}</span>
            <el-button
              v-hasPermi="['gamer:level-apply:update']"
              type="primary"
              size="small"
              link
              @click="handleEditLevel(scope.row)"
            >
              修改等级
            </el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="当前票数"
        align="center"
        prop="voteCount"
        width="100"
        sortable
        :sort-method="sortVoteCount"
        label-class-name="vote-count-header"
      >
        <template #default="scope">
          <el-button
            v-hasPermi="['gamer:level-apply:update']"
            link
            type="primary"
            @click="openVoteDialog(scope.row)"
          >
            {{ scope.row.voteCount || 0 }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="联系方式" align="center" prop="contact" />
      <el-table-column label="余额" align="center" width="120">
        <template #default="scope">
          <el-button
            v-hasPermi="['pay:wallet:update-balance']"
            link
            type="primary"
            @click="balanceUpdateFormRef.open(scope.row.userId)"
          >
            {{ fenToYuan(scope.row.walletBalance) ?? 0 }}
          </el-button>
          <span v-if="!checkPermi(['pay:wallet:update-balance'])">
            {{ fenToYuan(scope.row.walletBalance) ?? 0 }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="时间信息" align="center" min-width="210">
        <template #default="scope">
          <div class="flex flex-col items-center gap-1 text-xs">
            <span>创建时间：{{ dateFormatter(null, null, scope.row.createTime) || '--' }}</span>
            <span>最后登录IP：{{ scope.row.loginIp || '--' }}</span>
            <span>登录时间：{{ dateFormatter(null, null, scope.row.loginDate) || '--' }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="封禁状态" align="center" width="130">
        <template #default="scope">
          <el-switch
            v-hasPermi="['gamer:level-apply:update']"
            :model-value="Boolean(scope.row.roleBanned)"
            active-text="已封禁"
            inactive-text="正常"
            inline-prompt
            :active-value="true"
            :inactive-value="false"
            style="--el-switch-off-color: #13ce66; --el-switch-on-color: #ff4949"
            @change="handleToggleRoleBan(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="250px" fixed="right">
        <template #default="scope">
          <el-button
            v-hasPermi="['gamer:user-info:update']"
            link
            type="primary"
            @click="handleEditProfile(scope.row)"
          >
            修改资料
          </el-button>
          <el-button
            v-hasPermi="['gamer:level-apply:query']"
            link
            type="primary"
            @click="handleViewCompanionData(scope.row)"
          >
            查看数据
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 用户信息查看弹窗 -->
  <UserInfoViewDialog ref="userInfoDialogRef" />

  <!-- 查看陪玩数据弹窗 -->
  <CompanionDataDialog ref="companionDataDialogRef" />

  <!-- 当前票数调整 -->
  <el-dialog
    v-model="voteDialogVisible"
    title="调整票数"
    width="460px"
    :close-on-click-modal="false"
  >
    <el-form label-width="90px">
      <el-form-item label="成员">
        <div class="flex items-center gap-3">
          <el-avatar :size="40" :src="currentVoteRow?.userAvatar">
            {{ (currentVoteRow?.userNickname || '?').slice(0, 1) }}
          </el-avatar>
          <span>{{ currentVoteRow?.userNickname || currentVoteRow?.userId }}</span>
        </div>
      </el-form-item>
      <el-form-item label="当前票数">
        {{ currentVoteRow?.voteCount || 0 }} 张
      </el-form-item>
      <el-form-item label="调整方式">
        <el-radio-group v-model="voteChangeType">
          <el-radio-button value="add">
            增加
          </el-radio-button>
          <el-radio-button value="subtract">
            减少
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="调整数量" required>
        <el-input-number
          v-model="voteChangeCount"
          :min="1"
          :max="999999999"
          :precision="0"
          :step="1"
          controls-position="right"
          class="!w-[220px]"
        />
      </el-form-item>
      <el-form-item label="调整后票数">
        <span :class="adjustedVoteCount < 0 ? 'text-red-500' : 'font-medium'">
          {{ adjustedVoteCount }} 张
        </span>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="voteSubmitting" @click="voteDialogVisible = false">
        取消
      </el-button>
      <el-button type="primary" :loading="voteSubmitting" @click="confirmAdjustVoteCount">
        确认调整
      </el-button>
    </template>
  </el-dialog>

  <!-- 修改资料 -->
  <RoleMemberProfileDialog ref="memberProfileDialogRef" @success="getList" />

  <!-- 修改等级 -->
  <el-dialog
    v-model="editLevelDialogVisible"
    title="修改等级"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form label-width="100px">
      <el-form-item label="选择等级">
        <el-select v-model="selectedLevelId" placeholder="请选择等级" class="w-full">
          <el-option
            v-for="option in levelOptions"
            :key="option.levelNumber"
            :label="`${option.levelName} (${option.levelNumber}级)`"
            :value="option.levelNumber"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="editLevelLoading" @click="editLevelDialogVisible = false">
        取消
      </el-button>
      <el-button type="primary" :loading="editLevelLoading" @click="confirmEditLevel">
        确定
      </el-button>
    </template>
  </el-dialog>

  <!-- 余额加减 -->
  <UserBalanceUpdateForm ref="balanceUpdateFormRef" @success="getList" />
</template>

<style scoped lang="scss">
:deep(.vote-count-header > .cell) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding-left: 4px;
  padding-right: 4px;
}

:deep(.vote-count-header .caret-wrapper) {
  order: -1;
}
</style>

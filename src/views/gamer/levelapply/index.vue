<script setup lang="ts">
import type { LevelApply } from '@/api/gamer/levelapply'
import { LevelApply_syncUserGameRegion, LevelApplyApi } from '@/api/gamer/levelapply'
import { ProductCategoryApi } from '@/api/gamer/productcategory'
import CategorySelect from '@/components/CategorySelect/index.vue'
import { dateFormatter } from '@/utils/formatTime'
import { isEmpty } from '@/utils/is'

import LevelApplyForm from './LevelApplyForm.vue'
import UserInfoViewDialog from '../userinfo/UserInfoViewDialog.vue'

/** 打手/陪玩等级申请 列表 */
defineOptions({ name: 'LevelApply' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

// 获取区服 tag 颜色（根据索引循环）
function getRegionTagType(index: number): 'success' | 'info' | 'warning' | 'danger' {
  const types: ('success' | 'info' | 'warning' | 'danger')[] = ['success', 'info', 'warning', 'danger']
  return types[index % types.length]
}

// 修改区服弹窗相关
const editRegionDialogVisible = ref(false)
const editRegionLoading = ref(false)
const currentEditRow = ref<LevelApply | null>(null)
const selectedRegions = ref<string[]>([])
const regionOptions = ref<string[]>([])

// 打开修改区服弹窗
async function handleEditRegion(row: LevelApply) {
  currentEditRow.value = row
  // 设置当前已选中的区服
  selectedRegions.value = row.gameRegion ? row.gameRegion.split(',').map(r => r.trim()).filter(Boolean) : []

  // 获取分类的接单大区选项
  if (row.productCategoryId) {
    try {
      const categoryData = await ProductCategoryApi.getProductCategory(row.productCategoryId)
      if (categoryData.orderReceivingRegion) {
        // 解析分类的接单大区（逗号分隔字符串）
        regionOptions.value = String(categoryData.orderReceivingRegion)
          .split(',')
          .map(r => r.trim())
          .filter(Boolean)
      }
      else {
        regionOptions.value = []
      }
    }
    catch (error) {
      console.error('获取分类接单大区失败:', error)
      regionOptions.value = []
    }
  }

  editRegionDialogVisible.value = true
}

// 确认修改区服
async function confirmEditRegion() {
  if (!currentEditRow.value) return

  editRegionLoading.value = true
  try {
    // 1. 先调用更新接口修改 gameRegion
    const updateData = {
      ...currentEditRow.value,
      gameRegion: selectedRegions.value.join(','),
    }
    await LevelApplyApi.updateLevelApply(updateData)

    // 2. 再调用同步接口
    await LevelApply_syncUserGameRegion(currentEditRow.value.id)

    message.success('修改区服成功')
    editRegionDialogVisible.value = false
    // 刷新列表
    await getList()
  }
  catch (error) {
    console.error('修改区服失败:', error)
  }
  finally {
    editRegionLoading.value = false
  }
}

const loading = ref(true) // 列表的加载中
const list = ref<LevelApply[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userNickname: undefined,
  userId: undefined,
  productCategoryId: undefined,
  levelType: 2, // 打手类型
  level: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单

/** 查询列表 */
async function getList() {
  loading.value = true
  try {
    const data = await LevelApplyApi.getLevelApplyPage(queryParams)
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

async function handleToggleAuditStatus(row: LevelApply, status: number) {
  const originalStatus = row.auditStatus
  if (status === originalStatus) return

  try {
    if (status === 1) {
      await LevelApplyApi.auditLevelApply({ id: row.id, auditStatus: 1 })
      row.auditStatus = 1
      row.rejectReason = ''
      message.success('审核通过')
    }
    else if (status === 2) {
      const { value } = await message.prompt('请输入拒绝原因', '审核拒绝')
      const reason = (value || '').trim()
      if (!reason) {
        message.warning('请填写拒绝原因')
        return
      }
      await LevelApplyApi.auditLevelApply({ id: row.id, auditStatus: 2, rejectReason: reason })
      row.auditStatus = 2
      row.rejectReason = reason
      message.success('已拒绝')
    }
    await getList()
  }
  catch {
    row.auditStatus = originalStatus
  }
}

/** 删除按钮操作 */
async function handleDelete(id: number) {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await LevelApplyApi.deleteLevelApply(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  }
  catch {}
}
const checkedIds = ref<number[]>([])

/** 批量删除打手/陪玩等级申请 */
async function handleDeleteBatch() {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await LevelApplyApi.deleteLevelApplyList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  }
  catch {}
}

function handleRowCheckboxChange(records: LevelApply[]) {
  checkedIds.value = records.map(item => item.id)
}

// 用户信息弹窗
const userInfoDialogRef = ref()
function handleViewUserInfo(userId: number) {
  userInfoDialogRef.value.open(userId)
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
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户ID"
          clearable
          class="!w-[240px]"
        />
      </el-form-item>
      <el-form-item label="用户昵称" prop="userNickname">
        <el-input
          v-model="queryParams.userNickname"
          placeholder="请输入用户昵称"
          clearable
          class="!w-[240px]"
        />
      </el-form-item>
      <el-form-item label="商品分类" prop="productCategoryId">
        <CategorySelect
          v-model="queryParams.productCategoryId"
          class="!w-[240px]"
        />
      </el-form-item>
      <!-- <el-form-item label="等级类型" prop="levelType">
        <el-select
          v-model="queryParams.levelType"
          placeholder="请选择等级类型"
          clearable
          class="!w-[240px]"
        >
          <el-option label="打手" :value="1" />
          <el-option label="陪玩" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="级别" prop="level">
        <el-input
          v-model="queryParams.level"
          placeholder="请输入级别"
          clearable
          class="!w-[240px]"
        />
      </el-form-item> -->
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
        <el-button
          v-hasPermi="['gamer:level-apply:create']"
          type="primary"
          plain
          @click="openForm('create')"
        >
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button>
        <el-button
          v-hasPermi="['gamer:level-apply:delete']"
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
      <el-table-column label="用户ID" align="center" prop="userId">
        <template #default="scope">
          <el-link type="primary" @click="handleViewUserInfo(scope.row.userId)">
            {{ scope.row.userId }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="用户昵称" align="center" prop="userNickname">
        <template #default="scope">
          <el-link type="primary" @click="handleViewUserInfo(scope.row.userId)">
            {{ scope.row.userNickname }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="所属分类" align="center" prop="categoryName" />
      <el-table-column label="申请区服" align="center" prop="gameRegion" width="180">
        <template #default="scope">
          <div class="flex flex-col items-center gap-2">
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
            <el-button
              v-if="scope.row.auditStatus === 1"
              type="primary"
              size="small"
              link
              @click="handleEditRegion(scope.row)"
            >
              修改区服
            </el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="等级类型" align="center" prop="levelType">
        <template #default>
          <el-tag type="warning">
            打手
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="级别" align="center" prop="level" />
      <el-table-column label="个人介绍" align="center" prop="personalIntroduction" />
      <el-table-column label="驳回原因" align="center" prop="rejectReason" />
      <el-table-column label="联系方式" align="center" prop="contact" />
      <el-table-column label="图片附件" align="center" prop="imageAttachment" width="120">
        <template #default="scope">
          <div v-if="scope.row.imageAttachment" class="flex flex-col items-center gap-1">
            <el-image
              :src="scope.row.imageAttachment.split(',').filter(Boolean)[0].trim()"
              :preview-src-list="scope.row.imageAttachment.split(',').map(u => u.trim()).filter(Boolean)"
              fit="cover"
              preview-teleported
              style="width: 60px; height: 60px; cursor: pointer;"
            />
            <span style="font-size: 12px; color: #909399;">
              共{{ scope.row.imageAttachment.split(',').filter(Boolean).length }}张
            </span>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="语音附件" align="center" prop="attachment" width="200">
        <template #default="scope">
          <div v-if="scope.row.attachment" class="flex justify-center">
            <audio :src="scope.row.attachment" controls style="max-width: 180px; height: 32px;" />
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="审核状态" align="center" prop="auditStatus" width="160">
        <template #default="scope">
          <div class="flex flex-col items-center gap-1">
            <template v-if="scope.row.auditStatus === 0">
              <el-button-group>
                <el-button size="small" type="success" @click="handleToggleAuditStatus(scope.row, 1)">
                  通过
                </el-button>
                <el-button size="small" type="danger" @click="handleToggleAuditStatus(scope.row, 2)">
                  不通过
                </el-button>
              </el-button-group>
              <el-tag type="info">
                待审核
              </el-tag>
            </template>
            <template v-else>
              <el-tag :type="scope.row.auditStatus === 1 ? 'success' : 'danger'">
                {{ scope.row.auditStatus === 1 ? '审核通过' : '审核拒绝' }}
              </el-tag>
            </template>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            v-hasPermi="['gamer:level-apply:update']"
            link
            type="primary"
            @click="openForm('detail', scope.row.id)"
          >
            查看
          </el-button>
          <el-button
            v-hasPermi="['gamer:level-apply:delete']"
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
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <LevelApplyForm ref="formRef" @success="getList" />

  <!-- 用户信息查看弹窗 -->
  <UserInfoViewDialog ref="userInfoDialogRef" />

  <!-- 修改区服弹窗 -->
  <el-dialog
    v-model="editRegionDialogVisible"
    title="修改区服"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form label-width="100px">
      <el-form-item label="选择区服">
        <el-select
          v-model="selectedRegions"
          multiple
          placeholder="请选择区服"
          class="w-full"
          collapse-tags-tooltip
        >
          <el-option
            v-for="option in regionOptions"
            :key="option"
            :label="option"
            :value="option"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="editRegionDialogVisible = false">
        取消
      </el-button>
      <el-button
        type="primary"
        :loading="editRegionLoading"
        @click="confirmEditRegion"
      >
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

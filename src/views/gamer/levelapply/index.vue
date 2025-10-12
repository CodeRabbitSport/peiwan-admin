<script setup lang="ts">
import type { LevelApply } from '@/api/gamer/levelapply'
import { LevelApplyApi } from '@/api/gamer/levelapply'
import { dateFormatter } from '@/utils/formatTime'
import { isEmpty } from '@/utils/is'

import LevelApplyForm from './LevelApplyForm.vue'

/** 打手/陪玩等级申请 列表 */
defineOptions({ name: 'LevelApply' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<LevelApply[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: undefined,
  productCategoryId: undefined,
  levelType: undefined,
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

async function handleAuditSwitch(row: LevelApply, val: boolean) {
  const originalStatus = row.auditStatus
  if (val && originalStatus === 1) return
  if (!val && originalStatus === 2) return

  try {
    if (val) {
      await LevelApplyApi.auditLevelApply({ id: row.id, auditStatus: 1 })
      row.auditStatus = 1
      row.rejectReason = ''
      message.success('审核通过')
    }
    else {
      const { value } = await message.prompt('请输入拒绝原因', '审核拒绝')
      const reason = (value || '').trim()
      if (!reason) {
        message.warning('请填写拒绝原因')
        row.auditStatus = originalStatus
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
      <el-form-item label="商品分类" prop="productCategoryId">
        <el-input
          v-model="queryParams.productCategoryId"
          placeholder="请输入所属商品分类ID"
          clearable
          class="!w-[240px]"
          
        />
      </el-form-item>
      <el-form-item label="等级类型" prop="levelType">
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
      <el-table-column label="用户ID" align="center" prop="userId" />
      <el-table-column label="所属分类" align="center" prop="categoryName" />
      <el-table-column label="等级类型" align="center" prop="levelType">
        <template #default="scope">
          <el-tag
            :type="scope.row.levelType === 2 ? 'success' : scope.row.levelType === 1 ? 'danger' : 'info'"
          >
            {{ scope.row.levelType === 2 ? '打手' : scope.row.levelType === 1 ? '陪玩' : '未知' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="级别" align="center" prop="level" />
      <el-table-column label="个人介绍" align="center" prop="personalIntroduction" />
      <el-table-column label="驳回原因" align="center" prop="rejectReason" />
      <el-table-column label="联系方式" align="center" prop="contact" />
      <el-table-column label="图片附件" align="center" prop="imageAttachment">
        <template #default="scope">
          <el-image :src="scope.row.imageAttachment" :preview-src-list="[scope.row.imageAttachment]" fit="cover" preview-teleported/>
        </template>
      </el-table-column>
      <el-table-column label="附件" align="center" prop="attachment" />
      <el-table-column label="审核状态" align="center" prop="auditStatus" width="180px">
        <template #default="scope">
          <div class="flex flex-col items-center gap-1">
            <el-switch
              :model-value="scope.row.auditStatus === 1"
              :active-value="true"
              :inactive-value="false"
              inline-prompt
              active-text="通过"
              inactive-text="拒绝"
              @change="(val) => handleAuditSwitch(scope.row, Boolean(val))"
            />
            <el-tag v-if="scope.row.auditStatus === 0" type="info">
              待审核
            </el-tag>
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
            @click="openForm('update', scope.row.id)"
          >
            编辑
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
</template>

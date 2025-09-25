<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-[15px]"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="用户ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户ID"
          clearable
          @keyup.enter="handleQuery"
          class="!w-[240px]"
        />
      </el-form-item>
      <el-form-item label="商品分类" prop="productCategoryId">
        <el-input
          v-model="queryParams.productCategoryId"
          placeholder="请输入所属商品分类ID"
          clearable
          @keyup.enter="handleQuery"
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
          @keyup.enter="handleQuery"
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
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-[5px]" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-[5px]" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['gamer:level-apply:create']"
        >
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button>
        <el-button
            type="danger"
            plain
            :disabled="isEmpty(checkedIds)"
            @click="handleDeleteBatch"
            v-hasPermi="['gamer:level-apply:delete']"
        >
          <Icon icon="ep:delete" class="mr-[5px]" /> 批量删除
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
        row-key="id"
        v-loading="loading"
        :data="list"
        :stripe="true"
        :show-overflow-tooltip="true"
        @selection-change="handleRowCheckboxChange"
    >
    <el-table-column type="selection" width="55" />
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="用户ID" align="center" prop="userId" />
      <el-table-column label="所属商品" align="center" prop="productCategoryId" />
      <el-table-column label="等级类型" align="center" prop="levelType">
        <template #default="scope">
          <el-tag
            :type="scope.row.levelType === 2 ? 'success' : scope.row.levelType === 1 ? 'danger' : 'info'">
            {{ scope.row.levelType === 2 ? '打手' : scope.row.levelType === 1 ? '陪玩' : '未知' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="级别" align="center" prop="level" />
      <el-table-column label="个人介绍" align="center" prop="personalIntroduction" />
      <el-table-column label="驳回原因" align="center" prop="rejectReason" />
      <el-table-column label="联系方式" align="center" prop="contact" />
      <el-table-column label="图片附件" align="center" prop="imageAttachment" />
      <el-table-column label="附件" align="center" prop="attachment" />
      <el-table-column label="审核状态" align="center" prop="auditStatus">
        <template #default="scope">
          <el-tag
            :type="scope.row.auditStatus === 0 ? 'success' : scope.row.auditStatus === 1 ? 'danger' : 'info'">
            {{ scope.row.auditStatus === 0 ? '待审核' : scope.row.auditStatus === 1 ? '通过' : '拒绝' }}
          </el-tag>
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
          <el-dropdown
            trigger="click"
            @command="(cmd) => handleAudit(cmd, scope.row)"
          >
            <el-button link type="primary">
              审核
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="pass">审核通过</el-dropdown-item>
                <el-dropdown-item command="reject">审核拒绝</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['gamer:level-apply:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['gamer:level-apply:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <LevelApplyForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { LevelApplyApi, LevelApply } from '@/api/gamer/levelapply'
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
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await LevelApplyApi.getLevelApplyPage(queryParams)
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

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 审核操作 */
const handleAudit = async (command: string, row: LevelApply) => {
  try {
    if (command === 'pass') {
      await LevelApplyApi.auditLevelApply({ id: row.id, auditStatus: 1 })
      message.success('审核通过')
    } else if (command === 'reject') {
      const { value } = await message.prompt('请输入拒绝原因', '审核拒绝')
      const reason = (value || '').trim()
      if (!reason) {
        message.warning('请填写拒绝原因')
        return
      }
      await LevelApplyApi.auditLevelApply({ id: row.id, auditStatus: 2, rejectReason: reason })
      message.success('已拒绝')
    }
    await getList()
  } catch {}
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await LevelApplyApi.deleteLevelApply(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除打手/陪玩等级申请 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await LevelApplyApi.deleteLevelApplyList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: LevelApply[]) => {
  checkedIds.value = records.map((item) => item.id);
}

/** 导出按钮操作（已隐藏按钮，保留逻辑以备后用） */
const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await LevelApplyApi.exportLevelApply(queryParams)
    download.excel(data, '打手/陪玩等级申请.xls')
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

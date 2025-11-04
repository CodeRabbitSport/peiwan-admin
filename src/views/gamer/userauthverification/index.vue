<script setup lang="ts">
import { UserAuthVerification_auditUserAuthVerification, UserAuthVerificationApi } from '@/api/gamer/userauthverification'
import type { UserAuthVerification } from '@/api/gamer/userauthverification'
import download from '@/utils/download'
import { dateFormatter } from '@/utils/formatTime'
import { isEmpty } from '@/utils/is'

import UserAuthVerificationForm from './UserAuthVerificationForm.vue'

/** 用户实名认证申请 列表 */
defineOptions({ name: 'UserAuthVerification' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<UserAuthVerification[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: undefined,
  realName: undefined,
  idCardNo: undefined,
  status: undefined,
  rejectReason: undefined,
  reviewerId: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
async function getList() {
  loading.value = true
  try {
    const data = await UserAuthVerificationApi.getUserAuthVerificationPage(queryParams)
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

async function handleToggleUserAuthStatus(row: UserAuthVerification, status: number) {
  const originalStatus = row.status
  if (status === originalStatus) return

  try {
    if (status === 1) {
      await UserAuthVerification_auditUserAuthVerification({ id: row.id, status: 1 })
      row.status = 1
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
      await UserAuthVerification_auditUserAuthVerification({ id: row.id, status: 2, rejectReason: reason })
      row.status = 2
      row.rejectReason = reason
      message.success('已拒绝')
    }
    await getList()
  }
  catch {
    row.status = originalStatus
  }
}

/** 删除按钮操作 */
async function handleDelete(id: number) {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await UserAuthVerificationApi.deleteUserAuthVerification(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  }
  catch {}
}

const checkedIds = ref<number[]>([])

/** 批量删除用户实名认证申请 */
async function handleDeleteBatch() {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await UserAuthVerificationApi.deleteUserAuthVerificationList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  }
  catch {}
}

function handleRowCheckboxChange(records: UserAuthVerification[]) {
  checkedIds.value = records.map(item => item.id)
}

/** 导出按钮操作（已隐藏按钮，保留逻辑以备后用） */
async function handleExport() {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await UserAuthVerificationApi.exportUserAuthVerification(queryParams)
    download.excel(data, '用户实名认证申请.xls')
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
      <el-form-item label="用户" prop="userId">
        <UserMultiSelectInput
          v-model="queryParams.userId"
          :multiple="false"
          placeholder="请选择用户"
          @change="handleQuery"
        />
      </el-form-item>
      <el-form-item label="真实姓名" prop="realName">
        <el-input
          v-model="queryParams.realName"
          placeholder="请输入真实姓名"
          clearable
          class="!w-[240px]"
        />
      </el-form-item>
      <!-- <el-form-item label="身份证号码" label-width="100px" prop="idCardNo">
        <el-input
          v-model="queryParams.idCardNo"
          placeholder="请输入身份证号码"
          clearable
          class="!w-[240px]"

        />
      </el-form-item> -->
      <el-form-item label="审核状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择审核状态"
          clearable
          class="!w-[240px]"
        >
          <el-option label="待审核" :value="0" />
          <el-option label="审核通过" :value="1" />
          <el-option label="审核拒绝" :value="2" />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="审核人ID" prop="reviewerId">
        <el-input
          v-model="queryParams.reviewerId"
          placeholder="请输入审核人ID"
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
      </el-form-item> -->
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" class="mr-[5px]" /> 搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-[5px]" /> 重置
        </el-button>
        <!-- <el-button
          v-hasPermi="['gamer:user-auth-verification:create']"
          type="primary"
          plain
          @click="openForm('create')"
        >
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button>
        <el-button
          v-hasPermi="['gamer:user-auth-verification:delete']"
          type="danger"
          plain
          :disabled="isEmpty(checkedIds)"
          @click="handleDeleteBatch"
        >
          <Icon icon="ep:delete" class="mr-[5px]" /> 批量删除
        </el-button> -->
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
      @selection-change="handleRowCheckboxChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="用户ID" align="center" prop="userId" />
      <el-table-column label="用户昵称" align="center" prop="userNickName" width="120" />
      <el-table-column label="真实姓名" align="center" prop="realName" />
      <el-table-column label="身份证号码" align="center" prop="idCardNo" width="200" />
      <el-table-column label="身份证正面图片" align="center" prop="frontImageUrl">
        <template #default="scope">
          <el-image :src="scope.row.frontImageUrl" :preview-src-list="[scope.row.frontImageUrl]" fit="cover" preview-teleported />
        </template>
      </el-table-column>
      <el-table-column label="审核状态" align="center" prop="status" width="160">
        <template #default="scope">
          <div class="flex flex-col items-center gap-1">
            <template v-if="scope.row.status === 0">
              <el-button-group>
                <el-button size="small" type="success" @click="handleToggleUserAuthStatus(scope.row, 1)">
                  通过
                </el-button>
                <el-button size="small" type="danger" @click="handleToggleUserAuthStatus(scope.row, 2)">
                  不通过
                </el-button>
              </el-button-group>
              <el-tag type="info">
                待审核
              </el-tag>
            </template>
            <template v-else>
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? '审核通过' : '审核拒绝' }}
              </el-tag>
            </template>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="拒绝原因" align="center" prop="rejectReason" />
      <!-- <el-table-column label="审核人ID" align="center" prop="reviewerId" /> -->
      <el-table-column
        label="审核时间"
        align="center"
        prop="reviewedAt"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <!-- <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            v-hasPermi="['gamer:user-auth-verification:update']"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-hasPermi="['gamer:user-auth-verification:delete']"
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column> -->
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
  <UserAuthVerificationForm ref="formRef" @success="getList" />
</template>

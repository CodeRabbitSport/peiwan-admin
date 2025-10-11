<script setup lang="ts">
import type { UserWithdrawAccount } from '@/api/gamer/userwithdrawaccount'
import { UserWithdrawAccountApi } from '@/api/gamer/userwithdrawaccount'
import { dateFormatter } from '@/utils/formatTime'
import { isEmpty } from '@/utils/is'

import UserWithdrawAccountForm from './UserWithdrawAccountForm.vue'

/** 用户提现账户 列表 */
defineOptions({ name: 'UserWithdrawAccount' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<UserWithdrawAccount[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: undefined,
  channel: undefined,
  phone: undefined,
  realName: undefined,
  accountNo: undefined,
  bankName: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单

/** 查询列表 */
async function getList() {
  loading.value = true
  try {
    const data = await UserWithdrawAccountApi.getUserWithdrawAccountPage(queryParams)
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

/** 删除按钮操作 */
async function handleDelete(id: number) {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await UserWithdrawAccountApi.deleteUserWithdrawAccount(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  }
  catch {}
}
const checkedIds = ref<number[]>([])

/** 批量删除用户提现账户 */
async function handleDeleteBatch() {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await UserWithdrawAccountApi.deleteUserWithdrawAccountList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  }
  catch {}
}

function handleRowCheckboxChange(records: UserWithdrawAccount[]) {
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
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="提现渠道" prop="channel">
        <el-select
          v-model="queryParams.channel"
          placeholder="请选择提现渠道"
          clearable
          class="!w-[240px]"
        >
          <el-option label="微信收款" :value="1" />
          <el-option label="支付宝收款" :value="2" />
          <el-option label="银行卡收款" :value="3" />
          <el-option label="支付宝账号收款" :value="4" />
        </el-select>
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
      <el-form-item label="账号" prop="accountNo">
        <el-input
          v-model="queryParams.accountNo"
          placeholder="请输入账号"
          clearable
          class="!w-[240px]"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" class="mr-[5px]" /> 搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-[5px]" /> 重置
        </el-button>
        <!-- <el-button
          v-hasPermi="['gamer:user-withdraw-account:create']"
          type="primary"
          plain
          @click="openForm('create')"
        >
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button> -->
        <el-button
          v-hasPermi="['gamer:user-withdraw-account:delete']"
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
      <el-table-column label="提现渠道" align="center" prop="channel">
        <template #default="scope">
          <el-tag :type="scope.row.channel === 1 ? 'success' : scope.row.channel === 2 ? 'warning' : scope.row.channel === 3 ? 'danger' : 'info'">
            {{ scope.row.channel === 1 ? '微信收款' : scope.row.channel === 2 ? '支付宝收款' : scope.row.channel === 3 ? '银行卡收款' : '支付宝账号收款' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="手机号" align="center" prop="phone" />
      <el-table-column label="真实姓名" align="center" prop="realName" />
      <el-table-column label="账号" align="center" prop="accountNo" />
      <el-table-column label="银行名称" align="center" prop="bankName" />
      <el-table-column label="收款二维码" align="center" prop="qrCodeUrl">
        <template #default="scope">
          <el-image :src="scope.row.qrCodeUrl" :preview-src-list="[scope.row.qrCodeUrl]" fit="cover" preview-teleported />
        </template>
      </el-table-column>
      <el-table-column label="是否默认账户" align="center" prop="isDefault">
        <template #default="scope">
          <el-tag :type="scope.row.isDefault === 1 ? 'success' : 'danger'">
            {{ scope.row.isDefault === 1 ? '是' : '否' }}
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
          <!-- <el-button
            v-hasPermi="['gamer:user-withdraw-account:update']"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button> -->
          <el-button
            v-hasPermi="['gamer:user-withdraw-account:delete']"
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
  <UserWithdrawAccountForm ref="formRef" @success="getList" />
</template>

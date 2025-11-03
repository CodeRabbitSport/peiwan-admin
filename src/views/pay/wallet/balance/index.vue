<script setup lang="ts">
import * as WalletApi from '@/api/pay/wallet/balance'
import { fenToYuan } from '@/utils'
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'

import WalletForm from './WalletForm.vue'

defineOptions({ name: 'WalletBalance' })

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: null,
  userType: null,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单

/** 查询列表 */
async function getList() {
  loading.value = true
  try {
    const data = await WalletApi.getWalletPage(queryParams)
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
function openForm(id?: number) {
  formRef.value.open(id)
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
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-[240px]"
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
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="用户编号" align="center" prop="userId" />
      <el-table-column label="用户昵称" align="center" prop="userNickname" />
      <el-table-column label="用户类型" align="center" prop="userType">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.USER_TYPE" :value="scope.row.userType" />
        </template>
      </el-table-column>
      <el-table-column label="余额" align="center" prop="balance">
        <template #default="{ row }">
          {{ fenToYuan(row.balance) }} 元
        </template>
      </el-table-column>
      <el-table-column label="累计支出" align="center" prop="totalExpense">
        <template #default="{ row }">
          {{ fenToYuan(row.totalExpense) }} 元
        </template>
      </el-table-column>
      <el-table-column label="累计充值" align="center" prop="totalRecharge">
        <template #default="{ row }">
          {{ fenToYuan(row.totalRecharge) }} 元
        </template>
      </el-table-column>
      <el-table-column label="冻结金额" align="center" prop="freezePrice">
        <template #default="{ row }">
          {{ fenToYuan(row.freezePrice) }} 元
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button link type="primary" @click="openForm(scope.row.id)">
            详情
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

  <!-- 弹窗 -->
  <WalletForm ref="formRef" />
</template>

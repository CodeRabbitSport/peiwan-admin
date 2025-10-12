<script setup lang="ts">
import type { DepositTransfer } from '@/api/gamer/deposittransfer'
import { DepositTransferApi } from '@/api/gamer/deposittransfer'
import download from '@/utils/download'
import { dateFormatter } from '@/utils/formatTime'
import { isEmpty } from '@/utils/is'

import DepositTransferForm from './DepositTransferForm.vue'

/** 保证金转入余额订单 列表 */
defineOptions({ name: 'DepositTransfer' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<DepositTransfer[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  transactionNo: undefined,
  userId: undefined,
  isManualTransferred: undefined,
  status: undefined,
  transferStatus: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
async function getList() {
  loading.value = true
  try {
    const data = await DepositTransferApi.getDepositTransferPage(queryParams)
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

const checkedIds = ref<number[]>([])
const currentRow = ref<Partial<DepositTransfer>>({})

/** 删除按钮操作 */
async function handleDelete(id: number) {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await DepositTransferApi.deleteDepositTransfer(id)
    message.success(t('common.delSuccess'))
    currentRow.value = {}
    // 刷新列表
    await getList()
  }
  catch {}
}

/** 批量删除保证金转入余额订单 */
async function handleDeleteBatch() {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await DepositTransferApi.deleteDepositTransferList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  }
  catch {}
}
function handleRowCheckboxChange(records: DepositTransfer[]) {
  checkedIds.value = records.map(item => item.id!)
}

/** 导出按钮操作 */
async function handleExport() {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await DepositTransferApi.exportDepositTransfer(queryParams)
    download.excel(data, '保证金转入余额订单.xls')
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
      <el-form-item label="流水号" prop="transactionNo">
        <el-input
          v-model="queryParams.transactionNo"
          placeholder="请输入流水号"
          clearable
          class="!w-[240px]"
          
        />
      </el-form-item>
      <el-form-item label="用户ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户ID"
          clearable
          class="!w-[240px]"
          
        />
      </el-form-item>
      <el-form-item label="人工退款" prop="isManualTransferred">
        <el-select
          v-model="queryParams.isManualTransferred"
          placeholder="请选择人工退款"
          clearable
          class="!w-[240px]"
        >
          <el-option label="否" :value="0" />
          <el-option label="是" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          class="!w-[240px]"
        >
          <el-option label="待审核" :value="0" />
          <el-option label="已通过" :value="1" />
          <el-option label="已拒绝" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="转账" prop="transferStatus">
        <el-select
          v-model="queryParams.transferStatus"
          placeholder="请选择转账"
          clearable
          class="!w-[240px]"
        >
          <el-option label="未转账" :value="0" />
          <el-option label="已转账" :value="1" />
        </el-select>
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
          v-hasPermi="['gamer:deposit-transfer:create']"
          type="primary"
          plain
          @click="openForm('create')"
        >
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button>
        <el-button
          v-hasPermi="['gamer:deposit-transfer:export']"
          type="success"
          plain
          :loading="exportLoading"
          @click="handleExport"
        >
          <Icon icon="ep:download" class="mr-[5px]" /> 导出
        </el-button>
        <el-button
          v-hasPermi="['gamer:deposit-transfer:delete']"
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
      <el-table-column label="流水号" align="center" prop="transactionNo" />
      <el-table-column label="用户ID" align="center" prop="userId" />
      <el-table-column
        label="退款时间"
        align="center"
        prop="transferredAt"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="退款金额(分)" align="center" prop="transactionAmount" />
      <el-table-column
        label="自动退款时间"
        align="center"
        prop="autoTransferredAt"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="人工退款" align="center" prop="isManualTransferred">
        <template #default="{ row }">
          <el-tag v-if="row.isManualTransferred === 1" type="success" effect="light">
            是
          </el-tag>
          <el-tag v-else-if="row.isManualTransferred === 0" type="info" effect="light">
            否
          </el-tag>
          <el-tag v-else type="warning" effect="light">
            未知
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="{ row }">
          <el-tag v-if="row.status === 0" type="warning" effect="light">
            待审核
          </el-tag>
          <el-tag v-else-if="row.status === 1" type="success" effect="light">
            已通过
          </el-tag>
          <el-tag v-else-if="row.status === 2" type="danger" effect="light">
            已拒绝
          </el-tag>
          <el-tag v-else type="info" effect="light">
            未知
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="审核时间"
        align="center"
        prop="approvedAt"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="等待天数" align="center" prop="waitDays" />
      <el-table-column label="转账" align="center" prop="transferStatus">
        <template #default="{ row }">
          <el-tag v-if="row.transferStatus === 1" type="success" effect="light">
            已转账
          </el-tag>
          <el-tag v-else-if="row.transferStatus === 0" type="info" effect="light">
            未转账
          </el-tag>
          <el-tag v-else type="warning" effect="light">
            未知
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
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
            v-hasPermi="['gamer:deposit-transfer:update']"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-hasPermi="['gamer:deposit-transfer:delete']"
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
  <DepositTransferForm ref="formRef" @success="getList" />
</template>

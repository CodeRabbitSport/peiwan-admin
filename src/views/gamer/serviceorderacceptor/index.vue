<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="订单ID" prop="orderId">
        <el-input
          v-model="queryParams.orderId"
          placeholder="请输入订单ID"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="接单人用户ID" prop="acceptorId">
        <el-input
          v-model="queryParams.acceptorId"
          placeholder="请输入接单人用户ID"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="接单类型：1-个人接单, 2-组队接单" prop="acceptorType">
        <el-select
          v-model="queryParams.acceptorType"
          placeholder="请选择接单类型：1-个人接单, 2-组队接单"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="接单状态：1-抢单中,
  2-已确认接单, 3-已取消接单" prop="acceptorStatus">
        <el-select
          v-model="queryParams.acceptorStatus"
          placeholder="请选择接单状态：1-抢单中,
  2-已确认接单, 3-已取消接单"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否是队长" prop="isLeader">
        <el-select
          v-model="queryParams.isLeader"
          placeholder="请选择是否是队长"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="队伍ID" prop="teamId">
        <el-input
          v-model="queryParams.teamId"
          placeholder="请输入队伍ID"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="临时队伍ID" prop="tempTeamId">
        <el-input
          v-model="queryParams.tempTeamId"
          placeholder="请输入临时队伍ID"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="队伍名称" prop="teamName">
        <el-input
          v-model="queryParams.teamName"
          placeholder="请输入队伍名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
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
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['gamer:service-order-acceptor:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['gamer:service-order-acceptor:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button
            type="danger"
            plain
            :disabled="isEmpty(checkedIds)"
            @click="handleDeleteBatch"
            v-hasPermi="['gamer:service-order-acceptor:delete']"
        >
          <Icon icon="ep:delete" class="mr-5px" /> 批量删除
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
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="订单ID" align="center" prop="orderId" />
      <el-table-column label="接单人用户ID" align="center" prop="acceptorId" />
      <el-table-column label="接单类型：1-个人接单, 2-组队接单" align="center" prop="acceptorType" />
      <el-table-column label="接单状态：1-抢单中,
  2-已确认接单, 3-已取消接单" align="center" prop="acceptorStatus" />
      <el-table-column label="是否是队长" align="center" prop="isLeader" />
      <el-table-column label="队伍ID" align="center" prop="teamId" />
      <el-table-column label="临时队伍ID" align="center" prop="tempTeamId" />
      <el-table-column label="队伍名称" align="center" prop="teamName" />
      <el-table-column
        label="抢单时间"
        align="center"
        prop="grabTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="确认接单时间"
        align="center"
        prop="confirmTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="该接单人应得金额(分)" align="center" prop="acceptorAmount" />
      <el-table-column label="分成比例" align="center" prop="shareRatio" />
      <el-table-column
        label="取消接单时间"
        align="center"
        prop="cancelTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="取消接单原因" align="center" prop="cancelReason" />
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
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['gamer:service-order-acceptor:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['gamer:service-order-acceptor:delete']"
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
  <ServiceOrderAcceptorForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { ServiceOrderAcceptorApi, ServiceOrderAcceptor } from '@/api/gamer/serviceorderacceptor'
import ServiceOrderAcceptorForm from './ServiceOrderAcceptorForm.vue'

/** 用户订单接单人 列表 */
defineOptions({ name: 'ServiceOrderAcceptor' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<ServiceOrderAcceptor[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  orderId: undefined,
  acceptorId: undefined,
  acceptorType: undefined,
  acceptorStatus: undefined,
  isLeader: undefined,
  teamId: undefined,
  tempTeamId: undefined,
  teamName: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await ServiceOrderAcceptorApi.getServiceOrderAcceptorPage(queryParams)
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

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await ServiceOrderAcceptorApi.deleteServiceOrderAcceptor(id)
    message.success(t('common.delSuccess'))
    currentRow.value = {}
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除用户订单接单人 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await ServiceOrderAcceptorApi.deleteServiceOrderAcceptorList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: ServiceOrderAcceptor[]) => {
  checkedIds.value = records.map((item) => item.id);
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await ServiceOrderAcceptorApi.exportServiceOrderAcceptor(queryParams)
    download.excel(data, '用户订单接单人.xls')
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
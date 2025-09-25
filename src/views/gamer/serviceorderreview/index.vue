<script setup lang="ts">
import type { ServiceOrderReview } from '@/api/gamer/serviceorderreview'
import { ServiceOrderReviewApi } from '@/api/gamer/serviceorderreview'
import { dateFormatter } from '@/utils/formatTime'
import { isEmpty } from '@/utils/is'

import ServiceOrderReviewForm from './ServiceOrderReviewForm.vue'

/** 订单评价 列表 */
defineOptions({ name: 'ServiceOrderReview' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<ServiceOrderReview[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  orderId: undefined,
  userId: undefined,
  acceptorId: undefined,
  star: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
// const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
async function getList() {
  loading.value = true
  try {
    const data = await ServiceOrderReviewApi.getServiceOrderReviewPage(queryParams)
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

/** 删除按钮操作 */
async function handleDelete(id: number) {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await ServiceOrderReviewApi.deleteServiceOrderReview(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  }
  catch {}
}
const checkedIds = ref<number[]>([])

/** 批量删除订单评价 */
async function handleDeleteBatch() {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await ServiceOrderReviewApi.deleteServiceOrderReviewList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  }
  catch {}
}

function handleRowCheckboxChange(records: ServiceOrderReview[]) {
  checkedIds.value = records.map(item => item.id)
}

/** 导出按钮操作（已隐藏按钮，保留逻辑以备后用） */
// async function handleExport() {
//   try {
//     await message.exportConfirm()
//     exportLoading.value = true
//     const data = await ServiceOrderReviewApi.exportServiceOrderReview(queryParams)
//     download.excel(data, '订单评价.xls')
//   }
//   catch {
//   }
//   finally {
//     exportLoading.value = false
//   }
// }

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
      <el-form-item label="订单ID" prop="orderId">
        <el-input
          v-model="queryParams.orderId"
          placeholder="请输入订单ID"
          clearable
          class="!w-[240px]"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="评价人ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入评价人ID"
          clearable
          class="!w-[240px]"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="接单人ID" prop="acceptorId">
        <el-input
          v-model="queryParams.acceptorId"
          placeholder="请输入接单人ID"
          clearable
          class="!w-[240px]"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="星级评分 1-5" prop="star">
        <el-select
          v-model="queryParams.star"
          placeholder="请选择星级评分 1-5"
          clearable
          class="!w-[240px]"
        >
          <el-option label="请选择字典生成" value="" />
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
          v-hasPermi="['gamer:service-order-review:create']"
          type="primary"
          plain
          @click="openForm('create')"
        >
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button>
        <el-button
          v-hasPermi="['gamer:service-order-review:delete']"
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
      <el-table-column label="主键ID" align="center" prop="id" />
      <el-table-column label="订单ID" align="center" prop="orderId" />
      <el-table-column label="评价人ID" align="center" prop="userId" />
      <el-table-column label="接单人ID" align="center" prop="acceptorId" />
      <el-table-column label="星级评分 1-5" align="center" prop="star" />
      <el-table-column label="标签" align="center" prop="commentTag" />
      <el-table-column label="评价内容" align="center" prop="commentContent" />
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
            v-hasPermi="['gamer:service-order-review:update']"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-hasPermi="['gamer:service-order-review:delete']"
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
  <ServiceOrderReviewForm ref="formRef" @success="getList" />
</template>

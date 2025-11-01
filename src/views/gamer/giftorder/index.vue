<script setup lang="ts">
import type { GiftOrder } from '@/api/gamer/giftorder'
import { GiftOrderApi } from '@/api/gamer/giftorder'
import { fenToYuan } from '@/utils'
import { dateFormatter } from '@/utils/formatTime'

import GiftOrderForm from './GiftOrderForm.vue'

/** 礼物赠送订单 列表 */
defineOptions({ name: 'GiftOrder' })

// const message = useMessage() // 消息弹窗
// const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<GiftOrder[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  orderNo: undefined,
  senderId: undefined,
  receiverId: undefined,
  giftId: undefined,
  payStatus: undefined,
  payChannelCode: undefined,
  payOrderId: undefined,
  refundStatus: undefined,
  payRefundId: undefined,
  bizType: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
// const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
async function getList() {
  loading.value = true
  try {
    const data = await GiftOrderApi.getGiftOrderPage(queryParams)
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
// function openForm(type: string, id?: number) {
//   formRef.value.open(type, id)
// }

/** 删除按钮操作 */
// async function handleDelete(id: number) {
//   try {
//     // 删除的二次确认
//     await message.delConfirm()
//     // 发起删除
//     await GiftOrderApi.deleteGiftOrder(id)
//     message.success(t('common.delSuccess'))
//     // 刷新列表
//     await getList()
//   }
//   catch {}
// }
const checkedIds = ref<number[]>([])

/** 批量删除礼物赠送订单 */
// async function handleDeleteBatch() {
//   try {
//     // 删除的二次确认
//     await message.delConfirm()
//     await GiftOrderApi.deleteGiftOrderList(checkedIds.value)
//     checkedIds.value = []
//     message.success(t('common.delSuccess'))
//     await getList()
//   }
//   catch {}
// }

function handleRowCheckboxChange(records: GiftOrder[]) {
  checkedIds.value = records.map(item => item.id!)
}

/** 导出按钮操作 */
// async function handleExport() {
//   try {
//     // 导出的二次确认
//     await message.exportConfirm()
//     // 发起导出
//     exportLoading.value = true
//     const data = await GiftOrderApi.exportGiftOrder(queryParams)
//     download.excel(data, '礼物赠送订单.xls')
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
      <el-form-item label="赠送人ID" prop="senderId">
        <UserSelectInput
          v-model="queryParams.senderId"
          placeholder="请选择用户"
          @change="handleQuery"
        />
      </el-form-item>
      <el-form-item label="被赠送人ID" prop="receiverId" label-width="100px">
        <UserSelectInput
          v-model="queryParams.receiverId"
          placeholder="请选择用户"
          @change="handleQuery"
        />
      </el-form-item>
      <el-form-item label="礼物ID" prop="giftId">
        <el-input
          v-model="queryParams.giftId"
          placeholder="请输入礼物ID"
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
      <el-table-column label="订单编号" align="center" prop="orderNo" />
      <el-table-column label="赠送人ID" align="center" prop="senderId" />
      <el-table-column label="被赠送人ID" align="center" prop="receiverId" width="120px" />
      <el-table-column label="礼物ID" align="center" prop="giftId" />
      <el-table-column label="礼物名称" align="center" prop="giftName" />
      <el-table-column label="礼物图片" align="center" prop="giftImage">
        <template #default="scope">
          <!-- 图片类型 -->
          <el-image
            :src="scope.row.giftImage"
            :preview-src-list="[scope.row.giftImage]"
            fit="cover"
            style="width: 60px; height: 60px; border-radius: 6px;"
            preview-teleported
          />
        </template>
      </el-table-column>
      <el-table-column label="抽成(%)" align="center" prop="giftRate" />
      <el-table-column label="数量" align="center" prop="quantity" />
      <el-table-column label="金额信息" align="center" min-width="180px">
        <template #default="scope">
          <div style="line-height: 1.8;">
            <div>总金额: {{ fenToYuan(scope.row.totalAmount) }}</div>
            <!-- <div>优惠金额: {{ fenToYuan(scope.row.couponAmount) }}</div> -->
            <div>实付: {{ fenToYuan(scope.row.actualAmount) }}</div>
            <div>抽成: {{ fenToYuan(scope.row.platformFee) }}</div>
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
      <!-- <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            v-hasPermi="['gamer:gift-order:update']"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-hasPermi="['gamer:gift-order:delete']"
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
  <GiftOrderForm ref="formRef" @success="getList" />
</template>

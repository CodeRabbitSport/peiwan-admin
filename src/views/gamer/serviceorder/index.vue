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
      <el-form-item label="订单号，唯一标识" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单号，唯一标识"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="下单用户ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入下单用户ID"
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
      <el-form-item label="接单时间" prop="acceptTime">
        <el-date-picker
          v-model="queryParams.acceptTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="商品ID" prop="productId">
        <el-input
          v-model="queryParams.productId"
          placeholder="请输入商品ID"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="商品名称" prop="productName">
        <el-input
          v-model="queryParams.productName"
          placeholder="请输入商品名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="订单状态：0-待支付 1-已支付待接单 2-进行中 3-已完成 4-已取消 5-退款中 6-已退款" prop="orderStatus">
        <el-select
          v-model="queryParams.orderStatus"
          placeholder="请选择订单状态：0-待支付 1-已支付待接单 2-进行中 3-已完成 4-已取消 5-退款中 6-已退款"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="订单截止时间(预留字段)" prop="deadlineTime">
        <el-date-picker
          v-model="queryParams.deadlineTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="订单开始执行时间" prop="startTime">
        <el-date-picker
          v-model="queryParams.startTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="接单人完成时间(状态变为3时记录)" prop="completeTime">
        <el-date-picker
          v-model="queryParams.completeTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="用户确认完成时间(状态变为4时记录)" prop="confirmTime">
        <el-date-picker
          v-model="queryParams.confirmTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="支付状态：0-未支付 1-已支付 2-已退款" prop="payStatus">
        <el-select
          v-model="queryParams.payStatus"
          placeholder="请选择支付状态：0-未支付 1-已支付 2-已退款"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="支付时间" prop="payTime">
        <el-date-picker
          v-model="queryParams.payTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="支付渠道编码" prop="payChannelCode">
        <el-input
          v-model="queryParams.payChannelCode"
          placeholder="请输入支付渠道编码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="支付订单ID" prop="payOrderId">
        <el-input
          v-model="queryParams.payOrderId"
          placeholder="请输入支付订单ID"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="取消时间" prop="cancelTime">
        <el-date-picker
          v-model="queryParams.cancelTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="取消操作人ID" prop="cancelUserId">
        <el-input
          v-model="queryParams.cancelUserId"
          placeholder="请输入取消操作人ID"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="退款申请时间" prop="refundApplyTime">
        <el-date-picker
          v-model="queryParams.refundApplyTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="退款审核状态：1-审核通过 2-审核拒绝" prop="refundAuditStatus">
        <el-select
          v-model="queryParams.refundAuditStatus"
          placeholder="请选择退款审核状态：1-审核通过 2-审核拒绝"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="退款审核时间" prop="refundAuditTime">
        <el-date-picker
          v-model="queryParams.refundAuditTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="退款审核人ID" prop="refundAuditUserId">
        <el-input
          v-model="queryParams.refundAuditUserId"
          placeholder="请输入退款审核人ID"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="退款时间" prop="refundTime">
        <el-date-picker
          v-model="queryParams.refundTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="退款订单ID" prop="payRefundId">
        <el-input
          v-model="queryParams.payRefundId"
          placeholder="请输入退款订单ID"
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
          v-hasPermi="['gamer:service-order:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['gamer:service-order:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button
            type="danger"
            plain
            :disabled="isEmpty(checkedIds)"
            @click="handleDeleteBatch"
            v-hasPermi="['gamer:service-order:delete']"
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
      <el-table-column label="订单ID，主键" align="center" prop="id" />
      <el-table-column label="订单号，唯一标识" align="center" prop="orderNo" />
      <el-table-column label="下单用户ID" align="center" prop="userId" />
      <el-table-column label="接单人用户ID" align="center" prop="acceptorId" />
      <el-table-column
        label="接单时间"
        align="center"
        prop="acceptTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="商品ID" align="center" prop="productId" />
      <el-table-column label="商品名称" align="center" prop="productName" />
      <el-table-column label="商品图片URL" align="center" prop="productPicUrl" />
      <el-table-column label="商品价格，单位：分" align="center" prop="productPrice" />
      <el-table-column label="订单状态：0-待支付 1-已支付待接单 2-进行中 3-已完成 4-已取消 5-退款中 6-已退款" align="center" prop="orderStatus" />
      <el-table-column label="订单总金额，单位：分" align="center" prop="totalAmount" />
      <el-table-column label="优惠金额，单位：分" align="center" prop="discountAmount" />
      <el-table-column label="优惠券优惠金额，单位：分" align="center" prop="couponAmount" />
      <el-table-column label="实际支付金额，单位：分" align="center" prop="actualAmount" />
      <el-table-column label="平台手续费，单位：分" align="center" prop="platformFee" />
      <el-table-column label="接单人获得金额，单位：分" align="center" prop="acceptorAmount" />
      <el-table-column label="使用的用户优惠券ID" align="center" prop="userCouponId" />
      <el-table-column label="优惠券ID" align="center" prop="couponId" />
      <el-table-column
        label="订单截止时间(预留字段)"
        align="center"
        prop="deadlineTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="订单开始执行时间"
        align="center"
        prop="startTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="接单人完成时间(状态变为3时记录)"
        align="center"
        prop="completeTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="用户确认完成时间(状态变为4时记录)"
        align="center"
        prop="confirmTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="支付状态：0-未支付 1-已支付 2-已退款" align="center" prop="payStatus" />
      <el-table-column
        label="支付时间"
        align="center"
        prop="payTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="支付渠道编码" align="center" prop="payChannelCode" />
      <el-table-column label="支付订单ID" align="center" prop="payOrderId" />
      <el-table-column label="取消原因" align="center" prop="cancelReason" />
      <el-table-column
        label="取消时间"
        align="center"
        prop="cancelTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="取消操作人ID" align="center" prop="cancelUserId" />
      <el-table-column label="退款申请原因" align="center" prop="refundApplyReason" />
      <el-table-column
        label="退款申请时间"
        align="center"
        prop="refundApplyTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="退款审核状态：1-审核通过 2-审核拒绝" align="center" prop="refundAuditStatus" />
      <el-table-column label="退款审核原因(拒绝时填写)" align="center" prop="refundAuditReason" />
      <el-table-column
        label="退款审核时间"
        align="center"
        prop="refundAuditTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="退款审核人ID" align="center" prop="refundAuditUserId" />
      <el-table-column label="退款金额，单位：分" align="center" prop="refundAmount" />
      <el-table-column
        label="退款时间"
        align="center"
        prop="refundTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="退款订单ID" align="center" prop="payRefundId" />
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
            v-hasPermi="['gamer:service-order:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['gamer:service-order:delete']"
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
  <ServiceOrderForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { ServiceOrderApi, ServiceOrder } from '@/api/gamer/serviceorder'
import ServiceOrderForm from './ServiceOrderForm.vue'

/** 用户订单 列表 */
defineOptions({ name: 'ServiceOrder' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<ServiceOrder[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  orderNo: undefined,
  userId: undefined,
  acceptorId: undefined,
  acceptTime: [],
  productId: undefined,
  productName: undefined,
  orderStatus: undefined,
  deadlineTime: [],
  startTime: [],
  completeTime: [],
  confirmTime: [],
  payStatus: undefined,
  payTime: [],
  payChannelCode: undefined,
  payOrderId: undefined,
  cancelTime: [],
  cancelUserId: undefined,
  refundApplyTime: [],
  refundAuditStatus: undefined,
  refundAuditTime: [],
  refundAuditUserId: undefined,
  refundTime: [],
  payRefundId: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await ServiceOrderApi.getServiceOrderPage(queryParams)
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
    await ServiceOrderApi.deleteServiceOrder(id)
    message.success(t('common.delSuccess'))
    currentRow.value = {}
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除用户订单 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await ServiceOrderApi.deleteServiceOrderList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: ServiceOrder[]) => {
  checkedIds.value = records.map((item) => item.id);
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await ServiceOrderApi.exportServiceOrder(queryParams)
    download.excel(data, '用户订单.xls')
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
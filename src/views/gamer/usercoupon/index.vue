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
      <el-form-item label="用户ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户ID"
          clearable
          
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="优惠券ID" prop="couponId">
        <el-input
          v-model="queryParams.couponId"
          placeholder="请输入优惠券ID"
          clearable
          
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="优惠券唯一编码" prop="couponCode">
        <el-input
          v-model="queryParams.couponCode"
          placeholder="请输入优惠券唯一编码"
          clearable
          
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="优惠券名称(冗余存储，防止优惠券删除后无法显示)" prop="couponName">
        <el-input
          v-model="queryParams.couponName"
          placeholder="请输入优惠券名称(冗余存储，防止优惠券删除后无法显示)"
          clearable
          
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="优惠券类型: 1-满减券, 2-折扣券, 3-无门槛券(即min_order_amount为0)" prop="couponType">
        <el-select
          v-model="queryParams.couponType"
          placeholder="请选择优惠券类型: 1-满减券, 2-折扣券, 3-无门槛券(即min_order_amount为0)"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态: 0-未使用, 1-已使用, 2-已过期" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态: 0-未使用, 1-已使用, 2-已过期"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="业务ID" prop="bizId">
        <el-input
          v-model="queryParams.bizId"
          placeholder="请输入业务ID"
          clearable
          
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
          v-hasPermi="['gamer:user-coupon:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['gamer:user-coupon:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button
            type="danger"
            plain
            :disabled="isEmpty(checkedIds)"
            @click="handleDeleteBatch"
            v-hasPermi="['gamer:user-coupon:delete']"
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
      <el-table-column label="记录ID" align="center" prop="id" />
      <el-table-column label="用户ID" align="center" prop="userId" />
      <el-table-column label="优惠券ID" align="center" prop="couponId" />
      <el-table-column label="优惠券唯一编码" align="center" prop="couponCode" />
      <el-table-column label="优惠券名称(冗余存储，防止优惠券删除后无法显示)" align="center" prop="couponName" />
      <el-table-column label="优惠券类型: 1-满减券, 2-折扣券, 3-无门槛券(即min_order_amount为0)" align="center" prop="couponType" />
      <el-table-column label="优惠金额/折扣比例" align="center" prop="couponAmount" />
      <el-table-column label="最低订单金额要求" align="center" prop="couponMinOrderAmount" />
      <el-table-column label="状态: 0-未使用, 1-已使用, 2-已过期" align="center" prop="status" />
      <el-table-column
        label="领取时间"
        align="center"
        prop="receivedAt"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="使用时间"
        align="center"
        prop="usedAt"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="业务ID" align="center" prop="bizId" />
      <el-table-column
        label="有效期至(领取时间+有效天数)"
        align="center"
        prop="validUntil"
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
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['gamer:user-coupon:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['gamer:user-coupon:delete']"
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
  <UserCouponForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { UserCouponApi, UserCoupon } from '@/api/gamer/usercoupon'
import UserCouponForm from './UserCouponForm.vue'

/** 用户优惠券 列表 */
defineOptions({ name: 'UserCoupon' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<UserCoupon[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: undefined,
  couponId: undefined,
  couponCode: undefined,
  couponName: undefined,
  couponType: undefined,
  status: undefined,
  bizId: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await UserCouponApi.getUserCouponPage(queryParams)
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
    await UserCouponApi.deleteUserCoupon(id)
    message.success(t('common.delSuccess'))
    currentRow.value = {}
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除用户优惠券 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await UserCouponApi.deleteUserCouponList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: UserCoupon[]) => {
  checkedIds.value = records.map((item) => item.id);
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await UserCouponApi.exportUserCoupon(queryParams)
    download.excel(data, '用户优惠券.xls')
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

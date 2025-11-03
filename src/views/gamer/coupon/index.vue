<script setup lang="ts">
import type { Coupon } from '@/api/gamer/coupon'
import { CouponApi } from '@/api/gamer/coupon'
import { fenToYuan } from '@/utils'
import download from '@/utils/download'
import { dateFormatter } from '@/utils/formatTime'
import { isEmpty } from '@/utils/is'

import CouponForm from './CouponForm.vue'

/** 优惠券 列表 */
defineOptions({ name: 'Coupon' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<Coupon[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  couponName: undefined,
  couponType: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
async function getList() {
  loading.value = true
  try {
    const data = await CouponApi.getCouponPage(queryParams)
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

/** 切换上/下架状态 */
async function handleToggleIndexGet(row: Coupon) {
  try {
    const data = { ...row }
    await CouponApi.updateCoupon(data)
    message.success('状态已更新')
    await getList()
  }
  catch {
    // 失败时回滚状态
    row.indexGet = !row.indexGet
    message.error('更新失败')
  }
}

/** 删除按钮操作 */
async function handleDelete(id: number) {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await CouponApi.deleteCoupon(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  }
  catch { }
}

/** 批量删除优惠券 */
async function handleDeleteBatch() {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await CouponApi.deleteCouponList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  }
  catch { }
}

const checkedIds = ref<number[]>([])
function handleRowCheckboxChange(records: Coupon[]) {
  checkedIds.value = records.map(item => item.id)
}

/** 导出按钮操作 */
async function handleExport() {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await CouponApi.exportCoupon(queryParams)
    download.excel(data, '优惠券.xls')
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
      <el-form-item label="名称" prop="couponName">
        <el-input
          v-model="queryParams.couponName"
          placeholder="请输入优惠券名称"
          clearable

          class="!w-[240px]"
        />
      </el-form-item>

      <el-form-item label="类型" prop="couponType">
        <el-select
          v-model="queryParams.couponType"
          placeholder="请选择优惠券类型"
          clearable
          class="!w-[240px]"
        >
          <el-option label="满减券" :value="1" />
          <el-option label="折扣券" :value="2" />
          <el-option label="无门槛券" :value="3" />
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
        <el-button v-hasPermi="['gamer:coupon:create']" type="primary" plain @click="openForm('create')">
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button>
        <el-button
          v-hasPermi="['gamer:coupon:delete']" type="danger" plain :disabled="isEmpty(checkedIds)"
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
      v-loading="loading" row-key="id" :data="list" :stripe="true" :show-overflow-tooltip="true"
      @selection-change="handleRowCheckboxChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="名称" align="center" prop="couponName" />
      <el-table-column label="类型" align="center" prop="couponType">
        <template #default="scope">
          <el-tag type="success">
            {{ scope.row.success == 1 ? "满减券" : scope.row.success == 2 ? "折扣券" : "无门槛" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="金额/折扣" align="center" prop="couponAmount">
        <template #default="scope">
          <span v-if="scope.row.couponType === 2">
            {{ scope.row.couponAmount }}
          </span>
          <span v-else>
            ¥{{ fenToYuan(scope.row.couponAmount) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="最低金额" align="center" prop="couponMinOrderAmount">
        <template #default="scope">
          ¥{{ fenToYuan(scope.row.couponMinOrderAmount) }}
        </template>
      </el-table-column>
      <el-table-column label="有效天数" align="center" prop="validityDays" />
      <el-table-column label="描述" align="center" prop="couponDesc" />
      <el-table-column label="上/下架" align="center" prop="indexGet" width="100px">
        <template #default="scope">
          <el-switch
            v-model="scope.row.indexGet"
            @change="() => handleToggleIndexGet(scope.row)"
          />
        </template>
      </el-table-column>
      <!-- <el-table-column label="最大领取次数" align="center" prop="maxIndexGet" width="120px" /> -->

      <el-table-column label="创建时间" align="center" prop="createTime" :formatter="dateFormatter" width="180px" />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            v-hasPermi="['gamer:coupon:update']"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-hasPermi="['gamer:coupon:delete']"
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
      v-model:page="queryParams.pageNo" v-model:limit="queryParams.pageSize" :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <CouponForm ref="formRef" @success="getList" />
</template>

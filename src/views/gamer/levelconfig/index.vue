<script setup lang="ts">
import type { LevelConfig } from '@/api/gamer/levelconfig'
import { LevelConfigApi } from '@/api/gamer/levelconfig'
import { fenToYuan } from '@/utils'
import { dateFormatter } from '@/utils/formatTime'
import { isEmpty } from '@/utils/is'

import LevelConfigForm from './LevelConfigForm.vue'

/** 打手等级配置 列表 */
defineOptions({ name: 'LevelConfig' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<LevelConfig[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  categoryType: undefined,
  levelName: undefined,
  levelNumber: undefined,
  isDefault: undefined,
  canUpgrade: undefined,
  canCancelOrder: undefined,
  canRefundOrder: undefined,
  canViewRefundPhone: undefined,
  canViewUnrefundedPhone: undefined,
  canSetAnnouncement: undefined,
  orderVerificationType: undefined,
  allowDepositRecharge: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单

// 布尔兼容转换：兼容 true/false 与 1/0 字段
function toBool(val: any) {
  if (typeof val === 'boolean') return val
  if (val === 1 || val === '1') return true
  return false
}
// 将布尔类字段显示为 “有/无” 文案
const permissionText = (val: number | string | boolean) => (toBool(val) ? '有' : '无')
// 验证类型文案
function verifyTypeText(val: number | undefined) {
  switch (val) {
    case 0:
      return '无需验证'
    case 1:
      return '短信验证'
    case 2:
      return '支付密码验证'
    default:
      return '未知'
  }
}

/** 查询列表 */
async function getList() {
  loading.value = true
  try {
    const data = await LevelConfigApi.getLevelConfigPage(queryParams)
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
    await LevelConfigApi.deleteLevelConfig(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  }
  catch { }
}

const checkedIds = ref<number[]>([])

/** 批量删除打手等级配置 */
async function handleDeleteBatch() {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await LevelConfigApi.deleteLevelConfigList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  }
  catch { }
}

function handleRowCheckboxChange(records: LevelConfig[]) {
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
      <el-form-item label="分类类型" prop="categoryType">
        <el-select
          v-model="queryParams.categoryType"
          placeholder="请选择分类类型"
          clearable
          class="!w-[240px]"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="等级名称" prop="levelName">
        <el-input
          v-model="queryParams.levelName"
          placeholder="请输入等级名称"
          clearable
          class="!w-[240px]"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="级别号" prop="levelNumber">
        <el-input
          v-model="queryParams.levelNumber"
          placeholder="请输入级别号"
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
        <el-button
          v-hasPermi="['gamer:level-config:create']"
          type="primary"
          plain
          @click="openForm('create')"
        >
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button>
        <el-button
          v-hasPermi="['gamer:level-config:delete']"
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
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="等级名称" align="center" prop="levelName" width="150" />
      <el-table-column label="级别号" align="center" prop="levelNumber" width="100" />
      <el-table-column label="自助升级费用" align="center" prop="upgradeFee" width="120" />
      <el-table-column label="自助升级天数" align="center" prop="upgradeDays" width="120" />
      <el-table-column label="默认等级" align="center" prop="isDefault" width="100">
        <template #default="{ row }">
          <el-tag :type="toBool(row.isDefault) ? 'success' : 'info'" size="small">
            {{ toBool(row.isDefault) ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="是否可升级" align="center" prop="canUpgrade" width="110">
        <template #default="{ row }">
          <el-tag :type="toBool(row.canUpgrade) ? 'success' : 'info'" size="small">
            {{ toBool(row.canUpgrade) ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="功能限制" min-width="360" align="center">
        <template #default="{ row }">
          <div class="feature-list">
            <div class="feature-item">
              接单保证金：{{ fenToYuan(row.depositFee) }}
            </div>
            <div class="feature-item">
              每日接单数：{{ row.dailyOrderLimit === 0 ? '不限制' : row.dailyOrderLimit }}
            </div>
            <div class="feature-item">
              新待接订单延迟接单时间：{{ row.newOrderDelaySeconds }}秒
            </div>
            <div class="feature-item">
              提现手续费：{{ row.withdrawalFeeRate }}%
            </div>
            <div class="feature-item">
              订单服务费解冻时间：{{ row.orderFeeUnfreezeSeconds }}秒
            </div>
            <div class="feature-item">
              打赏金额抽成：{{ row.rewardCommissionRate }}%
            </div>
            <div class="feature-item">
              可自主取消接单订单：{{ permissionText(row.canCancelOrder) }}
            </div>
            <div class="feature-item">
              可自主退款接单订单：{{ permissionText(row.canRefundOrder) }}
            </div>
            <div class="feature-item">
              查看已申请退款订单用户手机号：{{ permissionText(row.canViewRefundPhone) }}
            </div>
            <div class="feature-item">
              查看未退款订单用户手机号：{{ permissionText(row.canViewUnrefundedPhone) }}
            </div>
            <div class="feature-item">
              查看未退款订单用户手机号天数：{{ row.viewPhoneDaysLimit === -1 ? '不限制' : `${row.viewPhoneDaysLimit
              }天` }}
            </div>
            <div class="feature-item">
              设置用户公告内容权限：{{ permissionText(row.canSetAnnouncement) }}
            </div>
            <div class="feature-item">
              保证金退还安全期限：{{ row.depositRefundSafeDays }}天
            </div>
            <div class="feature-item">
              限制指定接单商品：{{ row.restrictedProductIds && row.restrictedProductIds.length
                ? row.restrictedProductIds : '无' }}
            </div>
            <div class="feature-item">
              限制每日接单缴费金额：{{ fenToYuan(row.dailyOrderFeeLimit) }}元
            </div>
            <div class="feature-item">
              限制同时可接单数：{{ row.simultaneousOrderLimit === 0 ? '不限制' : `${row.simultaneousOrderLimit
              }单` }}
            </div>
            <div class="feature-item">
              接单验证类型：{{ verifyTypeText(row.orderVerificationType) }}
            </div>
            <div class="feature-item">
              限制升级人数名额：{{ row.upgradeSlotLimit === 0 ? '不限制' : row.upgradeSlotLimit }}
            </div>
            <div class="feature-item">
              允许接单抵扣保证金：{{ toBool(row.allowDepositRecharge) ? '允许' : '不允许' }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="创建时间" align="center" prop="createTime" :formatter="dateFormatter" width="180px" />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            v-hasPermi="['gamer:level-config:update']"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-hasPermi="['gamer:level-config:delete']"
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
  <LevelConfigForm ref="formRef" @success="getList" />
</template>

<style scoped>
.feature-list {
  line-height: 1.6;
  padding: 6px 0;
  white-space: normal;
  word-break: break-all;
}

.feature-item {
  text-align: center;
}
</style>

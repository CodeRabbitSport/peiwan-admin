<script setup lang="ts">
import type { LevelConfig } from '@/api/gamer/levelconfig'
import { LevelConfigApi } from '@/api/gamer/levelconfig'
import type { ProductCategory } from '@/api/gamer/productcategory'
import { ProductCategoryApi } from '@/api/gamer/productcategory'
import LevelConfigRestrictions from '@/components/LevelConfig/LevelConfigRestrictions.vue'
import { fenToYuan } from '@/utils'
import { dateFormatter } from '@/utils/formatTime'
import { isEmpty } from '@/utils/is'

import LevelConfigForm from './LevelConfigForm.vue'

/** 陪玩等级配置 列表 */
defineOptions({ name: 'CompanionLevelConfig' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<LevelConfig[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  categoryType: 1, // 陪玩类型
  categoryId: undefined as number | undefined,
  gameRegion: undefined as string | undefined,
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
const categoryOptions = ref<ProductCategory[]>([])

function parseGameRegions(value?: string) {
  return [...new Set(String(value || '')
    .split(/[,，]/)
    .map(region => region.trim())
    .filter(Boolean))]
}

const gameRegionOptions = computed(() => parseGameRegions(
  categoryOptions.value.find(item => item.id === queryParams.categoryId)?.orderReceivingRegion,
))

function handleCategoryChange() {
  queryParams.gameRegion = undefined
}

function getCategoryName(categoryId?: number) {
  return categoryOptions.value.find(item => item.id === categoryId)?.categoryName || '--'
}

async function loadCategoryOptions() {
  const { list = [] } = await ProductCategoryApi.getProductCategoryPage({ pageNo: 1, pageSize: 100 })
  categoryOptions.value = list
}

// 解析游戏区服价差配置 JSON 字符串
function parseRegionList(value: string | undefined): Array<{ region: string, price: number }> {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  }
  catch {
    return []
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

/** 批量删除陪玩等级配置 */
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
  loadCategoryOptions()
})
</script>

<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form ref="queryFormRef" class="-mb-[15px]" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="游戏分类" prop="categoryId">
        <el-select
          v-model="queryParams.categoryId"
          placeholder="请选择游戏分类"
          filterable
          clearable
          class="!w-[240px]"
          @change="handleCategoryChange"
        >
          <el-option
            v-for="item in categoryOptions"
            :key="item.id"
            :label="item.categoryName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="游戏区服" prop="gameRegion">
        <el-select
          v-model="queryParams.gameRegion"
          :placeholder="!queryParams.categoryId ? '请先选择游戏分类' : gameRegionOptions.length ? '请选择游戏区服' : '该分类无需选择区服'"
          filterable
          clearable
          class="!w-[240px]"
          :disabled="!queryParams.categoryId || !gameRegionOptions.length"
        >
          <el-option
            v-for="region in gameRegionOptions"
            :key="region"
            :label="region"
            :value="region"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="等级名称" prop="levelName">
        <el-input v-model="queryParams.levelName" placeholder="请输入等级名称" clearable class="!w-[240px]" />
      </el-form-item>
      <el-form-item label="级别号" prop="levelNumber">
        <el-input v-model="queryParams.levelNumber" placeholder="请输入级别号" clearable class="!w-[240px]" />
      </el-form-item>

      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" class="mr-[5px]" /> 搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-[5px]" /> 重置
        </el-button>
        <el-button v-hasPermi="['gamer:level-config:create']" type="primary" plain @click="openForm('create')">
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button>
        <el-button
          v-hasPermi="['gamer:level-config:delete']" type="danger" plain :disabled="isEmpty(checkedIds)"
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
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="游戏分类" align="center" prop="categoryId" min-width="140">
        <template #default="{ row }">
          {{ getCategoryName(row.categoryId) }}
        </template>
      </el-table-column>
      <el-table-column label="游戏区服" align="center" prop="gameRegion" min-width="160">
        <template #default="{ row }">
          {{ row.gameRegion || '--' }}
        </template>
      </el-table-column>
      <el-table-column label="等级名称" align="center" prop="levelName" width="150" />
      <el-table-column label="等级图标" align="center" prop="levelIcon" width="90">
        <template #default="{ row }">
          <el-image
            v-if="row.levelIcon"
            :src="row.levelIcon"
            :preview-src-list="[row.levelIcon]"
            fit="contain"
            preview-teleported
            class="h-10 w-10 rounded-[4px]"
          />
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="级别号" align="center" prop="levelNumber" width="100" />
      <el-table-column label="陪玩费用" align="center" prop="unitPrice" width="180">
        <template #default="{ row }">
          {{ row.unitPrice ? fenToYuan(row.unitPrice) : '--' }}元/小时
        </template>
      </el-table-column>
      <!-- <el-table-column label="游戏区服价差" align="center" min-width="220">
        <template #default="{ row }">
          <template v-if="row.orderReceivingStatus && parseRegionList(row.orderReceivingRegion).length">
            <div class="feature-list">
              <div v-for="(item, idx) in parseRegionList(row.orderReceivingRegion)" :key="idx" class="feature-item">
                {{ item.region }}：+{{ fenToYuan(item.price) }}元/小时
              </div>
            </div>
          </template>
          <span v-else>--</span>
        </template>
      </el-table-column> -->
      <!-- <el-table-column label="自助升级天数" align="center" prop="upgradeDays" width="120" /> -->
      <!-- <el-table-column label="默认等级" align="center" prop="isDefault" width="100">
        <template #default="{ row }">
          <el-tag :type="toBool(row.isDefault) ? 'success' : 'info'" size="small">
            {{ toBool(row.isDefault) ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column> -->
      <!-- <el-table-column label="是否可升级" align="center" prop="canUpgrade" width="110">
        <template #default="{ row }">
          <el-tag :type="toBool(row.canUpgrade) ? 'success' : 'info'" size="small">
            {{ toBool(row.canUpgrade) ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column> -->
      <el-table-column label="功能限制" min-width="150" align="center">
        <template #default="{ row }">
          <LevelConfigRestrictions :config="row" show-commission />
        </template>
      </el-table-column>
      <!-- <el-table-column label="备注" align="center" prop="remark" /> -->
      <el-table-column label="创建时间" align="center" prop="createTime" :formatter="dateFormatter" width="180px" />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            v-hasPermi="['gamer:level-config:update']" link type="primary"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button>
          <el-button v-hasPermi="['gamer:level-config:delete']" link type="danger" @click="handleDelete(scope.row.id)">
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

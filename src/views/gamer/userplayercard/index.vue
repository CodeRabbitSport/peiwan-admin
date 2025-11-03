<script setup lang="ts">
import { ProductCategoryApi } from '@/api/gamer/productcategory'
import type { UserPlayerCard } from '@/api/gamer/userplayercard'
import { UserPlayerCardApi } from '@/api/gamer/userplayercard'
import { dateFormatter } from '@/utils/formatTime'
import { isEmpty } from '@/utils/is'

import UserPlayerCardForm from './UserPlayerCardForm.vue'

/** 用戶游戏名片 列表 */
defineOptions({ name: 'UserPlayerCard' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<UserPlayerCard[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  categoryId: undefined,
  userId: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const categoryOptions = ref<{ label: string, value: number }[]>([])

/** 查询列表 */
async function getList() {
  loading.value = true
  try {
    const data = await UserPlayerCardApi.getUserPlayerCardPage(queryParams)
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
    await UserPlayerCardApi.deleteUserPlayerCard(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  }
  catch {}
}
const checkedIds = ref<number[]>([])

/** 批量删除用戶游戏名片 */
async function handleDeleteBatch() {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await UserPlayerCardApi.deleteUserPlayerCardList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  }
  catch {}
}

function handleRowCheckboxChange(records: UserPlayerCard[]) {
  checkedIds.value = records.map(item => item.id)
}

async function loadCategoryOptions() {
  try {
    const { list = [] } = await ProductCategoryApi.getProductCategoryPage()
    categoryOptions.value = list.map((item: any) => ({
      label: item.categoryName,
      value: item.id,
    }))
  }
  catch {}
}

/** 初始化 */
onMounted(() => {
  loadCategoryOptions()
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
      <el-form-item label="游戏分类" prop="categoryId">
        <el-select
          v-model="queryParams.categoryId"
          placeholder="请选择游戏分类"
          clearable
          filterable
          class="!w-[240px]"
          @change="handleQuery"
        >
          <el-option
            v-for="item in categoryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
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
        <!-- <el-button
          v-hasPermi="['gamer:user-player-card:create']"
          type="primary"
          plain
          @click="openForm('create')"
        >
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button>
        <el-button
          v-hasPermi="['gamer:user-player-card:export']"
          type="success"
          plain
          :loading="exportLoading"
          @click="handleExport"
        >
          <Icon icon="ep:download" class="mr-[5px]" /> 导出
        </el-button> -->
        <el-button
          v-hasPermi="['gamer:user-player-card:delete']"
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
      <el-table-column label="游戏分类" align="center" prop="categoryName" />
      <el-table-column label="用户ID" align="center" prop="userId" />
      <el-table-column label="用户昵称" align="center" prop="userNickname" width="120" />

      <el-table-column label="名片信息" align="center" prop="cardInfo">
        <template #default="scope">
          <div v-for="item, index of JSON.parse(scope.row.cardInfo || '{}')" :key="index">
            <span>{{ index }}：{{ item }}</span>
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
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <!-- <el-button
            v-hasPermi="['gamer:user-player-card:update']"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button> -->
          <el-button
            v-hasPermi="['gamer:user-player-card:delete']"
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
  <UserPlayerCardForm ref="formRef" @success="getList" />
</template>

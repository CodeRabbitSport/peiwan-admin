<script setup lang="ts">
import { getUserStatPage } from '@/api/gamer/userinfo'

/** 下级用户统计组件 */
defineOptions({ name: 'UserStatDialog' })

interface Props {
  userId?: number
}

const props = defineProps<Props>()

const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)

const queryParams = reactive<{
  pageNo: number
  pageSize: number
  id?: number
  nickname?: string
  parentId?: number
  parentNickname?: string
}>({
  pageNo: 1,
  pageSize: 10,
  id: undefined,
  nickname: undefined,
  parentId: undefined,
  parentNickname: undefined,
})

const queryFormRef = ref()

/** 查询列表 */
async function getList() {
  if (!props.userId) return
  
  loading.value = true
  try {
    const data = await getUserStatPage(queryParams)
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
  queryParams.pageNo = 1
  queryParams.pageSize = 10
  queryParams.id = undefined
  queryParams.nickname = undefined
  queryParams.parentId = props.userId
  queryParams.parentNickname = undefined
  getList()
}

// 监听 userId 变化，自动加载数据
watch(() => props.userId, (newUserId) => {
  if (newUserId) {
    queryParams.parentId = newUserId
    getList()
  }
}, { immediate: true })
</script>

<template>
  <div v-if="userId">
    <ContentWrap>
      <!-- 搜索表单 -->
      <el-form
        ref="queryFormRef"
        class="-mb-[15px]"
        :model="queryParams"
        :inline="true"
        label-width="100px"
      >
        <el-form-item label="用户编号" prop="id">
          <el-input
            v-model="queryParams.id"
            placeholder="请输入用户编号"
            clearable
            class="!w-[200px]"
          />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input
            v-model="queryParams.nickname"
            placeholder="请输入昵称"
            clearable
            class="!w-[200px]"
          />
        </el-form-item>
        <el-form-item label="上级昵称" prop="parentNickname">
          <el-input
            v-model="queryParams.parentNickname"
            placeholder="请输入上级昵称"
            clearable
            class="!w-[200px]"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <Icon icon="ep:search" class="mr-[5px]" /> 搜索
          </el-button>
          <el-button @click="resetQuery">
            <Icon icon="ep:refresh" class="mr-[5px]" /> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </ContentWrap>

    <ContentWrap>
      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="list"
        :stripe="true"
        :show-overflow-tooltip="true"
      >
        <el-table-column label="用户编号" align="center" prop="id" width="100px" />
        <el-table-column label="用户昵称" align="center" prop="nickname" min-width="120px" />
        <el-table-column label="用户头像" align="center" prop="avatar" width="80px">
          <template #default="scope">
            <el-avatar v-if="scope.row.avatar" :src="scope.row.avatar" :size="40" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="上级编号" align="center" prop="parentId" width="100px" />
        <el-table-column label="上级昵称" align="center" prop="parentNickname" min-width="120px" />
        <el-table-column label="上级头像" align="center" prop="parentAvatar" width="80px">
          <template #default="scope">
            <el-avatar v-if="scope.row.parentAvatar" :src="scope.row.parentAvatar" :size="40" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="下单量" align="center" prop="totalOrderCount" width="100px" />
        <el-table-column label="下单金额" align="center" prop="totalOrderAmount" width="120px">
          <template #default="scope">
            ¥{{ (scope.row.totalOrderAmount / 100).toFixed(2) }}
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
  </div>
</template>

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
      <el-form-item label="动态ID" prop="momentId">
        <el-input
          v-model="queryParams.momentId"
          placeholder="请输入动态ID"
          clearable
          
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="评论用户ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入评论用户ID"
          clearable
          
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="父评论ID" prop="parentId">
        <el-input
          v-model="queryParams.parentId"
          placeholder="请输入父评论ID"
          clearable
          
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="发布地点" prop="location">
        <el-input
          v-model="queryParams.location"
          placeholder="请输入发布地点"
          clearable
          
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="发布IP" prop="publishIp">
        <el-input
          v-model="queryParams.publishIp"
          placeholder="请输入发布IP"
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
          v-hasPermi="['gamer:user-moment-comment:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['gamer:user-moment-comment:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button
            type="danger"
            plain
            :disabled="isEmpty(checkedIds)"
            @click="handleDeleteBatch"
            v-hasPermi="['gamer:user-moment-comment:delete']"
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
      <el-table-column label="评论ID" align="center" prop="id" />
      <el-table-column label="动态ID" align="center" prop="momentId" />
      <el-table-column label="评论用户ID" align="center" prop="userId" />
      <el-table-column label="评论内容" align="center" prop="content" />
      <el-table-column label="父评论ID" align="center" prop="parentId" />
      <el-table-column label="发布地点" align="center" prop="location" />
      <el-table-column label="发布IP" align="center" prop="publishIp" />
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
            v-hasPermi="['gamer:user-moment-comment:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['gamer:user-moment-comment:delete']"
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
  <UserMomentCommentForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { UserMomentCommentApi, UserMomentComment } from '@/api/gamer/usermomentcomment'
import UserMomentCommentForm from './UserMomentCommentForm.vue'

/** 用户动态评论 列表 */
defineOptions({ name: 'UserMomentComment' })

// 接收来自父层弹窗传入的用户ID（可选）
const props = defineProps<{ userId?: number }>()

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<UserMomentComment[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  momentId: undefined,
  userId: undefined,
  parentId: undefined,
  location: undefined,
  publishIp: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await UserMomentCommentApi.getUserMomentCommentPage(queryParams)
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

// 当从父组件传入 userId 时，自动按该用户筛选
watch(
  () => props.userId,
  (val) => {
    if (val !== undefined && val !== null) {
      queryParams.userId = val as any
      handleQuery()
    }
  },
  { immediate: true }
)

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
    await UserMomentCommentApi.deleteUserMomentComment(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除用户动态评论 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await UserMomentCommentApi.deleteUserMomentCommentList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: UserMomentComment[]) => {
  checkedIds.value = records.map((item) => item.id);
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await UserMomentCommentApi.exportUserMomentComment(queryParams)
    download.excel(data, '用户动态评论.xls')
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

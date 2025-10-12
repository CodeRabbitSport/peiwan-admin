<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-[15px]"
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
          
          class="!w-[240px]"
        />
      </el-form-item>
      <el-form-item label="红包个数" prop="totalCount">
        <el-input
          v-model="queryParams.totalCount"
          placeholder="请输入红包个数"
          clearable
          
          class="!w-[240px]"
        />
      </el-form-item>
      <el-form-item label="红包类型: 1=普通,2=拼手气" prop="packetType">
        <el-select
          v-model="queryParams.packetType"
          placeholder="请选择红包类型: 1=普通,2=拼手气"
          clearable
          class="!w-[240px]"
        >
          <el-option label="普通" value="1" />
          <el-option label="拼手气" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="过期时间" prop="expireTime">
        <el-date-picker
          v-model="queryParams.expireTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-[220px]"
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
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-[5px]" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-[5px]" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['gamer:user-moment-red-packet:create']"
        >
          <Icon icon="ep:plus" class="mr-[5px]" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['gamer:user-moment-red-packet:export']"
        >
          <Icon icon="ep:download" class="mr-[5px]" /> 导出
        </el-button>
        <el-button
            type="danger"
            plain
            :disabled="isEmpty(checkedIds)"
            @click="handleDeleteBatch"
            v-hasPermi="['gamer:user-moment-red-packet:delete']"
        >
          <Icon icon="ep:delete" class="mr-[5px]" /> 批量删除
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
      <el-table-column label="主键ID" align="center" prop="id" />
      <el-table-column label="动态ID" align="center" prop="momentId" />
      <el-table-column label="红包总金额" align="center" prop="amount" />
      <el-table-column label="红包个数" align="center" prop="totalCount" />
      <el-table-column label="红包类型: 1=普通,2=拼手气" align="center" prop="packetType" />
      <el-table-column label="祝福语" align="center" prop="message" />
      <el-table-column
        label="过期时间"
        align="center"
        prop="expireTime"
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
            v-hasPermi="['gamer:user-moment-red-packet:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['gamer:user-moment-red-packet:delete']"
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
  <UserMomentRedPacketForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { UserMomentRedPacketApi, UserMomentRedPacket } from '@/api/gamer/usermomentredpacket'
import UserMomentRedPacketForm from './UserMomentRedPacketForm.vue'

/** 用户动态红包 列表 */
defineOptions({ name: 'UserMomentRedPacket' })

// 接收来自父层弹窗传入的动态ID（可选）
const props = defineProps<{ momentId?: number }>()

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<UserMomentRedPacket[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  momentId: undefined,
  totalCount: undefined,
  packetType: undefined,
  expireTime: [],
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await UserMomentRedPacketApi.getUserMomentRedPacketPage(queryParams)
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

// 当从父组件传入 momentId 时，自动按该动态筛选
watch(
  () => props.momentId,
  (val) => {
    if (val !== undefined && val !== null) {
      queryParams.momentId = val as any
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
const currentRow = ref<Record<string, any>>({})
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await UserMomentRedPacketApi.deleteUserMomentRedPacket(id)
    message.success(t('common.delSuccess'))
    currentRow.value = {}
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除用户动态红包 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await UserMomentRedPacketApi.deleteUserMomentRedPacketList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: UserMomentRedPacket[]) => {
  checkedIds.value = records.map((item) => item.id);
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await UserMomentRedPacketApi.exportUserMomentRedPacket(queryParams)
    download.excel(data, '用户动态红包.xls')
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

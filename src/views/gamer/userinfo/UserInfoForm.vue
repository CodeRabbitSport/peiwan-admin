<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="小程序openid" prop="openid">
        <el-input v-model="formData.openid" placeholder="请输入小程序openid" />
      </el-form-item>
      <el-form-item label="公众号微信openid" prop="mpOpenid">
        <el-input v-model="formData.mpOpenid" placeholder="请输入公众号微信openid" />
      </el-form-item>
      <el-form-item label="微信unionid" prop="unionid">
        <el-input v-model="formData.unionid" placeholder="请输入微信unionid" />
      </el-form-item>
      <el-form-item label="用户唯一编号" prop="userCode">
        <el-input v-model="formData.userCode" placeholder="请输入用户唯一编号" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="用户昵称" prop="nickname">
        <el-input v-model="formData.nickname" placeholder="请输入用户昵称" />
      </el-form-item>
      <el-form-item label="用户头像" prop="avatar">
        <el-input v-model="formData.avatar" placeholder="请输入用户头像" />
      </el-form-item>
      <el-form-item label="真实头像地址" prop="trueHead">
        <el-input v-model="formData.trueHead" placeholder="请输入真实头像地址" />
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-radio-group v-model="formData.sex">
          <el-radio value="1">男</el-radio>
          <el-radio value="2">女</el-radio>
          <el-radio value="0">未知</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="城市" prop="city">
        <el-input v-model="formData.city" placeholder="请输入城市" />
      </el-form-item>
      <el-form-item label="个性签名/简介" prop="signature">
        <el-input v-model="formData.signature" placeholder="请输入个性签名/简介" />
      </el-form-item>
      <el-form-item label="余额" prop="money">
        <el-input v-model="formData.money" placeholder="请输入余额" />
      </el-form-item>
      <el-form-item label="礼物余额" prop="giftMoney">
        <el-input v-model="formData.giftMoney" placeholder="请输入礼物余额" />
      </el-form-item>
      <el-form-item label="财富值" prop="wealthVal">
        <el-input v-model="formData.wealthVal" placeholder="请输入财富值" />
      </el-form-item>
      <el-form-item label="魅力值" prop="charmVal">
        <el-input v-model="formData.charmVal" placeholder="请输入魅力值" />
      </el-form-item>
      <el-form-item label="达人名称" prop="davName">
        <el-input v-model="formData.davName" placeholder="请输入达人名称" />
      </el-form-item>
      <el-form-item label="语音审核状态" prop="voiceAuditStatus">
        <el-radio-group v-model="formData.voiceAuditStatus">
          <el-radio value="1">审核通过</el-radio>
          <el-radio value="1">拒绝审核</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="是否允许查看关注" prop="isSeeFollow">
        <el-radio-group v-model="formData.isSeeFollow">
          <el-radio value="1">是</el-radio>
          <el-radio value="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="是否允许查看粉丝" prop="isSeeFans">
        <el-radio-group v-model="formData.isSeeFans">
          <el-radio value="1">是</el-radio>
          <el-radio value="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { UserInfoApi, UserInfo } from '@/api/gamer/userinfo'

/** 用户信息 表单 */
defineOptions({ name: 'UserInfoForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  openid: undefined,
  mpOpenid: undefined,
  unionid: undefined,
  userCode: undefined,
  phone: undefined,
  nickname: undefined,
  avatar: undefined,
  trueHead: undefined,
  sex: undefined,
  city: undefined,
  signature: undefined,
  money: undefined,
  giftMoney: undefined,
  wealthVal: undefined,
  charmVal: undefined,
  davName: undefined,
  voiceAuditStatus: undefined,
  isSeeFollow: undefined,
  isSeeFans: undefined
})
const formRules = reactive({
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await UserInfoApi.getUserInfo(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as UserInfo
    if (formType.value === 'create') {
      await UserInfoApi.createUserInfo(data)
      message.success(t('common.createSuccess'))
    } else {
      await UserInfoApi.updateUserInfo(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    openid: undefined,
    mpOpenid: undefined,
    unionid: undefined,
    userCode: undefined,
    phone: undefined,
    nickname: undefined,
    avatar: undefined,
    trueHead: undefined,
    sex: undefined,
    city: undefined,
    signature: undefined,
    money: undefined,
    giftMoney: undefined,
    wealthVal: undefined,
    charmVal: undefined,
    davName: undefined,
    voiceAuditStatus: undefined,
    isSeeFollow: undefined,
    isSeeFans: undefined
  }
  formRef.value?.resetFields()
}
</script>

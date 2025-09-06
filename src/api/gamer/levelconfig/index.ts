import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 打手等级配置信息 */
export interface LevelConfig {
          id: number; // 等级ID
          categoryType?: number; // 分类类型(1:陪玩, 2:打手)
          levelName?: string; // 等级名称
          levelNumber?: number; // 级别号
          upgradeFee?: number; // 自助升级费用
          upgradeDays?: number; // 自助升级天数
          isDefault?: boolean; // 是否默认等级(0:否, 1:是)
          canUpgrade?: boolean; // 是否可升级(0:否, 1:是)
          depositFee?: number; // 接单保证金(分)
          dailyOrderLimit?: number; // 每日接单数(0表示不限制)
          newOrderDelaySeconds?: number; // 新待接订单延迟接单时间(秒)
          withdrawalFeeRate?: number; // 提现手续费(%)
          orderFeeUnfreezeSeconds?: number; // 订单服务费解冻时间(秒)
          rewardCommissionRate?: number; // 打赏金额抽成百分比(%)
          canCancelOrder?: boolean; // 可自主取消接单订单权限(0:无, 1:有)
          canRefundOrder?: boolean; // 可自主退款接单订单权限(0:无, 1:有)
          canViewRefundPhone?: boolean; // 查看已申请退款订单用户手机号权限(0:无, 1:有)
          canViewUnrefundedPhone?: boolean; // 查看未退款订单用户手机号权限(0:无, 1:有)
          viewPhoneDaysLimit?: number; // 查看未退款订单用户手机号天数(-1表示不限制)
          canSetAnnouncement?: boolean; // 打手设置用户公告内容权限(0:无, 1:有)
          depositRefundSafeDays?: number; // 自主申请保证金退还安全期限(天)
          restrictedProductIds: string; // 限制指定接单商品编号列表(空或不限制)
          dailyOrderFeeLimit?: number; // 限制每日接单缴费金额(分)
          simultaneousOrderLimit?: number; // 限制同时可接单数(0表示不限制)
          orderVerificationType?: number; // 限制接单时进行验证类型(0:无需验证, 1:短信验证, 2:支付密码验证)
          upgradeSlotLimit?: number; // 限制升级人数名额(0表示不限制)
          allowDepositRecharge?: boolean; // 单低充值保证金(0:不允许, 1:允许)
          remark: string; // 备注
  }

// 打手等级配置 API
export const LevelConfigApi = {
  // 查询打手等级配置分页
  getLevelConfigPage: async (params?: any) => {
    return await request.get({ url: `/gamer/level-config/page`, params })
  },

  // 查询打手等级配置详情
  getLevelConfig: async (id: number) => {
    return await request.get({ url: `/gamer/level-config/get?id=` + id })
  },

  // 新增打手等级配置
  createLevelConfig: async (data: LevelConfig) => {
    return await request.post({ url: `/gamer/level-config/create`, data })
  },

  // 修改打手等级配置
  updateLevelConfig: async (data: LevelConfig) => {
    return await request.put({ url: `/gamer/level-config/update`, data })
  },

  // 删除打手等级配置
  deleteLevelConfig: async (id: number) => {
    return await request.delete({ url: `/gamer/level-config/delete?id=` + id })
  },

  /** 批量删除打手等级配置 */
  deleteLevelConfigList: async (ids: number[]) => {
    return await request.delete({ url: `/gamer/level-config/delete-list?ids=${ids.join(',')}` })
  },

  // 导出打手等级配置 Excel
  exportLevelConfig: async (params) => {
    return await request.download({ url: `/gamer/level-config/export-excel`, params })
  }
}

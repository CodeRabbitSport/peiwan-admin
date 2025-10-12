import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'

import { useI18n } from './useI18n'

export function useMessage() {
  const { t } = useI18n()
  return {
    // 消息提示
    info(content: string) {
      ElMessage.info(content)
    },
    // 错误消息
    error(content: string) {
      ElMessage.error(content)
    },
    // 成功消息
    success(content: string) {
      ElMessage.success(content)
    },
    // 警告消息
    warning(content: string) {
      ElMessage.warning(content)
    },
    // 弹出提示
    alert(content: string) {
      ElMessageBox.alert(content, t('common.confirmTitle'))
    },
    // 错误提示
    alertError(content: string) {
      ElMessageBox.alert(content, t('common.confirmTitle'), { type: 'error' })
    },
    // 成功提示
    alertSuccess(content: string) {
      ElMessageBox.alert(content, t('common.confirmTitle'), { type: 'success' })
    },
    // 警告提示
    alertWarning(content: string) {
      ElMessageBox.alert(content, t('common.confirmTitle'), { type: 'warning' })
    },
    // 通知提示
    notify(content: string) {
      ElNotification.info(content)
    },
    // 错误通知
    notifyError(content: string) {
      ElNotification.error(content)
    },
    // 成功通知
    notifySuccess(content: string) {
      ElNotification.success(content)
    },
    // 警告通知
    notifyWarning(content: string) {
      ElNotification.warning(content)
    },
    // 确认窗体
    confirm(content: string, tip?: string) {
      return ElMessageBox.confirm(content, tip || t('common.confirmTitle'), {
        confirmButtonText: t('common.ok'),
        cancelButtonText: t('common.cancel'),
        type: 'warning',
      })
    },
    // 删除窗体
    delConfirm(content?: string, tip?: string) {
      return ElMessageBox.confirm(
        content || t('common.delMessage'),
        tip || t('common.confirmTitle'),
        {
          confirmButtonText: t('common.ok'),
          cancelButtonText: t('common.cancel'),
          type: 'warning',
        },
      )
    },
    // 导出窗体
    exportConfirm(content?: string, tip?: string) {
      return ElMessageBox.confirm(
        content || t('common.exportMessage'),
        tip || t('common.confirmTitle'),
        {
          confirmButtonText: t('common.ok'),
          cancelButtonText: t('common.cancel'),
          type: 'warning',
        },
      )
    },
    // 提交内容
    prompt(content: string, tip: string) {
      return ElMessageBox.prompt(content, tip, {
        confirmButtonText: t('common.ok'),
        cancelButtonText: t('common.cancel'),
        type: 'warning',
        beforeClose: (action, instance, done) => {
          const d = getCurrentInstance()
          console.log('%c🤪 ~ file: /Users/soya/Desktop/p-admin/src/hooks/web/useMessage.ts:95 [] -> d : ', 'color: #22b81c', d)
          if (action === 'confirm') {

          }
        },
      })
    },
  }
}

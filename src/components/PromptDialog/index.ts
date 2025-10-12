import { createVNode, render } from 'vue'

import PromptDialog from './src/PromptDialog.vue'

export interface PromptOptions {
  title?: string
  content?: string
  confirmButtonText?: string
  cancelButtonText?: string
  inputPattern?: RegExp
  inputErrorMessage?: string
  inputPlaceholder?: string
  defaultValue?: string
}

export function promptDialog(options: PromptOptions): Promise<{ value: string } | never> {
  return new Promise((resolve, reject) => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const vnode = createVNode(PromptDialog as any, {
      title: options.title || '',
      content: options.content || '',
      confirmButtonText: options.confirmButtonText || '确定',
      cancelButtonText: options.cancelButtonText || '取消',
      inputPattern: options.inputPattern,
      inputErrorMessage: options.inputErrorMessage || '',
      inputPlaceholder: options.inputPlaceholder || '',
      defaultValue: options.defaultValue || '',
      onConfirm: (value: string) => {
        cleanup()
        resolve({ value })
      },
      onCancel: () => {
        cleanup()
        reject('cancel')
      },
      onClosed: () => {
        cleanup()
      },
    })

    function cleanup() {
      render(null, container)
      container.parentNode && container.parentNode.removeChild(container)
    }

    render(vnode, container)
  })
}

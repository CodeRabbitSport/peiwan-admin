<script lang="ts" setup>
import { createImageViewer } from '@/components/ImageViewer'
import ImagePickerDialog from '@/components/UploadFile/src/ImagePickerDialog.vue'
import { propTypes } from '@/utils/propTypes'

defineOptions({ name: 'UploadImg' })

const props = defineProps({
  modelValue: propTypes.string.def(''),
  drag: propTypes.bool.def(true),
  disabled: propTypes.bool.def(false),
  fileSize: propTypes.number.def(50),
  fileType: propTypes.array.def(['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  height: propTypes.string.def('150px'),
  width: propTypes.string.def('150px'),
  borderradius: propTypes.string.def('8px'),
  showDelete: propTypes.bool.def(true),
  showBtnText: propTypes.bool.def(true),
  directory: propTypes.string.def(undefined),
})

const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()
const pickerVisible = ref(false)

function imagePreview(imgUrl: string) {
  createImageViewer({
    zIndex: 9999999,
    urlList: [imgUrl],
  })
}

function deleteImg() {
  emit('update:modelValue', '')
}

function openPicker() {
  if (props.disabled) return
  pickerVisible.value = true
}

function onConfirm(urls: string[]) {
  emit('update:modelValue', urls[0] || '')
}
</script>

<template>
  <div class="upload-box">
    <div class="upload" :class="{ disabled }" @click="openPicker">
      <template v-if="modelValue">
        <img :src="modelValue" class="upload-image">
        <div class="upload-handle" @click.stop="openPicker">
          <div class="handle-icon" @click.stop="imagePreview(modelValue)">
            <Icon icon="ep:zoom-in" />
            <span v-if="showBtnText">{{ t('action.detail') }}</span>
          </div>
          <div v-if="showDelete && !disabled" class="handle-icon" @click.stop="deleteImg">
            <Icon icon="ep:delete" />
            <span v-if="showBtnText">{{ t('action.del') }}</span>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="upload-empty">
          <slot name="empty">
            <Icon icon="ep:plus" />
          </slot>
        </div>
      </template>
    </div>
    <div class="el-upload__tip">
      <slot name="tip" />
    </div>
    <ImagePickerDialog
      v-model="pickerVisible"
      :directory="directory"
      :file-size="fileSize"
      :file-type="fileType"
      :selected-urls="modelValue ? [modelValue] : []"
      @confirm="onConfirm"
    />
  </div>
</template>

<style lang="scss" scoped>
.is-error {
  .upload {
    border: 1px dashed var(--el-color-danger) !important;

    &:hover {
      border-color: var(--el-color-primary) !important;
    }
  }
}

.upload-box {
  .upload {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: v-bind(width);
    height: v-bind(height);
    overflow: hidden;
    cursor: pointer;
    border: 1px dashed var(--el-border-color-darker);
    border-radius: v-bind(borderradius);
    transition: var(--el-transition-duration-fast);

    &:hover {
      border-color: var(--el-color-primary);

      .upload-handle {
        opacity: 1;
      }
    }

    &.disabled {
      cursor: not-allowed;
      background: var(--el-disabled-bg-color);
      border: 1px dashed var(--el-border-color-darker) !important;

      &:hover {
        border: 1px dashed var(--el-border-color-darker) !important;
      }
    }

    .upload-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .upload-empty {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      line-height: 30px;
      color: var(--el-color-info);

      .el-icon {
        font-size: 28px;
        color: var(--el-text-color-secondary);
      }
    }

    .upload-handle {
      position: absolute;
      top: 0;
      right: 0;
      display: flex;
      width: 100%;
      height: 100%;
      cursor: pointer;
      background: rgb(0 0 0 / 60%);
      opacity: 0;
      box-sizing: border-box;
      transition: var(--el-transition-duration-fast);
      align-items: center;
      justify-content: center;

      .handle-icon {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0 6%;
        color: aliceblue;

        .el-icon {
          margin-bottom: 40%;
          font-size: 130%;
          line-height: 130%;
        }

        span {
          font-size: 85%;
          line-height: 85%;
        }
      }
    }
  }

  .el-upload__tip {
    line-height: 18px;
    text-align: center;
  }
}
</style>

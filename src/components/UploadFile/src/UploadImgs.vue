<script lang="ts" setup>
import { createImageViewer } from '@/components/ImageViewer'
import ImagePickerDialog from '@/components/UploadFile/src/ImagePickerDialog.vue'
import { propTypes } from '@/utils/propTypes'

defineOptions({ name: 'UploadImgs' })

const props = defineProps({
  modelValue: propTypes.oneOfType<string | string[]>([String, Array<string>]).isRequired,
  drag: propTypes.bool.def(true),
  disabled: propTypes.bool.def(false),
  limit: propTypes.number.def(5),
  multiple: propTypes.bool.def(false),
  fileSize: propTypes.number.def(5),
  fileType: propTypes.array.def(['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  height: propTypes.string.def('150px'),
  width: propTypes.string.def('150px'),
  borderradius: propTypes.string.def('8px'),
  directory: propTypes.string.def(undefined),
})

interface UploadEmits {
  (e: 'update:modelValue', value: string[]): void
}

const emit = defineEmits<UploadEmits>()
const pickerVisible = ref(false)

const urls = computed(() => {
  if (!props.modelValue) return [] as string[]
  return Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue]
})

function imagePreview(imgUrl: string) {
  createImageViewer({
    zIndex: 9999999,
    urlList: [imgUrl],
  })
}

function handleRemove(url: string) {
  emit('update:modelValue', urls.value.filter(item => item !== url))
}

function openPicker() {
  if (props.disabled) return
  pickerVisible.value = true
}

function onConfirm(selected: string[]) {
  emit('update:modelValue', selected.slice(0, props.limit))
}
</script>

<template>
  <div class="upload-box">
    <div class="upload">
      <div
        v-for="url in urls"
        :key="url"
        class="upload-item"
      >
        <img :src="url" class="upload-image">
        <div class="upload-handle" @click.stop>
          <div class="handle-icon" @click="imagePreview(url)">
            <Icon icon="ep:zoom-in" />
            <span>查看</span>
          </div>
          <div v-if="!disabled" class="handle-icon" @click="handleRemove(url)">
            <Icon icon="ep:delete" />
            <span>删除</span>
          </div>
        </div>
      </div>
      <div
        v-if="!disabled && urls.length < limit"
        class="upload-item upload-add"
        @click="openPicker"
      >
        <div class="upload-empty">
          <slot name="empty">
            <Icon icon="ep:plus" />
          </slot>
        </div>
      </div>
    </div>
    <div class="el-upload__tip">
      <slot name="tip" />
    </div>
    <ImagePickerDialog
      v-model="pickerVisible"
      multiple
      :limit="limit"
      :directory="directory"
      :file-size="fileSize"
      :file-type="fileType"
      :selected-urls="urls"
      @confirm="onConfirm"
    />
  </div>
</template>

<style lang="scss" scoped>
.is-error {
  .upload-add {
    border: 1px dashed var(--el-color-danger) !important;

    &:hover {
      border-color: var(--el-color-primary) !important;
    }
  }
}

.upload-box {
  .upload {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .upload-item {
    position: relative;
    width: v-bind(width);
    height: v-bind(height);
    overflow: hidden;
    background-color: transparent;
    border: 1px dashed var(--el-border-color-darker);
    border-radius: v-bind(borderradius);

    &:hover {
      .upload-handle {
        opacity: 1;
      }
    }
  }

  .upload-add {
    display: flex;
    cursor: pointer;
    align-items: center;
    justify-content: center;

    &:hover {
      border-color: var(--el-color-primary);
    }
  }

  .upload-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
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
        margin-bottom: 15%;
        font-size: 140%;
      }

      span {
        font-size: 100%;
      }
    }
  }

  .upload-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 12px;
    line-height: 30px;
    color: var(--el-color-info);

    .el-icon {
      font-size: 28px;
      color: var(--el-text-color-secondary);
    }
  }

  .el-upload__tip {
    line-height: 15px;
    text-align: center;
  }
}
</style>

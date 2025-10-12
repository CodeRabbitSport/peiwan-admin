<script lang="ts" setup>
import { useAppStore } from '@/store/modules/app'
import { underlineToHump } from '@/utils'

import { LoginForm } from './components'
import ForgetPasswordForm from './components/ForgetPasswordForm.vue'
import MobileForm from './components/MobileForm.vue'

defineOptions({ name: 'Login' })

const { t } = useI18n()
const appStore = useAppStore()
</script>

<template>
  <div id="userLayout" class="relative h-full w-full">
    <div class="h-full w-full flex items-center justify-evenly rounded-lg bg-white md:h-screen md:w-screen md:bg-[#174AFB]">
      <div class="h-full w-10/12 flex items-center justify-evenly md:w-3/5">
        <div class="absolute h-[130%] w-3/5 transform bg-white oblique -ml-52 -rotate-12 dark:bg-slate-900" />
        <div class="z-[999] box-border w-full flex flex-col justify-between rounded-lg pb-10 pt-12 md:w-96">
          <div>
            <div class="flex items-center justify-center">
              <img class="w-24" src="@/assets/imgs/logo.png" alt="">
            </div>
            <div class="mb-9">
              <p class="text-center text-4xl font-bold">
                {{ underlineToHump(appStore.getTitle) }}
              </p>
              <p class="mt-2.5 text-center text-sm text-gray-500 font-normal">
                {{ t('login.message') }}
              </p>
            </div>
            <LoginForm />
            <ForgetPasswordForm class="m-auto h-auto p-[20px] lt-xl:rounded-3xl xl:light:bg-white" />
            <MobileForm class="m-auto h-auto p-20px lt-xl:(rounded-3xl light:bg-white)" />

          </div>
        </div>
      </div>
      <div class="float-right hidden h-full w-1/2 bg-[#194bfb] md:block">
        <img class="h-full" src="@/assets/imgs/bg.jpeg" alt="">
      </div>
    </div>
  </div>
</template>

<style lang="scss">
/* remove clip-path to let rotate create a straight diagonal */
.dark .login-form {
  .el-divider__text {
    background-color: var(--login-bg-color);
  }

  .el-card {
    background-color: var(--login-bg-color);
  }
}
</style>

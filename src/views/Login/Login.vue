<script lang="ts" setup>
import { useAppStore } from '@/store/modules/app'
import { underlineToHump } from '@/utils'
import { LoginForm } from './components'

defineOptions({ name: 'Login' })

const { t } = useI18n()
const appStore = useAppStore()
</script>

<template>
  <div id="userLayout" class="w-full h-full relative">
    <div class="rounded-lg flex items-center justify-evenly w-full h-full md:w-screen md:h-screen md:bg-[#194bfb] bg-white">
      <div class="md:w-3/5 w-10/12 h-full flex items-center justify-evenly relative">
        <div class="oblique h-[130%] w-3/5 bg-white dark:bg-slate-900 transform -rotate-12 absolute -ml-52" />
        <div class="z-[999] pt-12 pb-10 md:w-96 w-full rounded-lg flex flex-col justify-between box-border">
          <div>
            <div class="flex items-center justify-center">
              <img class="w-24" src="@/assets/imgs/logo.png" alt="">
            </div>
            <div class="mb-9">
              <p class="text-center text-4xl font-bold">
                {{ underlineToHump(appStore.getTitle) }}
              </p>
              <p class="text-center text-sm font-normal text-gray-500 mt-2.5">
                {{ t('login.message') }}
              </p>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
      <div class="hidden md:block w-1/2 h-full float-right bg-[#194bfb]">
        <img class="h-full" src="@/assets/svgs/login-bg.svg" alt="banner">
      </div>
    </div>
  </div>
  
</template>

 

<style lang="scss">
.dark .login-form {
  .el-divider__text {
    background-color: var(--login-bg-color);
  }

  .el-card {
    background-color: var(--login-bg-color);
  }
}
</style>

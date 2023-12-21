<template>
  <m-page>
    <n-card title="设置">
      <n-form>
        <n-form-item label="主题颜色">
          <n-color-picker
            v-model:value="primaryColor"
            :modes="['hex']"
            :show-alpha="false"
            :swatches="['#eb6833']"
          />
        </n-form-item>

        <n-form-item label="地图标记颜色">
          <n-color-picker
            v-model:value="markerColor"
            :modes="['hex']"
            :show-alpha="false"
            :swatches="['#bf3f53']"
          />
        </n-form-item>

        <n-form-item label="主题">
          <n-space>
            <n-radio
              v-for="{ value, label } of themes"
              :key="value"
              :checked="theme === value"
              @update:checked="theme = value"
            >
              {{ label }}
            </n-radio>
          </n-space>
        </n-form-item>

        <n-form-item label="效果" :show-feedback="false">
          <n-checkbox v-model:checked="disable3D"> 禁用 3D 效果 </n-checkbox>
        </n-form-item>
      </n-form>
    </n-card>
  </m-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMSHDStore } from '@/stores/mshd'

const mshd = useMSHDStore()

const primaryColor = computed({
  get() {
    return mshd.primaryColor
  },
  set(v: string) {
    localStorage.setItem('primaryColor', v)
    mshd.primaryColor = v
  },
})

const markerColor = computed({
  get() {
    return mshd.markerColor
  },
  set(v: string) {
    localStorage.setItem('markerColor', v)
    mshd.markerColor = v
  },
})

const themes = [
  { value: 'system', label: '跟随系统' },
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' },
]

const theme = computed({
  get() {
    return mshd.theme
  },
  set(v: string) {
    localStorage.setItem('theme', v)
    mshd.theme = v
  },
})

const disable3D = computed({
  get() {
    return mshd.disable3D
  },
  set(v: boolean) {
    localStorage.setItem('disable3D', v.toString())
    mshd.disable3D = v
  },
})
</script>

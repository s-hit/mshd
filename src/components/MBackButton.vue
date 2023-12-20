<template>
  <n-button
    circle
    style="margin-bottom: 12px"
    :color="themeVars.bodyColor"
    :text-color="themeVars.textColorBase"
    @click="router.back()"
  >
    <n-icon :component="BackIcon" />
  </n-button>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useThemeVars } from 'naive-ui'
import { ArrowBackIosNewRound as BackIcon } from '@vicons/material'

const router = useRouter()
const themeVars = useThemeVars()
</script>

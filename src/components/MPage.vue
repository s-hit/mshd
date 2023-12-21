<template>
  <main class="page" @scroll="handleScroll" :style="noPaddingRight ? '' : 'padding-right: 64px;'">
    <n-space class="operations" :style="hideOperations ? 'display: none;' : ''" id="operations">
      <n-button v-if="!noDefaultOperations" quaternary color="white" @click="router.back()">
        <template #icon>
          <n-icon :component="BackIcon" />
        </template>
        返回
      </n-button>

      <n-button v-if="!noDefaultOperations" quaternary color="white" @click="router.push('/')">
        <template #icon>
          <n-icon :component="HomeIcon" />
        </template>
        首页
      </n-button>

      <n-button
        v-for="operation of operations"
        :key="operation.event"
        quaternary
        color="white"
        @click="emit('click', operation.event)"
      >
        <template #icon>
          <n-icon :component="operation.component" />
        </template>
        {{ operation.label }}
      </n-button>
    </n-space>

    <slot />
  </main>
</template>

<script setup lang="ts">
import { type Component } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowBackIosNewSharp as BackIcon, HomeSharp as HomeIcon } from '@vicons/material'

defineProps<{
  hideOperations?: boolean
  noPaddingRight?: boolean
  noDefaultOperations?: boolean
  operations?: {
    component: Component
    label?: string
    event: string
  }[]
}>()

const emit = defineEmits<{
  (event: 'click', customEvent: string): void
}>()

const router = useRouter()

function handleScroll(event: Event) {
  const target = event.target as HTMLElement
  const operations = document.getElementById('operations') as HTMLElement
  const x = Math.min(target.scrollTop, 320)
  operations.style.transform = `translateX(${x / -20}px) translateZ(${x / -20}px)`
  operations.style.boxShadow = `4px 4px 4px rgba(0, 0, 0, ${x / 320 / 5})`
}
</script>

<style scoped>
.page {
  position: relative;
  padding: 128px 0;
  max-height: 100%;
  overflow: visible;
  overflow-y: scroll;
}

.operations {
  position: fixed;
  z-index: 114514;
  top: 78px;
  left: 0px;
  width: 60%;
  background-color: #404040;
  border-radius: 3px;
  padding: 4px;
}
</style>

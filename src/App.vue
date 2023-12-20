<template>
  <n-config-provider
    :theme="useDarkTheme ? darkTheme : undefined"
    :locale="zhCN"
    :date-locale="dateZhCN"
  >
    <n-message-provider>
      <div class="stage">
        <div id="map" class="map" />

        <div id="panel" class="panel">
          <router-view v-slot="{ Component, route }">
            <transition name="collapse" mode="out-in">
              <component :is="Component" :key="route.fullPath" />
            </transition>
          </router-view>
        </div>
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import { useOsTheme, darkTheme, zhCN, dateZhCN } from 'naive-ui'
import { useMSHDStore } from '@/stores/mshd'

const osTheme = useOsTheme()
const mshd = useMSHDStore()

const useDarkTheme = computed(
  () => mshd.theme === 'dark' || (mshd.theme === 'system' && osTheme.value === 'dark'),
)

function onMouseMove(event: MouseEvent) {
  const w = window.innerWidth
  const x = event.pageX

  const map = document.getElementById('map')!
  map.style.transform = mshd.disable3D ? '' : `translateX(${20 * ((2 * x) / w - 1)}px)`

  const panel = document.getElementById('panel')!
  panel.style.transform = mshd.disable3D ? '' : `rotateY(${20 * (x / w - 1) - 10}deg)`
}

onMounted(() => {
  const panel = document.getElementById('panel')!
  panel.style.transform = mshd.disable3D ? '' : 'rotateY(-20deg)'

  window.addEventListener('mousemove', onMouseMove)
  mshd.initMap()
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
})
</script>

<style scoped lang="scss">
@import '@/assets/main.scss';

.map {
  @include fullscreen(-20px);
  left: unset;
  width: calc(100% + 768px + 40px);
  max-width: calc(200% + 40px);
  transition: transform 0.5s ease-out;
}

.stage {
  @include fullscreen;
  perspective: 2500px;
}

.panel {
  position: absolute;
  top: -32px;
  right: -32px;
  bottom: -32px;

  width: 768px;
  max-width: 100%;
  perspective: 0px;

  @include bezier;
  transition: transform 0.5s ease-out;
}

.collapse-enter-active,
.collapse-leave-active {
  @include bezier;
  transition: transform 0.3s;
}

.collapse-enter-from,
.collapse-leave-to {
  transform: translateX(100%);
}
</style>

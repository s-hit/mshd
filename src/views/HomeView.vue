<template>
  <m-page hide-operations no-padding-right>
    <n-grid :x-gap="12" :y-gap="12">
      <n-gi :span="22" :offset="2">
        <n-divider class="time" title-placement="left">
          <n-time :time="new Date()" type="date" /> &emsp; 用户
          {{ name }}
        </n-divider>
      </n-gi>

      <n-gi :span="24">
        <n-divider class="status" title-placement="left">
          灾情 <n-number-animation :from="0" :to="data.totalEvents" /> &emsp; 情报
          <n-number-animation :from="0" :to="data.totalMessages" />
        </n-divider>
      </n-gi>

      <n-gi :span="22" :offset="2">
        <div class="button" style="height: auto; font-size: 3em" @click="router.push('/messages')">
          <n-grid :x-gap="18">
            <n-gi :span="6">
              <div class="today">
                <n-number-animation :from="0" :to="data.todayMessages" />
              </div>
              <div class="today-desc">今日上传</div>
            </n-gi>

            <n-gi :span="18">
              <div class="title">情报</div>
            </n-gi>
          </n-grid>

          <n-icon class="icon" style="right: 40%" :component="MessageIcon" />
          <div class="decoration d1" />
        </div>
      </n-gi>

      <n-gi :span="8" :offset="1">
        <div class="button" @click="router.push('/events')">
          <div class="title">灾情</div>
          <n-icon class="icon" :component="EventIcon" />
        </div>
      </n-gi>

      <n-gi :span="8">
        <div class="button darken" @click="router.push('/messages?filter=true')">
          <div class="title">聚焦</div>
          <div class="description">星标情报</div>
          <n-icon class="icon" :component="StarIcon" />
        </div>
      </n-gi>

      <n-gi :span="7">
        <div class="button quit disabled" />
      </n-gi>

      <n-gi :span="18" :offset="3">
        <n-grid>
          <n-gi :span="12">
            <div class="button blue" @click="router.push('/upload')">
              <div class="title">上传情报</div>
              <n-icon class="icon" :component="UploadIcon" />
            </div>
          </n-gi>

          <n-gi :span="12">
            <div class="button blue small" @click="addPOI">
              <div class="banner">
                <n-icon :component="NoInternetIcon" />
                弱网环境
              </div>
              <div class="title">独立上传入口</div>
            </div>
          </n-gi>
        </n-grid>
      </n-gi>

      <n-gi :span="7" :offset="2">
        <div class="button" @click="addPOI">
          <div class="title">设置</div>
          <n-icon class="icon" :component="SettingsIcon" />
          <div class="decoration d2" />
        </div>
      </n-gi>

      <n-gi :span="10">
        <n-grid :cols="10">
          <n-gi :span="7">
            <div class="button" @click="addPOI">
              <div class="title">统计</div>
              <div class="description small">BETA</div>
              <n-icon class="icon" :component="StatsIcon" />
            </div>
          </n-gi>

          <n-gi :span="3">
            <div class="button quit" @click="quit">
              <div class="title">退出</div>
            </div>
          </n-gi>
        </n-grid>
      </n-gi>
    </n-grid>
  </m-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useMSHDStore } from '@/stores/mshd'
import {
  MessageFilled as MessageIcon,
  DeviceHubFilled as EventIcon,
  StarFilled as StarIcon,
  CloudUploadFilled as UploadIcon,
  SignalCellularConnectedNoInternet1BarFilled as NoInternetIcon,
  SettingsFilled as SettingsIcon,
  InsertChartFilled as StatsIcon,
} from '@vicons/material'

type Data = {
  totalEvents: number
  totalMessages: number
  todayMessages: number
  todayCoords: [number, number][]
}

const router = useRouter()
const message = useMessage()
const mshd = useMSHDStore()

const name = localStorage.getItem('name')
const data = ref<Data>({
  todayMessages: 0,
  totalMessages: 0,
  totalEvents: 0,
  todayCoords: [],
})

onMounted(async () => {
  const response = await mshd.get<Data>('/api/page/home')
  if (typeof response === 'string') return message.error('加载失败。' + response)
  data.value = response
  mshd.map?.animateTo({ center: [100, 33], zoom: 4 })
  mshd.addPoints(response.todayCoords)
})

onUnmounted(() => {
  mshd.clearPoints()
})

function addPOI() {
  message.success('Hello World')
}

function quit() {
  localStorage.removeItem('token')
  router.replace('/login')
}
</script>

<style scoped lang="scss">
@import '@/assets/main.scss';

.time {
  color: white;
  text-shadow: 2px 3px #808080;
  margin: 0;

  & > :first-child,
  & > :last-child {
    background-color: white;
    height: 4px;
  }
}

.status {
  color: white;
  background-color: rgba(0, 0, 0, 0.2);
  text-shadow: 2px 3px #808080;
  font-size: 1.5em;
  padding: 0 16px;
  margin: 0;

  & > :first-child {
    display: none;
  }

  & > :last-child {
    background-color: rgba(0, 0, 0, 0.2);
    height: 4px;
  }
}

.button {
  position: relative;

  color: #303030;
  background-color: #ffffff;
  box-shadow: 2px 8px 16px rgba(0, 0, 0, 0.2);

  height: 128px;
  padding: 24px;

  @include serif;
  font-size: 2.5em;
  line-height: 1;

  transition: all 0.3s;

  .title {
    @include single-line;
    position: relative;
    z-index: 2;
    font-weight: 900;
  }

  .description {
    position: relative;
    z-index: 2;
    color: #707070;
    @include single-line;
    @include sanserif;
    font-size: 1.25rem;

    &.small {
      color: #eb6833;
      font-size: 1rem;
    }
  }

  .today {
    color: #000000;
    background-color: #d0d0d0;
    padding: 4px 8px;
    @include sanserif;
    font-size: 3.5rem;
    font-weight: 900;
    text-shadow: 3px 3px #808080;
    text-align: right;
  }

  .today-desc {
    color: #ffffff;
    background-color: #303030;
    padding: 2px 8px;
    margin-top: 4px;
    border-radius: 4px;
    @include sanserif;
    font-size: 1.25rem;
    text-align: right;
  }

  .icon {
    position: absolute;
    right: 0;
    bottom: 0;
    color: #e0e0e0;
    font-size: 128px;
    z-index: 1;
  }

  .decoration {
    position: absolute;
    background-color: #eb6833;

    &.d1 {
      left: 30%;
      right: 20%;
      bottom: -2px;
      height: 4px;
    }

    &.d2 {
      top: -3px;
      left: 15%;
      right: 15%;
      height: 6px;
    }
  }

  &.blue {
    color: #ffffff;
    background-color: #5aadd0;
    line-height: 128px;
    text-align: center;

    &.small {
      font-size: 2em;
      border-left: 1px solid #606060;
    }

    .icon {
      color: #6dbedf;
    }

    .banner {
      @include sanserif;
      position: absolute;
      top: 4px;
      left: 0;
      right: 6px;

      background-color: #303030;

      font-size: 1.4rem;
      line-height: 1.6;
      text-align: left;
    }
  }

  &.quit {
    color: #ffffff;
    background-color: #404040;
    font-size: 1.5em;
  }

  &:not(.disabled) {
    cursor: pointer;

    &:hover {
      filter: brightness(0.8);
    }

    &:active {
      filter: brightness(0.6);
    }
  }

  @media #{$dark} {
    color: #e0e0e0;
    background-color: #404040;

    &.darken {
      background-color: #303030;
    }

    .today,
    .today-desc {
      color: #e0e0e0;
      background-color: #505050;
    }

    .today {
      text-shadow: 3px 3px #303030;
    }

    .icon {
      color: #505050;
    }
  }
}
</style>

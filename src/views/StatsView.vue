<template>
  <m-page>
    <n-space vertical>
      <n-card>
        <n-grid :x-gap="12">
          <n-gi :span="6"><n-statistic label="情报" :value="data.messages" /></n-gi>
          <n-gi :span="6"><n-statistic label="灾情" :value="data.events" /></n-gi>
          <n-gi :span="6"><n-statistic label="图片" :value="data.attachments" /></n-gi>
          <n-gi :span="6"><n-statistic label="用户" :value="data.users" /></n-gi>
        </n-grid>
      </n-card>

      <n-card title="情报数量统计">
        <n-tabs type="line" animated>
          <n-tab-pane name="date" tab="最近一周">
            <n-timeline>
              <n-timeline-item v-for="{ date, count } of data.messagesByDate" :key="date">
                <template #header>
                  <n-time type="date" :time="new Date(date)" />
                </template>

                <n-progress
                  type="line"
                  :color="themeVars.primaryColor"
                  :percentage="(count / maxMessagesByDate) * 100"
                  indicator-placement="inside"
                >
                  {{ count }}
                </n-progress>
              </n-timeline-item>
            </n-timeline>
          </n-tab-pane>

          <n-tab-pane name="area" tab="按行政区划">
            <n-timeline>
              <n-timeline-item
                v-for="{ area, count } of data.messagesByArea"
                :key="area"
                :title="area"
              >
                <n-progress
                  type="line"
                  :color="themeVars.primaryColor"
                  :percentage="(count / maxMessagesByArea) * 100"
                  indicator-placement="inside"
                >
                  {{ count }}
                </n-progress>
              </n-timeline-item>
            </n-timeline>
          </n-tab-pane>

          <n-tab-pane name="type" tab="按灾害类型">
            <n-timeline>
              <n-timeline-item
                v-for="{ type, count } of data.messagesByType"
                :key="type"
                :title="types[type]"
              >
                <n-progress
                  type="line"
                  :color="themeVars.primaryColor"
                  :percentage="(count / maxMessagesByType) * 100"
                  indicator-placement="inside"
                >
                  {{ count }}
                </n-progress>
              </n-timeline-item>
            </n-timeline>
          </n-tab-pane>
        </n-tabs>
      </n-card>
    </n-space>
  </m-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessage, useThemeVars } from 'naive-ui'
import { useMSHDStore } from '@/stores/mshd'
import types from '@/assets/types'

const message = useMessage()
const themeVars = useThemeVars()
const mshd = useMSHDStore()

type Data = {
  messages: number
  events: number
  attachments: number
  users: number
  messagesByArea: { area: string; count: number }[]
  messagesByType: { type: number; count: number }[]
  messagesByDate: { date: string; count: number }[]
}

const data = ref<Data>({
  messages: 0,
  events: 0,
  attachments: 0,
  users: 0,
  messagesByArea: [],
  messagesByType: [],
  messagesByDate: [],
})

const maxMessagesByArea = computed(() => data.value.messagesByArea[0]?.count ?? 0)
const maxMessagesByType = computed(() => data.value.messagesByType[0]?.count ?? 0)
const maxMessagesByDate = computed(() => Math.max(...data.value.messagesByDate.map(v => v.count)))

onMounted(async () => {
  const response = await mshd.get<Data>('/api/page/stats')
  if (typeof response === 'string') return message.error('加载失败。')
  data.value = response
})
</script>

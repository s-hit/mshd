<template>
  <m-page :operations="operations" @click="handleOperation">
    <n-space vertical>
      <n-card v-if="data.messages.length === 0">
        <n-empty description="暂无信息">
          <template #icon>
            <n-icon :component="EmptyIcon" />
          </template>
        </n-empty>
      </n-card>

      <template v-else>
        <n-card v-if="data.messageData" :title="data.messages[0].eventName">
          <n-collapse>
            <n-collapse-item title="所含事件" name="contains">
              <n-timeline>
                <n-timeline-item
                  v-for="(datum, index) of data.messageData"
                  :key="datum.id"
                  :line-type="index === data.messageData.length - 1 ? 'dashed' : 'default'"
                >
                  <n-space justify="space-between">
                    <n-text>
                      <n-time type="date" :time="new Date(datum.date)" />
                      ・ {{ datum.area }} ・ {{ types[datum.type] }}
                    </n-text>

                    <n-button
                      v-if="data.messageData.length > 1"
                      text
                      @click="postMessageData(datum)"
                    >
                      <n-icon :component="DeleteIcon" />
                    </n-button>
                  </n-space>
                </n-timeline-item>

                <n-timeline-item>
                  <n-grid :x-gap="12">
                    <n-gi :span="7">
                      <n-date-picker type="date" v-model:value="input.date" />
                    </n-gi>
                    <n-gi :span="7">
                      <n-select :options="areaOptions" v-model:value="input.area" />
                    </n-gi>
                    <n-gi :span="7">
                      <n-select :options="typeOptions" v-model:value="input.type" />
                    </n-gi>
                    <n-gi :span="3">
                      <n-button type="primary" block @click="postMessageData(undefined)">
                        新增
                      </n-button>
                    </n-gi>
                  </n-grid>
                </n-timeline-item>
              </n-timeline>
            </n-collapse-item>

            <n-collapse-item title="灾情信息" name="information">
              <n-grid :x-gap="12">
                <n-gi :span="21">
                  <n-input v-model:value="name" placeholder="灾情名称" />
                </n-gi>
                <n-gi :span="3">
                  <n-button type="primary" block :disabled="!name" @click="postEvent">
                    更新
                  </n-button>
                </n-gi>
              </n-grid>
            </n-collapse-item>
          </n-collapse>
        </n-card>

        <n-card v-for="(message, index) of data.messages" :key="message.id">
          <n-p>
            <n-space>
              <n-button
                v-if="message.eventId !== props.eventId"
                secondary
                size="small"
                @click="router.push(mshd.getURL('/messages', { eventId: message.eventId }))"
              >
                <template #icon>
                  <n-icon :component="EventIcon" />
                </template>
                {{ message.eventName }}
              </n-button>

              <n-button
                secondary
                :type="message.star ? 'primary' : 'default'"
                size="small"
                @click="star(index)"
              >
                <template #icon>
                  <n-icon :component="message.star ? StarFilled : StarBorder" />
                </template>
                {{ message.star ? '取消星标' : '星标' }}
              </n-button>

              <n-button
                v-if="message.lng && message.lat"
                secondary
                size="small"
                @click="panTo(message.lng, message.lat)"
              >
                <template #icon>
                  <n-icon :component="PinIcon" />
                </template>
                查看位置
              </n-button>
            </n-space>
          </n-p>

          <n-p v-if="message.description">
            {{ message.description }}
          </n-p>

          <n-p v-if="message.fileNames.length">
            <n-space>
              <n-image
                v-for="fileName of message.fileNames"
                :key="fileName"
                width="100"
                lazy
                :src="`/api/public/thumbnails/${fileName}`"
                :preview-src="`/api/public/images/${fileName}`"
              />
            </n-space>
          </n-p>

          <n-p :depth="3">
            {{ message.area }} ・ {{ types[message.type] }}
            <n-text v-if="message.time" :depth="3">
              ・ <n-time :time="new Date(message.time)" />
            </n-text>
            ・ 发布于
            <n-time :time="new Date(message.createdAt)" type="relative" />
          </n-p>
        </n-card>

        <n-card>
          <n-space justify="center">
            <n-pagination v-model:page="page" :page-count="data.maxPage" @update:page="fetchData" />
          </n-space>
        </n-card>
      </template>
    </n-space>
  </m-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import {
  InboxRound as EmptyIcon,
  DeviceHubFilled as EventIcon,
  PinDropSharp as PinIcon,
  StarFilled,
  StarBorderSharp as StarBorder,
  CloseSharp as DeleteIcon,
} from '@vicons/material'

import types from '@/assets/types'
import areas from '@/assets/areas'
import { useMSHDStore } from '@/stores/mshd'

type Message = {
  id: number
  createdAt: number
  description?: string
  lng?: number
  lat?: number
  area: string
  type: number
  time?: number
  eventId: number
  eventName: string
  fileNames: string[]
  star: boolean
}

type MessageData = { id: number; area: string; type: number; date: string }

type Data = {
  messages: Message[]
  messageData?: MessageData[]
  maxPage: number
}

const router = useRouter()
const message = useMessage()
const mshd = useMSHDStore()

const props = defineProps<{
  filter: boolean
  eventId?: number
}>()

const data = ref<Data>({ messages: [], maxPage: 1 })
const page = ref(1)

const typeOptions = [...types.entries()].map(([value, label]) => ({ value, label }))
const areaOptions = areas.map(v => ({ value: v, label: v }))
const name = ref('')
const input = ref({
  area: '未知区域',
  date: new Date().getTime(),
  type: 0,
})

async function fetchData() {
  data.value.messages = []
  const response = await mshd.get<Data>('/api/page/messages', {
    filter: props.filter,
    page: page.value - 1,
    eventId: props.eventId,
  })
  if (typeof response === 'string') return message.error('加载失败。' + response)
  data.value = response
  name.value = response.messages[0]?.eventName ?? ''
  mshd.map?.animateTo({ center: [100, 33], zoom: 4 })
  mshd.clearPoints()
  mshd.addPoints(response.messages.filter(v => v.lng && v.lat).map(({ lng, lat }) => [lng!, lat!]))
}

async function star(index: number) {
  type Res = { state: boolean }
  const msg = data.value.messages[index]
  const response = await mshd.post<Res>('/api/star', { id: msg.id, state: !msg.star })
  if (typeof response === 'string') return message.error('星标失败。' + response)
  data.value.messages[index].star = response.state
}

async function postMessageData(dropMessageData?: MessageData) {
  const response = await mshd.post(
    '/api/messageData',
    dropMessageData
      ? {
          area: dropMessageData.area,
          date: new Date(dropMessageData.date).getTime(),
          type: dropMessageData.type,
        }
      : {
          ...input.value,
          id: props.eventId,
        },
  )
  if (typeof response === 'string') return message.error('修改失败。')
  message.success('修改成功。')
  fetchData()
}

async function postEvent() {
  const response = await mshd.post('/api/event', { id: props.eventId, name: name.value })
  if (typeof response === 'string') return message.error('修改失败。' + response)
  message.success('修改成功。')
  fetchData()
}

function panTo(lng: number, lat: number) {
  mshd.map?.animateTo({ center: [lng, lat], zoom: 14 })
}

onMounted(fetchData)
onUnmounted(mshd.clearPoints)

const operations = [
  props.filter
    ? { component: StarFilled, label: '全部', event: 'filter' }
    : { component: StarBorder, label: '聚焦', event: 'filter' },
]

function handleOperation(event: string) {
  if (event === 'filter') {
    router.replace(mshd.getURL('/messages', { filter: !props.filter, eventId: props.eventId }))
  }
}
</script>

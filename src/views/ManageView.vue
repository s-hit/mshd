<template>
  <m-page no-default-operations :operations="operations" @click="handleOperation">
    <n-space vertical>
      <n-card v-if="data.messages.length === 0">
        <n-empty description="暂无信息">
          <template #icon>
            <n-icon :component="EmptyIcon" />
          </template>
        </n-empty>
      </n-card>

      <template v-else>
        <n-list bordered>
          <n-list-item v-for="message of data.messages" :key="message.id">
            <n-p>
              {{ message.description }}
            </n-p>

            <n-p :depth="3">
              灾情码
              <n-time format="yyMMddhhmmss" :time="new Date(message.time)" />{{
                message.type.toString().padStart(2, '0')
              }}{{ (message.lng ?? 0).toFixed(0).padStart(3, '0')
              }}{{ (message.lat ?? 0).toFixed(0).padStart(3, '0')
              }}{{ message.id.toString().padStart(2, '0').slice(-2) }} ・ {{ message.eventName }}
            </n-p>

            <template #suffix>
              <n-button type="error" text @click="drop(message.id)">删除</n-button>
            </template>
          </n-list-item>
        </n-list>

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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useMSHDStore } from '@/stores/mshd'
import { InboxRound as EmptyIcon, AccessibleForwardRound as QuitIcon } from '@vicons/material'

const router = useRouter()
const message = useMessage()
const mshd = useMSHDStore()

type Message = {
  id: number
  createdAt: number
  description?: string
  lng?: number
  lat?: number
  area: string
  type: number
  time: number
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

const data = ref<Data>({
  messages: [],
  maxPage: 1,
})
const page = ref(1)

const operations = [{ component: QuitIcon, label: '退出管理', event: 'quit' }]
function handleOperation(event: string) {
  if (event === 'quit') {
    localStorage.removeItem('token')
    router.replace('/login')
  }
}

async function fetchData() {
  data.value.messages = []
  const response = await mshd.get<Data>('/api/page/messages', { page: page.value - 1 })
  if (typeof response === 'string') return message.error('加载失败。' + response)
  data.value = response
}

async function drop(id: number) {
  const response = await mshd.post('/api/delete/message', { id })
  if (typeof response === 'string') return message.error('删除失败。')
  message.success('删除成功。')
  await fetchData()
}

onMounted(fetchData)
</script>

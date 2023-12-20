<template>
  <m-page>
    <n-space vertical>
      <n-card v-if="data.events.length === 0">
        <n-empty description="暂无信息">
          <template #icon>
            <n-icon :component="EmptyIcon" />
          </template>
        </n-empty>
      </n-card>

      <template v-else>
        <n-list bordered hoverable clickable>
          <n-list-item
            v-for="event of data.events"
            :key="event.id"
            @click="router.push(`/messages?eventId=${event.id}`)"
          >
            {{ event.name }}
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
import { InboxRound as EmptyIcon } from '@vicons/material'

const router = useRouter()
const message = useMessage()
const mshd = useMSHDStore()

type Data = {
  events: { id: number; name: string }[]
  maxPage: number
}

const data = ref<Data>({
  events: [],
  maxPage: 1,
})
const page = ref(1)

async function fetchData() {
  data.value.events = []
  const response = await mshd.get<Data>('/api/page/events', { page: page.value - 1 })
  if (typeof response === 'string') return message.error('加载失败。' + response)
  data.value = response
}

onMounted(fetchData)
</script>

<template>
  <m-page>
    <n-card title="上传情报">
      <n-form v-model="data">
        <n-grid :x-gap="12">
          <n-form-item-gi :span="24" label="灾情描述" path="description">
            <n-input type="textarea" :autosize="{ minRows: 3 }" v-model:value="data.description" />
          </n-form-item-gi>

          <n-form-item-gi :span="12" label="灾害类型" path="type">
            <n-select v-model:value="data.type" :options="options" />
          </n-form-item-gi>

          <n-form-item-gi :span="12" label="情报时间" path="time">
            <n-date-picker
              type="datetime"
              style="width: 100%"
              v-model:value="data.time"
              :is-date-disabled="(t: number) => t > Date.now()"
            />
          </n-form-item-gi>

          <n-form-item-gi :span="21" label="情报位置">
            <n-input
              pair
              separator=","
              readonly
              :value="[data.lng.toFixed(6), data.lat.toFixed(6)]"
            />
          </n-form-item-gi>

          <n-form-item-gi :span="3">
            <n-button block @click="getPosition">定位</n-button>
          </n-form-item-gi>

          <n-form-item-gi :span="24" label="附件" path="attachments">
            <n-upload
              multiple
              directory-dnd
              list-type="image"
              v-model:file-list="data.attachments"
              @before-upload="handleBeforeUpload"
            >
              <n-upload-dragger>
                <n-icon size="48" :depth="3" :component="FileIcon" />
              </n-upload-dragger>
            </n-upload>
          </n-form-item-gi>

          <n-gi>
            <n-button type="primary" @click="submit">提交</n-button>
          </n-gi>
        </n-grid>
      </n-form>
    </n-card>
  </m-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, type UploadFileInfo } from 'naive-ui'
import { UploadFileSharp as FileIcon } from '@vicons/material'

import types from '@/assets/types'
import { useMSHDStore } from '@/stores/mshd'

const router = useRouter()
const mshd = useMSHDStore()
const message = useMessage()

const data = ref({
  description: '',
  lng: NaN,
  lat: NaN,
  type: 0,
  time: Date.now(),
  attachments: [] as UploadFileInfo[],
})

const options = [
  { label: '请选择', value: 0, disabled: true },
  ...[...types.entries()].map(([value, label]) => ({ value, label })).slice(1),
]

function getPosition() {
  navigator.geolocation.getCurrentPosition(
    position => {
      data.value.lng = position.coords.longitude
      data.value.lat = position.coords.latitude
      mshd.map?.animateTo({
        center: [position.coords.longitude, position.coords.latitude],
        zoom: 10,
      })
    },
    undefined,
    { enableHighAccuracy: true, timeout: 1000, maximumAge: 0 },
  )
}

function handleMapMove(event: any) {
  data.value.lng = event.target.getCenter().x
  data.value.lat = event.target.getCenter().y
}

function handleBeforeUpload(options: { file: UploadFileInfo; fileList: UploadFileInfo[] }) {
  if (options.file.file === undefined) return false

  const extName = options.file.file!.type.split('/')[1] ?? ''
  const size = (options.file.file!.size ?? 0) / 1024 / 1024
  if (!['jpg', 'jpeg', 'png'].includes(extName) || size >= 10) {
    message.error('只能上传 JPEG 或 PNG 格式且不超过 10 MiB 的图片。')
    return false
  }

  return true
}

async function submit() {
  const form = new FormData()
  form.append('description', data.value.description)
  form.append('lng', data.value.lng.toString())
  form.append('lat', data.value.lat.toString())
  form.append('type', data.value.type.toString())
  form.append('time', new Date(data.value.time).toJSON())
  for (const attachment of data.value.attachments) form.append('file', attachment.file!)

  const response = await mshd.post('/api/message', form, { transformRequest: v => v })
  if (typeof response === 'string') return message.error('情报上传失败。' + response)
  message.success('情报上传成功。')
  history.length ? router.back() : router.push('/')
}

onMounted(() => {
  getPosition()
  setTimeout(getPosition, 500)
  mshd.map?.on('moving moveend zooming zoomend', handleMapMove)
})

onUnmounted(() => {
  mshd.map?.off('moving moveend zooming zoomend', handleMapMove)
})
</script>

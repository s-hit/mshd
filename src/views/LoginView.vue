<template>
  <m-page hide-operations>
    <n-card title="登录或注册">
      <n-space vertical>
        <n-input v-model:value="name" placeholder="用户名" />
        <n-input type="password" v-model:value="password" placeholder="密码" />
        <n-space align="center">
          <n-button type="primary" :disabled="!name || !password" @click="login"> 登录 </n-button>
          <n-text :depth="3"> 若未注册则自动注册 </n-text>
        </n-space>
      </n-space>
    </n-card>
  </m-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useMSHDStore } from '@/stores/mshd'

const router = useRouter()
const message = useMessage()
const mshd = useMSHDStore()

const props = defineProps<{
  redirect: string
}>()

const name = ref(localStorage.getItem('name') ?? '')
const password = ref('')

async function login() {
  const response = await mshd.post<{ token: string }>('/api/login', {
    name: name.value,
    password: password.value,
  })
  if (typeof response === 'string') return message.error('登录失败。' + response)
  localStorage.setItem('token', response.token)
  localStorage.setItem('name', name.value)
  router.replace(props.redirect)
}
</script>

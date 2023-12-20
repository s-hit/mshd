import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { Axios, type AxiosRequestConfig } from 'axios'
import * as mt from 'maptalks'
import { useOsTheme } from 'naive-ui'

const osTheme = useOsTheme()

const axios = new Axios({
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  transformRequest: [data => JSON.stringify(data)],
  transformResponse: [
    (data, headers) => {
      const contentType = headers.getContentType() as unknown as string
      if (contentType.startsWith('text/html')) return data
      return data ? JSON.parse(data) : {}
    },
  ],
})

export const useMSHDStore = defineStore('mshd', () => {
  const map = ref<mt.Map>()
  const vectorLayer = ref<mt.VectorLayer>()
  const points = ref<mt.Marker[]>([])

  const primaryColor = ref(localStorage.getItem('primaryColor') ?? '')
  if (!/^#[0-9A-Fa-f]{6}$/.test(primaryColor.value)) primaryColor.value = '#eb6833'

  const markerColor = ref(localStorage.getItem('markerColor') ?? '')
  if (!/^#[0-9A-Fa-f]{6}$/.test(markerColor.value)) markerColor.value = '#bf3f53'

  const theme = ref(localStorage.getItem('theme') ?? '')
  if (theme.value !== 'light' && theme.value !== 'dark') theme.value = 'system'
  const useDarkTheme = computed(
    () => theme.value === 'dark' || (theme.value === 'system' && osTheme.value === 'dark'),
  )

  const disable3D = ref(localStorage.getItem('disable3D') === 'true')

  function initMap() {
    map.value = new mt.Map('map', {
      center: [100, 33],
      zoom: 4,
      minZoom: 4,
      maxZoom: 21,
      baseLayer: new mt.GroupTileLayer('base', [
        new mt.TileLayer('small', {
          urlTemplate:
            'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}@2x.png',
          subdomains: ['a', 'b', 'c', 'd'],
          maxZoom: 8,
        }),
        new mt.TileLayer('big', {
          urlTemplate: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
          subdomains: ['a', 'b', 'c', 'd'],
          minZoom: 8,
        }),
      ]),
    })

    vectorLayer.value = new mt.VectorLayer('vec')
    vectorLayer.value.addTo(map.value)
  }

  function clearPoints() {
    points.value.map(point => {
      point.animate({ symbol: { markerWidth: 0, markerHeight: 0 } }, { duration: 200 }, frame => {
        if (frame.state.playState === 'finished') point.remove()
      })
    })

    points.value = []
  }

  function addPoints(coords: [number, number][]) {
    if (!vectorLayer.value) return

    const newPoints = coords.map(coord =>
      new mt.Marker(coord, {
        symbol: {
          markerType: 'pin',
          markerFill: markerColor.value,
          markerWidth: 0,
          markerHeight: 0,
        },
      }).addTo(vectorLayer.value!),
    )

    points.value = points.value.concat(newPoints)

    newPoints.map((point, index) =>
      setTimeout(
        () => point.animate({ symbol: { markerWidth: 40, markerHeight: 40 } }, { duration: 200 }),
        100 * index,
      ),
    )
  }

  function getURL(url: string, query?: object) {
    if (!query) return url
    const queryStr = Object.entries(query ?? {})
      .filter(([, value]) => value)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')
    return url + '?' + queryStr
  }

  async function get<T>(url: string, query?: object, config?: AxiosRequestConfig) {
    config ??= {}
    config.headers ??= {}
    config.headers.Authorization = localStorage.getItem('token')

    const response = await axios.get<T>(getURL(url, query), config)
    const { status, message } = response.data as any

    if (response.status === 401) {
      localStorage.removeItem('token')
      return '请先登录。'
    }

    if (response.status !== 200 || status !== 'success') return message as string
    return response.data
  }

  async function post<T>(url: string, body: any, config?: AxiosRequestConfig) {
    config ??= {}
    config.headers ??= {}
    config.headers.Authorization = localStorage.getItem('token')

    const response = await axios.post<T>(url, body, config)
    const { status, message } = response.data as any

    if (response.status === 401) {
      localStorage.removeItem('token')
      return '请先登录。'
    }

    if (response.status !== 200 || status !== 'success') return message as string
    return response.data
  }

  return {
    map,
    primaryColor,
    markerColor,
    theme,
    useDarkTheme,
    disable3D,
    initMap,
    clearPoints,
    addPoints,
    getURL,
    get,
    post,
  }
})

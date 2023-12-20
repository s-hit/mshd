import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Axios, type AxiosRequestConfig } from 'axios'
import * as mt from 'maptalks'

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
    let index = 0
    for (const point of points.value)
      setTimeout(() => {
        point.animate({ symbol: { markerWidth: 0, markerHeight: 0 } }, { duration: 150 })

        setTimeout(() => {
          point.remove()
        }, 150)
      }, 200 * index++)
    points.value = []
  }

  function addPoints(coords: [number, number][]) {
    let index = 2
    for (const coord of coords) {
      const point = new mt.Marker(coord, {
        symbol: {
          markerType: 'pin',
          markerFill: '#bf3f53',
          markerWidth: 0,
          markerHeight: 0,
        },
      })
      points.value.push(point)

      setTimeout(() => {
        if (vectorLayer.value) point.addTo(vectorLayer.value)
        point.animate({ symbol: { markerWidth: 40, markerHeight: 40 } }, { duration: 150 })
      }, 200 * index++)
    }
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

  return { map, initMap, clearPoints, addPoints, getURL, get, post }
})

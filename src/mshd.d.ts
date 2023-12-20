declare global {
  type Event = {
    id: string
    type: string
    site: string
  }

  type MessagePreview = {
    event: Event
    description: string
    thumbnails: string[]
    lngLat: [number, number]
  }
}

export {}

import { ref, computed, onMounted, onBeforeUnmount, type ComputedRef } from 'vue'

export type Breakpoint = 'xs' | 's' | 'm' | 'l' | 'xl'

type BreakpointMap = {
  [key in Breakpoint]: {
    width: number
    mediaQuery?: MediaQueryList
    result?: boolean
    controller?: AbortController
  }
}

export function useBreakpoints(): Readonly<ComputedRef<Breakpoint[]>> {
  const breakpoints = ref<BreakpointMap>({
    xs: { width: 0 },
    s: { width: 640 },
    m: { width: 1024 },
    l: { width: 1280 },
    xl: { width: 1536 },
  })

  function updateResult(e: MediaQueryList | MediaQueryListEvent, key: Breakpoint) {
    breakpoints.value[key].result = e.matches
  }

  onMounted(() => {
    for (const key in breakpoints.value) {
      const value = breakpoints.value[key as Breakpoint]
      const mediaQuery = (value.mediaQuery ??= window.matchMedia(`(min-width: ${value.width}px)`))
      const signal = (value.controller ??= new AbortController()).signal
      updateResult(mediaQuery, <Breakpoint>key)
      mediaQuery.addEventListener('change', e => updateResult(e, <Breakpoint>key), { signal })
    }
  })

  onBeforeUnmount(() => {
    for (const value of Object.values(breakpoints.value))
      if (value.controller !== undefined) {
        value.controller.abort()
        delete value.controller
      }
  })

  return computed(() =>
    (Object.keys(breakpoints.value) as Breakpoint[]).filter(key => breakpoints.value[key].result),
  )
}

export function useBreakpoint(): Readonly<ComputedRef<Breakpoint | undefined>> {
  const breakpoints = useBreakpoints()
  return computed(() => breakpoints.value[breakpoints.value.length - 1])
}

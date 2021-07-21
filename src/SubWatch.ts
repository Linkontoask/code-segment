function isSub(target) {
  return !!target['_ons']
}

interface SubHeard {
  _ons: any
  $on: (Playground: string | symbol, handle: (e: any) => void) => void
  $off: (Playground: string | symbol, handle: (e: any) => void) => void
  [key: string]: any
}

interface WatchHeard {
  $emit?: (Playground: string | symbol, handleData: any) => void
  [key: string]: any
}

function Sub(): SubHeard {
  const ons = {}
  const heardless: SubHeard = {
    _ons: ons,
    $on: (Playground, handle) => {
      if (ons[Playground]) {
        ons[Playground].push(handle)
      } else {
        ons[Playground] = [handle]
      }
    },
    $off: (Playground, handle) => {
      if (ons[Playground]) {
        const handles = ons[Playground]
        const newHandles = handles.filter(f => f !== handle)
        ons[Playground] = newHandles
      }
    }
  }
  Object.defineProperty(heardless, '_ons', {
    writable: false,
    configurable: false,
    enumerable: false
  })
  return heardless
}

function Watch(sub: SubHeard): WatchHeard | void {
  if (!sub) return console.error('Sub is a required parameter')
  if (!isSub(sub)) return console.error('Sub must be the return value of the Sub function')
  const onList = sub['_ons']
  return {
    $emit: (Playground, handleData) => {
      if (onList[Playground] && Array.isArray(onList[Playground])) {
        const fns = onList[Playground]
        fns.forEach(fn => typeof fn === 'function' && fn(handleData))
      }
    }
  }
}

const sub: SubHeard = Sub()

const watch = Watch(sub)

const clickHandle = e => {
  console.log('click1: ', e)
}

const click = Symbol('click')

sub.$on(click, clickHandle)

if (watch) {
  watch.$emit(click, {
    type: 'click1',
    timestrap: Date.now(),
    context: 'context data'
  })
}

sub.$off(click, clickHandle)

const hover = Symbol('hover')

sub.$on(hover, e => {
  console.log('click2: ', e)
})

if (watch) {
  watch.$emit(hover, {
    type: 'click2',
    timestrap: Date.now(),
    context: 'context props'
  })
}


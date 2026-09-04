import {
  cancelLayer,
  layerDialogAttributes,
  lockScroll,
  observeExit,
  raiseLayer,
  type LayerShellProps,
} from '@inertiajs/core'
import { defineComponent, h, onBeforeUnmount, onMounted, PropType, ref, watch } from 'vue'

export default defineComponent({
  name: 'Layer',
  props: {
    open: { type: Boolean, required: true },
    index: { type: Number, required: true },
    isTop: { type: Boolean, required: true },
    type: { type: String as PropType<LayerShellProps['type']>, required: true },
    close: { type: Function as PropType<() => void>, required: true },
    done: { type: Function, required: true },
    label: { type: String, required: false },
  },
  setup(props, { slots }) {
    const dialog = ref<HTMLDialogElement | null>(null)
    const exit = observeExit(
      () => dialog.value,
      () => props.done(),
    )
    let releaseScroll: (() => void) | null = null

    onMounted(() => {
      raiseLayer(dialog.value!, props.isTop)
      releaseScroll = lockScroll()
      exit.toggle(props.open)
    })

    onBeforeUnmount(() => {
      exit.teardown()
      releaseScroll?.()
    })

    watch(
      () => props.open,
      (open) => exit.toggle(open),
    )

    const onCancel = (event: Event) => cancelLayer(event, props)

    return () => h('dialog', { ref: dialog, ...layerDialogAttributes(props), onCancel }, slots.default?.())
  },
})

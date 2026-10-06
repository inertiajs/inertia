import { layerDialogAttributes, mountLayerDialog, type LayerShellProps, type MountedLayerDialog } from '@inertiajs/core'
import { defineComponent, h, onBeforeUnmount, onMounted, PropType, ref, watch } from 'vue'

export default defineComponent({
  name: 'Layer',
  props: {
    open: { type: Boolean, required: true },
    index: { type: Number, required: true },
    isTop: { type: Boolean, required: true },
    type: { type: String as PropType<LayerShellProps['type']>, required: true },
    close: { type: Function as PropType<() => void>, required: true },
    done: { type: Function as PropType<() => void>, required: true },
  },
  setup(props, { slots }) {
    const dialog = ref<HTMLDialogElement | null>(null)
    let mounted: MountedLayerDialog | null = null

    onMounted(() => {
      mounted = mountLayerDialog(dialog.value!, props)
    })

    watch(props, () => mounted?.update(props))

    onBeforeUnmount(() => mounted?.unmount())

    return () => h('dialog', { ref: dialog, ...layerDialogAttributes(props) }, slots.default?.())
  },
})

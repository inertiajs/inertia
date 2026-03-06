import { HeadManager } from '@inertiajs/core'
import { InjectionKey } from 'vue'

const headContext: InjectionKey<HeadManager> = Symbol('InertiaHeadContext')

export default headContext

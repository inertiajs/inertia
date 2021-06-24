import { Router } from '@inertiajs/inertia/types/router'
import {HeadManager, Page} from '@inertiajs/inertia/types/types'

declare module 'vue/types/vue' {
    // 3. Declare augmentation for Vue
    interface Vue {
        $headManager?: HeadManager
        $inertia: Router,
        $page: Page,
    }
}

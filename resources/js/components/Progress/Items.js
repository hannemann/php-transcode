import { Slim } from '@/components/lib';
import Iconify from '@iconify/iconify'
import { ICON_STACK_CSS } from '@/components/Icons/Stack.css';

const CSRF_TOKEN = document.head.querySelector("[name~=csrf-token][content]").content;

class ProgressItem extends Slim {
    onAdded() {
        requestAnimationFrame(() => Iconify.scan(this.shadowRoot))
    }

    async delete(item) {
        try {
            let response = await fetch(`/progress/${item.id}`, {
                method: 'delete',
                headers: {
                  'Content-Type': 'application/json',
                  "X-CSRF-Token": CSRF_TOKEN
                },
            })
            if (response.status !== 200) {
                let error = await response.json()
                throw new Error(error.message)
            }
        } catch (error) {
            console.error(error)
            document.dispatchEvent(new CustomEvent('toast', {
                detail: {
                    message: error,
                    type: 'error'
                }
            }))
        }
    }
}

const PROGRESS_ITEM_CSS = /*css*/`
<style>
:host > div {
    display: flex;
    justify-content: space-between;
    gap: .5em;
}
header {
    font-weight: bold;
}
div > div:last-child {
    text-align: right;
    margin-left: auto;
    width: 4em;
}
div.path {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
div.icon-stack {
    width: 1em;
}
</style>
${ICON_STACK_CSS}
`

export { PROGRESS_ITEM_CSS, ProgressItem }
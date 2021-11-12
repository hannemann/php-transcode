import { Slim } from '@/components/lib';
import Iconify from '@iconify/iconify'
import { ICON_STACK_CSS } from '@/components/Icons/Stack.css';
import {Request} from '@/components/Request'

const CSRF_TOKEN = document.head.querySelector("[name~=csrf-token][content]").content;

class ProgressItem extends Slim {
    onAdded() {
        requestAnimationFrame(() => Iconify.scan(this.shadowRoot));
    }

    showCommand(item) {
        document.dispatchEvent(
            new CustomEvent("show-textcontent", {
                detail: { content: item.command },
            })
        );
    }

    async delete(item) {
        try {
            Request.delete(`/progress/${item.id}`);
        } catch (error) {}
    }
}

const PROGRESS_ITEM_CSS = /*css*/ `
<style>
:host > div {
    display: flex;
    justify-content: space-between;
    gap: .5em;
}
header {
    font-weight: bold;
    user-select: none;
}
div > div:last-child {
    text-align: right;
    margin-left: auto;
    width: 4em;
}
div.path {
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
}
div.path.show {
    cursor: pointer;
}
div.icon-stack {
    width: 1em;
}
</style>
${ICON_STACK_CSS}
`;

export { PROGRESS_ITEM_CSS, ProgressItem }
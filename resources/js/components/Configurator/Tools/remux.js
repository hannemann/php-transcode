import { Request } from "@/components/Request";

export const requestRemux = async function (container) {
    console.info("Remux video file %s", this.item.path);
    try {
        await Request.post(`/remux/${encodeURIComponent(this.item.path)}`, {
            ...this.config,
            container,
        });
    } catch (error) {
        if (error) {
            console.error(error);
        }
    }
};

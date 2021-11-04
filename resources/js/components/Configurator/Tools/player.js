import "../Dialogues/Player";

export const requestPlay = async function () {
    const m = document.createElement("modal-window");
    const d = m.appendChild(document.createElement("dialogue-player"));
    try {
        d.path = this.item.path;
        console.log(this, d, this.item.path, d.path);
        m.header = "Player";
        document.body.appendChild(m);
        await m.open();
    } catch (error) {
        console.error(error);
    }
};

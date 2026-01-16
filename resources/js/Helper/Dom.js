export const DomHelper = {

    initDom: function() {
        DomHelper.appendShadow.call(this, DomHelper.fromTemplate.call(this));
    },

    fromTemplate: function() {
        const template = document.createElement('template');
        template.innerHTML = this.constructor.template;
        return document.importNode(template.content, true);
    },

    appendShadow: function(node) {
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(node);
    }
}
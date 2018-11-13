export default {
    detachEl(el: HTMLElement) {
        const parentNode = el.parentNode;

        if (parentNode) {
            parentNode.removeChild(el);
        }
    },

    hasContents(el: HTMLElement) {
        return el.hasChildNodes();
    },

    appendContents(el: HTMLElement, contents: HTMLElement) {
        el.appendChild(contents);
    },

    setContents(el: HTMLElement, html: string) {
        el.innerHTML = html;
    },

    findEl(el: HTMLElement, selector: string) {
        return el.querySelectorAll(selector);
    },

    detachContents(el: HTMLElement) {
        el.innerHTML = '';
    }
};

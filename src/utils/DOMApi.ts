import MobileService from '../services/MobileService';

if (MobileService.isIE) {
    DOMTokenList.prototype.toggle = function(name, flag = !this.contains(name)) {
        return flag ? (this.add(name), true) : (this.remove(name), false);
    };
}

export default {
    detachEl(el: HTMLElement) {
        el.remove();
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

import EdgeService from './EdgeService';
import 'innersvg-polyfill';
import cssVars from 'css-vars-ponyfill';

const classListToggle = function (name: string, flag = !this.contains(name)) {
    return flag ? (this.add(name), true) : (this.remove(name), false);
};

type classList = {
    add: Function,
    remove: Function
    contains: Function,
    toggle?: Function
};

export default class IEService extends EdgeService {
    static initialize() {
        super.initialize();
        this.__addCssVariables();
        this.__addDOMClassListToggle();
        this.__addSVGClassList();
        this.__addChildNodeRemove();
    }

    static __addCssVariables() {
        cssVars({
            onlyLegacy: true
        });
    }

    static __addDOMClassListToggle() {
        DOMTokenList.prototype.toggle = classListToggle;
    }

    static __addSVGClassList() {
        if ('classList' in SVGElement.prototype) {
            return;
        }
        Object.defineProperty(SVGElement.prototype, 'classList', {
            get() {
                const classList: classList = {
                    contains: (className: string) => this.className.baseVal.split(' ').includes(className),
                    add: (className: string) => {
                        this.setAttribute('class', `${this.getAttribute('class')} ${className}`);
                    },
                    remove: (className: string) => {
                        if (!this.classList.contains(className)) {
                            return;
                        }
                        const removedClass = this.getAttribute('class').replace(new RegExp(`(\\s|^)${className}(\\s|$)`, 'g'), '$2');
                        this.setAttribute('class', removedClass);
                    }
                };

                classList.toggle = classListToggle.bind(classList);
                return classList;
            }
        });
    }

    static __addChildNodeRemove() {
        (function (prototypes) {
            prototypes.forEach(function (prototype) {
                if (prototype.hasOwnProperty('remove')) {
                    return;
                }
                Object.defineProperty(prototype, 'remove', {
                    configurable: true,
                    enumerable: true,
                    writable: true,
                    value: function remove() {
                        if (this.parentNode === null) {
                            return;
                        }
                        this.parentNode.removeChild(this);
                    }
                });
            });
          })([Element.prototype, CharacterData.prototype, DocumentType.prototype]);
    }
}

/* eslint-disable prefer-arrow-callback */

import EdgeService from './EdgeService';
import 'innersvg-polyfill';
import ResizeObserver from 'resize-observer-polyfill';
import cssVars from 'css-vars-ponyfill';

const classListToggle = function (name: string, flag = !this.contains(name)) {
    return flag ? (this.add(name), true) : (this.remove(name), false);
};

type classList = {
    add: Function,
    remove: Function,
    contains: Function,
    toggle?: Function
};

export default class IEService extends EdgeService {
    static initialize() {
        this.__fixClassListBehaviour();
        this.__addCssVariables();
        this.__addDOMClassListToggle();
        this.__addSVGClassList();
        this.__addChildNodeRemove();
        this.__addDocumentContains();
        this.__addParendAppend();
        this.__addOnceListeners();
        this.__addNumberIsNaN();
        this.__addResizeObserver();

        super.initialize();
    }

    static __fixClassListBehaviour() {
        DOMTokenList.prototype.toggle = function(name, flag = !this.contains(name)) {
            return flag ? (this.add(name), true) : (this.remove(name), false);
        };

        const originAdd = DOMTokenList.prototype.add;
        DOMTokenList.prototype.add = function() {
            [...arguments].map(name => originAdd.call(this, name));
        };

        const oldRemove = DOMTokenList.prototype.remove;
        DOMTokenList.prototype.remove = function() {
            [...arguments].map(name => oldRemove.call(this, name));
        };
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
        [Element.prototype, CharacterData.prototype, DocumentType.prototype].forEach(function polyfill(prototype) {
            if (prototype.hasOwnProperty('remove')) { //eslint-disable-line no-prototype-builtins
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
    }

    static __addDocumentContains() {
        if ('contains' in document) {
            return;
        }
        Object.defineProperty(document, 'contains', {
            get() {
                return (otherNode: Node) => document.body.contains(otherNode);
            }
        });
    }

    static __addParendAppend() {
        [Element.prototype, Document.prototype, DocumentFragment.prototype].forEach(function polyfill(item) {
            if (item.hasOwnProperty('append')) { //eslint-disable-line no-prototype-builtins
                return;
            }
            Object.defineProperty(item, 'append', {
                configurable: true,
                enumerable: true,
                writable: true,
                value: function append() {
                    const argArr = Array.prototype.slice.call(arguments);
                    const docFrag = document.createDocumentFragment();

                    argArr.forEach(function callback(argItem: Node) {
                        const isNode = argItem instanceof Node;
                        docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
                    });

                    this.appendChild(docFrag);
                }
            });
        });
    }

    static __addOnceListeners() {
        [Element.prototype, document, window].forEach(prototype => {
            const originAddEventListener = prototype.addEventListener;

            type optionsType = undefined | boolean | { capture?: boolean, once?: boolean, passive?: boolean };

            const addEventListener = function(type: string, listener: EventListener | EventListenerObject, options: optionsType) {
                const isObject = (obj: any) => typeof obj === 'object' && obj !== null;

                if (!isObject(options) || !(options.once && typeof listener === 'function')) {
                    return originAddEventListener.call(this, type, listener, options);
                }
                const wrapper = function(event: Event) {
                    prototype.removeEventListener.call(this, type, wrapper, options);
                    listener.call(this, event);
                };

                return originAddEventListener.call(this, type, wrapper, options);
            };

            prototype.addEventListener = addEventListener;
        });
    }

    static __addNumberIsNaN() {
        Number.isNaN = Number.isNaN || function(value) {
            return typeof value === 'number' && isNaN(value);
        };
    }

    static __addResizeObserver() {
        window.ResizeObserver = ResizeObserver;
    }
}

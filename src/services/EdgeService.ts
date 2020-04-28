type InsertPosition = 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend';

export default class EdgeService {
    static initialize() {
        this.__elementsFromPoint();
        this.__SVGinsertAdjacentHTML();
        this.__SVGinsertAdjacentElement();
    }

    static __elementsFromPoint() {
        if ('elementsFromPoint' in document) {
            return;
        }
        document.elementsFromPoint = document.msElementsFromPoint;
    }

    static __SVGinsertAdjacentHTML() {
        if ('insertAdjacentHTML' in SVGElement.prototype) {
            return;
        }

        Object.defineProperty(SVGElement.prototype, 'insertAdjacentHTML', {
            get() {
                return (position: InsertPosition, html: string) => {
                    const container = this.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    const parent = this.parentNode;
                    let node;
                    let first_child;
                    let next_sibling;
                
                    container.innerHTML = html;
                
                    switch (position.toLowerCase()) {
                        case 'beforebegin':
                            while ((node = container.firstChild)) {
                                parent.insertBefore(node, this);
                            }
                            break;
                        case 'afterbegin':
                            first_child = this.firstChild;
                            while ((node = container.lastChild)) {
                                first_child = this.insertBefore(node, first_child);
                            }
                            break;
                        case 'beforeend':
                            while ((node = container.firstChild)) {
                                this.appendChild(node);
                            }
                            break;
                        case 'afterend':
                            next_sibling = this.nextSibling;
                            while ((node = container.lastChild)) {
                                next_sibling = parent.insertBefore(node, next_sibling);
                            }
                            break;
                        default:
                            console.warn(`UnexpectedPosition "${position}" for "insertAdjacentHTML" method`);
                            break;
                    }
                };
            }
        });
    }

    static __SVGinsertAdjacentElement() {
        if ('insertAdjacentElement' in SVGElement.prototype) {
            return;
        }

        Object.defineProperty(SVGElement.prototype, 'insertAdjacentElement', {
            get() {
                return (position: InsertPosition, element: Element) => {
                    const parent = this.parentNode;

                    switch (position.toLowerCase()) {
                        case 'beforebegin':
                            parent.insertBefore(element, this);
                            break;
                        case 'afterbegin':
                            this.insertBefore(element, this.firstChild);
                            break;
                        case 'beforeend':
                            this.appendChild(element);
                            break;
                        case 'afterend':
                            parent.insertBefore(element, this.nextSibling);
                            break;
                        default:
                            console.warn(`UnexpectedPosition "${position}" for "insertAdjacentElement" method`);
                            break;
                    }
                };
            }
        });
    }
}

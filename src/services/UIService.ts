import _ from '../utils/underscore';

type axis = string | boolean;

type state = {
    clientRect?: ClientRect,
    documentWidth?: number,
    documentHeight?: number,
    startStyleLeft?: number,
    startStyleTop?: number,
    startStyleRight?: number,
    startStyleBottom?: number,
    startClientY?: number,
    startClientX?: number
};

type position = {
    left?: number,
    right?: number,
    top?: number,
    bottom?: number
};

type borders = {
    left?: number,
    right?: number,
    top?: number,
    bottom?: number
};

let onStart: EventListener;

export default class UIService {
    static __getDefaultsSetProperties(axis: axis): Array<string> {
        return !axis ?
            ['left', 'top'] :
            (axis === 'x' ? ['left'] :
                (axis === 'y' ?
                    ['top'] :
                    (console.warn('Unexpected value of axis'), ['left', 'top'])));
    }

    static draggable(
        { el, start, stop, drag, axis = false, borders = {}, setProperties = this.__getDefaultsSetProperties(axis) }:
            { el: HTMLElement, start: Function, stop: Function, drag: Function, axis: axis, borders: borders, setProperties: Array<string> }) {

        el.ondragstart = () => false;
        let state: state = {};

        const eventOutOfClient = function (e: MouseEvent) {
            return e.clientX > (borders.right || state.documentWidth || 0)
                || e.clientY > (borders.top || state.documentHeight || 0)
                || e.clientX < (borders.left || 0)
                || e.clientY < (borders.bottom || 0);
        };

        const onMove = function (e: MouseEvent) {
            e.preventDefault();
            if (eventOutOfClient(e)) {
                return;
            }

            const position: position = {};
            const diffX = e.clientX - (state.startClientX || 0);
            if (axis !== 'y') {
                position.left = (state.startStyleLeft || 0) + diffX;
                position.right = (state.startStyleRight || 0) - diffX;
                if (setProperties.includes('left')) {
                    el.style.left = `${position.left}px`;
                } else if (setProperties.includes('right')) {
                    el.style.right = `${position.right}px`;
                }
            }

            const diffY = e.clientY - (state.startClientY || 0);
            if (axis !== 'x') {
                position.top = (state.startStyleTop || 0) + diffY;
                position.bottom = (state.startStyleBottom || 0) - diffY;
                if (setProperties.includes('top')) {
                    el.style.top = `${position.top}px`;
                } else if (setProperties.includes('bottom')) {
                    el.style.bottom = `${position.bottom}px`;
                }
            }

            typeof drag === 'function' && drag(
                event,
                {
                    offset: position,
                    originalPosition: state.clientRect,
                    position,
                    translation: {
                        x: diffX,
                        y: diffY
                    }
                }
            );
        };

        const onStop = (event: MouseEvent) => {
            document.removeEventListener('pointerup', onStop, true);
            document.removeEventListener('pointermove', onMove, true);
            typeof stop === 'function' && stop(event, el);
        };
        
        onStart = (event: MouseEvent) => {
            const clientRect = el.getBoundingClientRect();
            const documentWidth = document.body.offsetWidth;
            const documentHeight = document.body.offsetHeight;
            const computedStyle = getComputedStyle(el);
            state = {
                clientRect,
                documentWidth,
                documentHeight: document.body.offsetHeight,
                startStyleLeft: parseInt(computedStyle.left || '0') || clientRect.left,
                startStyleTop: parseInt(computedStyle.top || '0') || clientRect.top,
                startStyleRight: parseInt(computedStyle.right || '0') || (documentWidth - clientRect.right),
                startStyleBottom: parseInt(computedStyle.bottom || '0') || (documentHeight - clientRect.bottom),
                startClientX: event.clientX,
                startClientY: event.clientY
            };
            document.addEventListener('pointerup', onStop, true);
            document.addEventListener('pointermove', onMove, true);
            typeof start === 'function' && start(event, el);
        };

        el.addEventListener('pointerdown', onStart);
    }

    static undraggable({ el }: { el: HTMLElement }) {
        if (onStart) {
            el.removeEventListener('pointerdown', onStart);
        }
    }

    static getTransitionDurationMilliseconds(el: HTMLElement): number {
        const transitionDuration = getComputedStyle(el).transitionDuration;
        const isSeconds = /^(\d)+\.*(\d)*s$/.test(transitionDuration);
        const isMilliseconds = /^(\d)+ms$/.test(transitionDuration);

        if (isSeconds && !isMilliseconds) {
            return parseFloat(transitionDuration) * 1000;
        } else if (isMilliseconds && !isSeconds) {
            return parseFloat(transitionDuration);
        }
        Core.InterfaceError.logError(`Unexpected transition duration "${transitionDuration}"`);
        return 0;
    }

    static createElementsFromHTML(htmlString: string, context?: Object): Array<Element> {
        let innerHTML = htmlString.trim();
        if (context) {
            innerHTML = Handlebars.compile(innerHTML)(context);
        }
        const div = document.createElement('div');
        div.innerHTML = innerHTML;

        return Array.from(div.children);
    }

    static createElementFromHTML(htmlString: string, context?: Object): Element {
        return this.createElementsFromHTML(htmlString, context)[0];
    }
}

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

export default class UIService {
    static __getDefaultsSetProperties(axis: axis): Array<string> {
        return !axis ?
            ['left', 'top'] :
            (axis === 'x' ? ['left'] :
                (axis === 'y' ?
                    ['top'] :
                    (console.warn('Unexpected value of axis'), ['left', 'top'])));
    }

    static getPixelNumbers(str: string | null): number {
        return Number(str && _.cutOffTo(str, 'px', ''));
    }

    static draggable(
        { el, start, stop, drag, axis = false, setProperties = this.__getDefaultsSetProperties(axis) }:
            { el: HTMLElement, start: Function, stop: Function, drag: Function, axis: axis, setProperties: Array<string> }) {

        el.ondragstart = () => false;
        let state: state = {};

        const eventOutOfClient = function (e: MouseEvent) {
            return e.clientX > (state.documentWidth || 0)
                || e.clientY > (state.documentHeight || 0)
                || e.clientX < 0
                || e.clientY < 0;
        };

        const onResize = function (e: MouseEvent) {
            if (eventOutOfClient(e)) {
                return;
            }

            const position: position = {};
            if (axis !== 'y') {
                const diffX = e.clientX - (state.startClientX || 0);
                position.left = (state.startStyleLeft || 0) + diffX;
                position.right = (state.startStyleRight || 0) - diffX;
                if (setProperties.includes('left')) {
                    el.style.left = `${position.left}px`;
                } else if (setProperties.includes('right')) {
                    el.style.right = `${position.right}px`;
                }
            }

            if (axis !== 'x') {
                const diffY = e.clientY - (state.startClientY || 0);
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
                    position
                }
            );
        };

        const onStop = (event: MouseEvent) => {
            document.removeEventListener('pointerup', onStop, true);
            document.removeEventListener('pointermove', onResize, true);
            typeof stop === 'function' && stop(event, el);
        };
        const onStart = (event: MouseEvent) => {
            const clientRect = el.getBoundingClientRect();
            const documentWidth = document.body.offsetWidth;
            const documentHeight = document.body.offsetHeight;
            state = {
                clientRect,
                documentWidth,
                documentHeight: document.body.offsetHeight,
                startStyleLeft: this.getPixelNumbers(el.style.left) || clientRect.left,
                startStyleTop: this.getPixelNumbers(el.style.top) || clientRect.top,
                startStyleRight: this.getPixelNumbers(el.style.right) || (documentWidth - clientRect.right),
                startStyleBottom: this.getPixelNumbers(el.style.bottom) || (documentHeight - clientRect.bottom),
                startClientX: event.clientX,
                startClientY: event.clientY
            };
            document.addEventListener('pointerup', onStop, true);
            document.addEventListener('pointermove', onResize, true);
            typeof start === 'function' && start(event, el);
        };
        el.addEventListener('pointerdown', onStart);
    }
}
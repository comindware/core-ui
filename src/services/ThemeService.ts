import { $ } from 'lib';

type options = {
    isCompact: boolean,
    themesPath: string,
    insertBefore?: string
}
const defaultOptions: options = {
    isCompact: false,
    themesPath: './themes/',
    insertBefore: ''
};

const idStylePrefix = 'core-ui-theme-styles-';
const idSpritesPrefix = 'core-ui-sprites-';

export default class ThemeService {
    static __appliedThemes: Set<string>;
    static __isDarkTheme: boolean;
    static options: options;

    static initialize(opt: options) {
        this.options = _.defaults(opt, defaultOptions);
        this.__appliedThemes = new Set();

        this._setTheme('new');
        if (this.options.isCompact) {
            this._setTheme('main');
        }
    }

    static isThemeShadeIsDark() {
        return this.__isDarkTheme;
    }

    static setIsThemeShadeIsDark(isThemeShadeIsDark: boolean) {
        this.__isDarkTheme = isThemeShadeIsDark;
    }

    static setCompact() {
        this._setTheme('main');
    }

    static unsetCompact() {
        this._unsetTheme('main');
    }

    static _setTheme(name: string): void {
        if (!name || this.__appliedThemes.has(name)) {
            return;
        }
        this.__appliedThemes.add(name);

        this._setStyle(name);
        this._setSprite(name);
    }

    static _unsetTheme(name: string) {
        if (!name || !this.__appliedThemes.has(name)) {
            return;
        }
        this.__appliedThemes.delete(name);

        this._removeElement(idStylePrefix + name);
        this._removeElement(idSpritesPrefix + name);
    }

    static isCompact(): boolean {
        return this.__appliedThemes.has('main');
    }

    static _setStyle(name: string): void {
        const path = this._getPath(name);
        const url = `${path}/theme.css`;
        const themeHtml = `<link rel='stylesheet' type='text/css' id="${idStylePrefix + name}" href="${url}">`;

        const insertBefore = this.options.insertBefore;
        if (insertBefore) {
            const element = document.querySelector(insertBefore);
            element && element.insertAdjacentHTML('beforebegin', themeHtml);
        } else {
            document.head.insertAdjacentHTML('beforeend', themeHtml);
        }
    }

    static _getPath(name: string): string {
        return this.options.themesPath + name;
    }

    static _setSprite(name: string) {
        const path = this._getPath(name);
        const url = `${path}/sprites.svg`;
        $.get(url, data => {
            const div = document.createElement('div');
            div.id = idSpritesPrefix + name;
            div.classList.add('visually-hidden');
            div.innerHTML = new XMLSerializer().serializeToString(data.documentElement);
            document.body.insertAdjacentElement('afterbegin', div);
        });
    }

    static _removeElement(id: string) {
        const el = document.getElementById(id);
        if (el != null && el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }
}

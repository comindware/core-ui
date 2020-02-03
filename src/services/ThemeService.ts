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
    static __initializeListeners: Array<Function>;
    static options: options;

    static initialize(opt: options) {
        this.options = _.defaults(opt, defaultOptions);
        this.__appliedThemes = new Set();

        this.__setTheme('new');
        if (this.options.isCompact) {
            this.__setTheme('main');
        }

        this.__initializeListeners?.forEach(listener => listener());
    }

    static addInitializeListener(listener: Function) {
        (this.__initializeListeners || (this.__initializeListeners = [])).push(listener);
    }

    static isThemeShadeIsDark() {
        return this.__isDarkTheme;
    }

    static setIsThemeShadeIsDark(isThemeShadeIsDark: boolean) {
        this.__isDarkTheme = isThemeShadeIsDark;
    }

    static setCompact() {
        this.__setTheme('main');
    }

    static unsetCompact() {
        this.__unsetTheme('main');
    }

    static __setTheme(name: string): void {
        if (!name || this.__appliedThemes.has(name)) {
            return;
        }

        // remove previous sprite
        const lastThemeName = this.__getLastThemeName();
        if (lastThemeName) {
            this.__removeElement(idSpritesPrefix + lastThemeName);
        }

        this.__appliedThemes.add(name);

        this.__setStyle(name);
        this.__setSprite(name);
    }

    static __unsetTheme(name: string) {
        if (!name || !this.__appliedThemes.has(name)) {
            return;
        }
        this.__appliedThemes.delete(name);

        this.__removeElement(idStylePrefix + name);
        this.__removeElement(idSpritesPrefix + name);

        // restore previous sprite
        const lastThemeName = this.__getLastThemeName();
        if (lastThemeName) {
            this.__setSprite(lastThemeName);
        }
    }

    static isCompact(): boolean {
        return this.__appliedThemes.has('main');
    }

    static __setStyle(name: string): void {
        const path = this.__getPath(name);
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

    static __getPath(name: string): string {
        return this.options.themesPath + name;
    }

    static __setSprite(name: string) {
        const path = this.__getPath(name);
        const url = `${path}/sprites.svg`;
        $.get(url, data => {
            if (name !== this.__getLastThemeName()) {
                return;
            }
            const div = document.createElement('div');
            div.id = idSpritesPrefix + name;
            div.classList.add('visually-hidden');
            div.innerHTML = new XMLSerializer().serializeToString(data.documentElement);
            document.body.insertAdjacentElement('afterbegin', div);
        });
    }

    static __removeElement(id: string) {
        const el = document.getElementById(id);
        if (el != null && el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }

    static __getLastThemeName() {
        return [...this.__appliedThemes][this.__appliedThemes.size - 1];
    }
}

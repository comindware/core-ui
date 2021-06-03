import { $ } from 'lib';
type theme = {
    name: string,
    filename: string
};

type options = {
    isCompact: boolean,
    themesPath: string,
    insertBefore?: string,
    compact: theme,
    normal: theme
};

const defaultOptions: options = {
    isCompact: false,
    themesPath: './themes/',
    insertBefore: '',
    compact: {
        name: 'main_compact',
        filename: 'main_compact.css'
    },
    normal: {
        name: 'main',
        filename: 'main.css'
    }
};

export default class ThemeService {
    static __isDarkTheme: boolean;
    static __initializeListeners: Array<Function>;
    static options: options;
    static __isCompact: boolean;

    static initialize(opt: options) {
        this.options = _.defaults(opt, defaultOptions);

        this.__isCompact = this.options.isCompact;

        this.__isCompact ? this.__setTheme(this.options.compact) : this.__setTheme(this.options.normal);

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
        this.__isCompact = true;
        this.__setTheme(this.options.compact);
    }

    static unsetCompact() {
        this.__isCompact = false;
        this.__setTheme(this.options.normal);
    }

    static isCompact() {
        return this.__isCompact;
    }

    static __setTheme(thema: theme): void {
        if (!thema) {
            return;
        }
        // this.__setStyle(thema);
        this.__setSprite(thema);
    }

    static __setStyle({ name, filename }: theme): void {
        const path = this.__getPath(name);
        const url = `${path}/${filename}`;
        const themeLink = document.getElementById('theme');
        if (themeLink) {
            themeLink.setAttribute('href', url);
            return;
        }

        const themeHtml = `<link rel="stylesheet" type="text/css" id="theme" href="${url}">`;
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

    static __setSprite({ name }: theme) {
        const path = this.__getPath(name);
        const url = `${path}/sprites.svg`;
        $.get(url, data => {
            const spritesEl = document.getElementById('sprites');
            if (spritesEl) {
                spritesEl.innerHTML = new XMLSerializer().serializeToString(data.documentElement);
                return;
            }
            const div = document.createElement('div');
            div.id = 'sprites';
            div.classList.add('visually-hidden');
            div.innerHTML = new XMLSerializer().serializeToString(data.documentElement);
            document.body.insertAdjacentElement('afterbegin', div);
        });
    }
}

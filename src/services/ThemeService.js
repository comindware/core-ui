const defaultOptions = {
    themesPath: './themes/',
    theme: 'main'
};

export default class ThemeService {
    static initialize(options) {
        this.options = Object.assign(defaultOptions, options);
        this.setTheme(this.options.theme);
    }

    static setTheme(name) {
        this.options.theme = name || this.options.theme;
        if (name === this.currentTheme) return;

        this.currentTheme = name;
        this.url = `${this.options.themesPath + this.currentTheme}`;
        this._removeElement('core-ui-theme-styles');
        this._removeElement('core-ui-sprites');
        this._setStyle();
        this._setSprite();
    }

    static _setStyle() {
        const url = `${this.url}/theme.css`;
        const themeHtml = `<link rel='stylesheet' type='text/css' id="core-ui-theme-styles" href="${url}">`;

        if (this.options.insertBefore) {
            document.querySelector(this.options.insertBefore).insertAdjacentHTML('beforeBegin', themeHtml);
        } else {
            document.head.insertAdjacentHTML('beforeend', themeHtml);
        }
    }

    static _setSprite() {
        const url = `${this.url}/sprites.svg`;
        $.get(url, data => {
            const div = document.createElement('div');
            div.id = 'core-ui-sprites';
            div.classList.add('visually-hidden');
            div.innerHTML = new XMLSerializer().serializeToString(data.documentElement);
            document.body.insertAdjacentElement('afterbegin', div);
        });
    }

    static _removeElement(id) {
        const el = document.getElementById(id);
        if (el != null) el.parentNode.removeChild(el);
    }
}

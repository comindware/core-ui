const defaultOptions = {
    themesPath: './themes/',
    theme: 'main'
};

export default class ThemeService {
    static initialize(options) {
        this.options = Object.assign(defaultOptions, options);
        this.setTheme();
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
        document.head.insertAdjacentHTML('beforeend', `<link id="core-ui-theme-styles" href="${url}" rel="stylesheet">`);
    }

    static _setSprite() {
        const url = `${this.url}/sprites.svg`;
        $.get(url, data => {
            const div = document.createElement('div');
            div.id = 'core-ui-sprites';
            div.innerHTML = new XMLSerializer().serializeToString(data.documentElement);
            document.body.insertBefore(div, document.body.childNodes[0]);
        });
    }

    static _removeElement(id) {
        const el = document.getElementById(id);
        if (el != null) el.parentNode.removeChild(el);
    }
}

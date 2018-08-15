import template from '../templates/simplifiedPanel.hbs';
import SearchBarView from '../../../views/SearchBarView';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    regions: {
        editorRegion: '.js-editor-region',
        searchBarRegion: '.js-search-bar-region'
    },

    className: 'simplified-panel_container',

    onRender() {
        const customEditor = Object.assign({}, this.options.editorConfig, {
            showSearch: false,
            openOnRender: true,
            panelClass: 'simplified-panel_wrapper',
            customTemplate: '<div class="user-edit-wrp" title="{{name}}"><div class="simple-field_container">{{#if avatarUrl}}<img src="{{avatarUrl}}">{{else}}{{abbreviation}}{{/if}}</div></div>',
            externalBlurHandler: this.__handleBlur.bind(this)
        });

        const editor = new this.options.editorConstructor(customEditor);
        const searchView = new SearchBarView();

        this.showChildView('editorRegion', editor);
        this.showChildView('searchBarRegion', searchView);

        this.listenTo(searchView, 'search', text => this.__onSearch(text, editor));
        this.listenTo(editor, 'dropdown:close', () => this.trigger('dropdown:close'));
    },

    templateContext() {
        return {
            title: this.options.editorConfig.schema.title
        };
    },

    __onSearch(text, editor) {
        editor.reqres.request('input:search', text, false);
    },

    __handleBlur(activeElement) {
        return this.el.contains(activeElement);
    }
});

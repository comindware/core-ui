import template from '../templates/simplifiedPanel.hbs';
import SearchBarView from '../../../views/SearchBarView';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    regions: {
        editorRegion: '.js-editor-region',
        searchBarRegion: '.js-search-bar-region'
    },

    ui: {
        panelSelectedContainer: '.panel-selected_container'
    },

    className: 'simplified-panel_container dropdown_root',

    onRender() {
        const customEditor = Object.assign({}, this.options.editorConfig, {
            showSearch: false,
            openOnRender: true,
            panelClass: 'simplified-panel_wrapper',
            customTemplate: '<div class="user-edit-wrp" title="{{name}}">{{#if abbreviation}}<div class="simple-field_container">{{#if avatarUrl}}<img src="{{avatarUrl}}">{{else}}{{abbreviation}}{{/if}}</div>{{/if}}</div>',
            externalBlurHandler: this.__handleBlur.bind(this)
        });

        const editor = new this.options.editorConstructor(customEditor);
        const searchView = new SearchBarView();

        this.showChildView('editorRegion', editor);
        this.showChildView('searchBarRegion', searchView);

        this.listenTo(searchView, 'search', text => this.__onSearch(text, editor));
        this.listenTo(editor, 'dropdown:close', () => this.trigger('dropdown:close'));
        this.listenTo(editor, 'dropdown:open', () => this.__adjustPanelContainerVisibility(this.options.editor.getValue(), editor));

        this.options.model.on('change', () => {
            const values = this.options.editor.getValue();

            this.__adjustPanelContainerVisibility(values, editor);
        });
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
    },

    __adjustPanelContainerVisibility(values, editor) {
        if (this.isRendered()) {
            if (values.length === 0) {
                this.el.setAttribute('noSelected', true);
                this.ui.panelSelectedContainer.css({ visibility: 'hidden' });
                editor.adjustPosition(true);
            } else {
                this.el.removeAttribute('noSelected');
                this.ui.panelSelectedContainer.css({ visibility: 'visible' });
                editor.adjustPosition(true);
            }
        }
    }
});

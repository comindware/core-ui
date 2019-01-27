import template from '../templates/simplifiedPanel.hbs';
import SearchBarView from '../../../views/SearchBarView';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    regions: {
        editorRegion: '.js-editor-region',
        searchBarRegion: '.js-search-bar-region'
    },

    ui: {
        panelSelectedContainer: '.panel-selected_container',
        closeButton: '.js-close_users',
        title: '.js-title'
    },

    events: {
        'click @ui.closeButton': '__closeUsersPanel'
    },

    className: 'simplified-panel_container simplified-panel_panel dropdown_root',

    onRender() {
        const readonly = this.options.editor.getReadonly();
        const enabled = this.options.editor.getEnabled();
        const editable = enabled && !readonly;
        const customEditor = Object.assign({}, this.options.editorConfig, {
            showSearch: false,
            openOnRender: editable,
            panelClass: 'simplified-panel_wrapper',
            customTemplate:
                '<div class="user-edit-wrp" title="{{name}}">{{#if abbreviation}}<div class="simple-field_container">{{#if avatarUrl}}<img src="{{avatarUrl}}">{{else}}{{abbreviation}}{{/if}}</div>{{/if}}</div>',
            externalBlurHandler: this.__handleBlur.bind(this)
        });

        const editor = new this.options.editorConstructor(customEditor);
        const searchView = new SearchBarView();

        this.showChildView('editorRegion', editor);
        if (editable) {
            this.showChildView('searchBarRegion', searchView);
        } else {
            editor.setReadonly(readonly);
            editor.setEnabled(enabled);
            this.ui.title.hide();
        }

        this.listenTo(searchView, 'search', text => this.__onSearch(text, editor));
        this.listenTo(editor, 'dropdown:close', () => this.trigger('dropdown:close'));
        this.listenTo(editor, 'dropdown:open', () => this.__adjustPanelContainerVisibility(this.options.editor.getValue(), editor));

        this.options.model.on(`change:${this.options.editor.key}`, () => {
            const values = this.options.editor.getValue();

            this.__adjustPanelContainerVisibility(values, editor);
        });
    },

    templateContext() {
        return {
            title: this.options.editorConfig.schema.title
        };
    },

    onAttach() {
        this.getRegion('searchBarRegion').currentView?.focus();
    },

    __onSearch(text, editor) {
        editor.reqres.request('input:search', text, false);
    },

    __handleBlur(activeElement) {
        return this.el.contains(activeElement);
    },

    __adjustPanelContainerVisibility(values, editor) {
        if (this.isRendered()) {
            if (values?.length === 0) {
                this.el.setAttribute('noSelected', true);
                this.ui.panelSelectedContainer.css({ visibility: 'hidden' });
                editor.adjustPosition(true);
            } else {
                this.el.removeAttribute('noSelected');
                this.ui.panelSelectedContainer.css({ visibility: 'visible' });
                editor.adjustPosition(true);
            }
        }
    },

    __closeUsersPanel() {
        this.trigger('dropdown:close');
    }
});

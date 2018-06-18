//@flow
import IconButtonView from './impl/iconEditor/views/IconButtonView';
import IconPanelView from './impl/iconEditor/views/IconPanelView';
import template from './impl/iconEditor/templates/iconEditorComponentView.html';
import iconPalette from './impl/iconEditor/iconPalette';
import icons from './impl/iconEditor/icons';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';

const constants = {
    iconPropertyDefaultName: 'iconClass'
};

/*
 * options parameters:
 *
 * @param model
 * @param modelIconProperty - name of model property. 'iconClass' as default
 */

export default BaseLayoutEditorView.extend({
    initialize(options) {
        const modelIconProperty = options.modelIconProperty;

        if (modelIconProperty && modelIconProperty !== constants.iconPropertyDefaultName) {
            this.model.set('iconClass', this.model.get(options.modelIconProperty));
        }
    },

    template: Handlebars.compile(template),

    className: 'editor editor_icon',

    regions: {
        iconSelectorHeaderRegion: '.js-icon-selector-header'
    },

    ui: {
        deleteIconButton: '.js-delete-icon'
    },

    events: {
        'click @ui.deleteIconButton': '__onDeleteIconClick'
    },

    onRender() {
        !this.model.get('color') && this.model.set('color', '#000000');

        this.popupPanel = Core.dropdown.factory.createDropdown({
            buttonView: IconButtonView,
            panelView: IconPanelView,
            buttonViewOptions: {
                model: this.model
            },
            panelViewOptions: {
                collection: this.__getConfig(),
                model: this.model
            },
            autoOpen: true
        });

        this.popupPanel.on('panel:click:item', id => {
            this.ui.deleteIconButton.show();
            this.model.set('iconClass', id);
            this.trigger('click:item', id);
            this.close();
        });

        this.showChildView('iconSelectorHeaderRegion', this.popupPanel);
        if (!this.model.get('iconClass')) {
            this.ui.deleteIconButton.hide();
        }
    },

    open() {
        this.popupPanel.open();
    },

    close() {
        this.popupPanel.close();
    },

    isEmptyValue() {
        return !this.model.has('iconClass');
    },

    __getConfig() {
        return new Backbone.Collection(
            Object.values(iconPalette).map((value) => ({
                name: value.label,
                groupItems: value.icons.map(icon => Object.assign({
                        filter: icons[icon.id].search.terms
                    }, icon)
                )
            }))
        );
    },

    __onDeleteIconClick() {
        this.model.set('iconClass', null);
        this.trigger('click:item', null);
        this.ui.deleteIconButton.hide();
    }
});

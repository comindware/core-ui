//@flow
import IconButtonView from './impl/iconEditor/views/IconButtonView';
import IconPanelView from './impl/iconEditor/views/IconPanelView';
import template from './impl/iconEditor/templates/iconEditorComponentView.html';
import categories from './impl/iconEditor/categories';
import icons from './impl/iconEditor/icons';
import BaseEditorView from './base/BaseEditorView';
import keyCode from '../../../src/utils/keyCode';
import formRepository from '../formRepository';

const defaultOptions = {
    modelIconProperty: 'iconClass',
    iconsMeta: icons,
    iconsCategories: categories
};

export default (formRepository.editors.Icon = BaseEditorView.extend({
    initialize(options) {
        this.__applyOptions(options, defaultOptions);

        if (this.options.modelIconProperty !== defaultOptions.modelIconProperty) {
            this.model.set('iconClass', this.model.get(this.options.modelIconProperty));
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
        'click @ui.deleteIconButton': '__onDeleteIconClick',
        click: 'open',
        keydown: '__keydown'
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
                showColorPicker: this.options.showColorPicker,
                model: this.model
            },
            autoOpen: false
        });

        this.showChildView('iconSelectorHeaderRegion', this.popupPanel);
        if (!this.model.get('iconClass')) {
            this.ui.deleteIconButton[0].addAttribute('hidden', '');
        }
    },

    onBeforeAttach() {
        this.listenTo(this.popupPanel, 'panel:click:item', id => {
            // TODO transfer this logic to __value method
            this.ui.deleteIconButton[0].removeAttribute('hidden');
            this.model.set('iconClass', id);
            this.trigger('click:item', id);
            this.__updateEmpty();
            this.ui.deleteIconButton.show();
            this.close();
        });

        this.listenTo(this.popupPanel, 'click', this.open);
    },

    __keydown(event) {
        if (event.keyCode === keyCode.ENTER) {
            this.open();
        }
    },

    getIsOpenAllowed() {
        return this.getEnabled() && !this.getReadonly() && !this.popupPanel.isOpen;
    },

    open() {
        if (!this.getIsOpenAllowed()) {
            return;
        }
        this.popupPanel.open();
    },

    close() {
        this.popupPanel.close();
    },

    isEmptyValue() {
        return !this.model.has('iconClass');
    },

    __getConfig() {
        const iconService = window.application.options.iconService;
        const useBrands = iconService && iconService.useBrands;
        return new Backbone.Collection(
            Object.values(this.options.iconsCategories).map(category => ({
                name: category.label,
                groupItems: category.icons.reduce((arr, icon) => {
                    const metaIcon = this.options.iconsMeta[icon];
                    const isBrand = metaIcon ? metaIcon.styles.includes('brands') : true;
                    if (!useBrands && isBrand) {
                        return arr;
                    }
                    arr.push({
                        id: icon,
                        name: metaIcon ? metaIcon.label : icon,
                        filter: metaIcon ? metaIcon.search.terms : [icon]
                    });

                    return arr;
                }, [])
            }))
        );
    },

    __onDeleteIconClick() {
        this.model.set('iconClass', null);
        this.trigger('click:item', null);
        this.ui.deleteIconButton.hide();
    }
}));

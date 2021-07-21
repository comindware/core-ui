//@flow
import IconButtonView from './impl/iconEditor/views/IconButtonView';
import IconPanelView from './impl/iconEditor/views/IconPanelView';
import template from './impl/iconEditor/templates/iconEditorComponentView.html';
import categories from './impl/iconEditor/categories';
import icons from './impl/iconEditor/icons';
import BaseEditorView from './base/BaseEditorView';
import keyCode from '../../../src/utils/keyCode';
import formRepository from '../formRepository';
import Backbone from 'backbone';

const defaultOptions = () => {
    const iconService = window.application.options.iconService;
    return {
        iconsMeta: iconService?.iconsMeta || icons,
        iconsCategories: iconService?.iconsCategories || categories
    };
};

export default (formRepository.editors.Icon = BaseEditorView.extend({
    initialize(options) {
        const defaults = defaultOptions();
        this.__applyOptions(options, defaults);
        this.iconModel = new Backbone.Model({ color: '#000000', iconClass: this.value });
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
        this.popupPanel = Core.dropdown.factory.createDropdown({
            buttonView: IconButtonView,
            panelView: IconPanelView,
            buttonViewOptions: {
                model: this.iconModel
            },
            panelViewOptions: {
                collection: this.__getConfig(),
                showColorPicker: this.options.showColorPicker,
                model: this.iconModel
            },
            autoOpen: false
        });

        this.showChildView('iconSelectorHeaderRegion', this.popupPanel);
        if (this.isEmptyValue()) {
            this.ui.deleteIconButton.get(0).hidden = true;
        }
    },

    onBeforeAttach() {
        this.listenTo(this.popupPanel, 'panel:click:item', id => {
            this.ui.deleteIconButton[0].removeAttribute('hidden');
            this.__value(id, true, true);
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
        return !this.value;
    },

    setValue(value) {
        this.__value(value, true, false);
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
        this.__value(null, true, true);
        this.trigger('click:item', null);
        this.ui.deleteIconButton.hide();
    },

    __value(value, updateUi, triggerChange) {
        if (this.value === value) {
            return;
        }
        this.value = value;

        if (updateUi) {
            this.iconModel.set({ iconClass: value });
        }

        if (triggerChange) {
            this.__triggerChange();
        }
    }
}));

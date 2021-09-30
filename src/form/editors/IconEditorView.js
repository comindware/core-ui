//@flow
import IconPanelView from './impl/iconEditor/views/IconPanelView';
import template from './impl/iconEditor/templates/iconEditorComponentView.html';
import categories from './impl/iconEditor/categories';
import icons from './impl/iconEditor/icons';
import BaseEditorView from './base/BaseEditorView';
import formRepository from '../formRepository';
import Backbone from 'backbone';

const DEFAULT_ICON_CLASS = 'level-down-alt';

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
        this.iconModel = new Backbone.Model({
            iconClass: this.value ?? DEFAULT_ICON_CLASS
        });
    },

    template: Handlebars.compile(template),

    templateContext() {
        return {
            iconClass: this.iconModel.get('iconClass')
        };
    },

    className: 'editor editor_icon',

    ui: {
        iconButton: '.js-icon-button',
        deleteIconButton: '.js-delete-icon'
    },

    events: {
        'click @ui.deleteIconButton': '__onDeleteIconClick',
        'click @ui.iconButton': '__showPopup'
    },

    onRender() {
        if (this.isEmptyValue()) {
            this.ui.deleteIconButton.get(0).hidden = true;
        }
    },

    __getPopupView() {
        return new Core.layout.Popup({
            size: {
                width: '860px',
                height: '600px'
            },
            header: Localizer.get('CORE.FORM.EDITORS.ICONEDITOR.COLOR'),
            content: this.panelView
        });
    },

    __showPopup() {
        this.panelView = new IconPanelView({
            collection: this.__getConfig(),
            model: this.iconModel
        });
        this.listenTo(this.panelView, 'click:item', id => {
            this.ui.deleteIconButton[0].removeAttribute('hidden');
            this.__value(id, true);
            this.__updateEmpty();
            this.ui.deleteIconButton.show();
            this.popupView.close();
        });
        this.popupView = this.__getPopupView();
        Core.services.WindowService.showPopup(this.popupView);
    },

    getIsOpenAllowed() {
        return this.getEnabled() && !this.getReadonly() && !this.popupPanel.isOpen;
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
        this.__value(null, true);
        this.trigger('click:item', null);
        this.ui.deleteIconButton.hide();
    },

    __value(value, triggerChange) {
        if (this.value === value) {
            return;
        }

        this.ui.iconButton.removeClass(Handlebars.helpers.iconPrefixer(this.iconModel.get('iconClass')));

        this.value = value;

        if (this.value) {
            this.ui.iconButton.addClass(Handlebars.helpers.iconPrefixer(this.value));
            this.iconModel.set({ iconClass: this.value });
        } else {
            this.ui.iconButton.addClass(Handlebars.helpers.iconPrefixer(DEFAULT_ICON_CLASS));
            this.iconModel.set({ iconClass: DEFAULT_ICON_CLASS });
        }
        if (triggerChange) {
            this.__triggerChange();
        }
    }
}));

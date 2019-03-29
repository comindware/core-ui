import SplitButtonActionView from './SplitButtonActionView';
import CustomActionGroupView from './CustomActionGroupView';
import template from '../templates/splitButton.html';
import SplitButtonMenuAnchorView from './actionMenu/SplitButtonMenuAnchorView';
import SelectStateItemsCollection from '../collections/SelectStateItemsCollection';

import { toolbarItemType, getClassName } from '../meta';

export default Marionette.View.extend({
    initialize() {
        this.juggleStates = this.model.get('juggleStates');
        if (this.juggleStates) {
            this.__initCollectionGenerator(this.model.get('items'), this.model.get('initialState') || 0);
        } else {
            this.itemsCollection = new SelectStateItemsCollection(this.model.get('items'));
        }
        this.__createDropDownView();
        this.__createButtonView();
        this.listenTo(this.buttonView, 'action:click', (model, ...args) => this.__onButtonCommandExecute(model, ...args));
    },

    template: Handlebars.compile(template),

    regions: {
        popupRegion: {
            el: '.js-popup-region',
            replaceElement: true
        },
        buttonRegion: {
            el: '.js-button-region',
            replaceElement: true
        }
    },

    className() {
        return getClassName('split-button-wrp', this.model, true);
    },

    onRender() {
        this.showChildView('buttonRegion', this.buttonView);
        this.showChildView('popupRegion', this.popupView);
    },

    __initCollectionGenerator(items, indexStart) {
        const collection = new Backbone.Collection();
        function* generator() {
            let index = indexStart;
            const filteredItems = items.filter(x => x.type !== toolbarItemType.HEADLINE);
            while (true) {
                if (index >= filteredItems.length) {
                    index = 0;
                }
                collection.reset([filteredItems[index++]]);
                yield collection;
            }
        }
        this.collectionGenerator = generator();
    },

    __getItemsCollection() {
        if (!this.juggleStates) {
            return this.itemsCollection;
        }
        return this.collectionGenerator.next().value;
    },

    __createDropDownView() {
        const SelectStateDropdownClass = 'toolbar-panel_container__select-state';
        const dropdownClass = SelectStateDropdownClass.replace(/^/, `${this.model.get('dropdownClass') || ''} `);
        const collection = this.__getItemsCollection();
        const menu = Core.dropdown.factory.createDropdown({
            buttonView: SplitButtonMenuAnchorView,
            panelView: CustomActionGroupView,
            panelViewOptions: {
                collection,
                class: dropdownClass,
                mode: this.options.mode,
                showName: true,
                className() {
                    return `toolbar-panel_container ${this.options.class || ''}`;
                }
            },
            buttonViewOptions: {
                model: this.model,
                mode: this.options.mode,
                customAnchor: true,
                iconClass: 'chevron-down'
            }
        });

        menu.listenTo(menu, 'panel:command:execute', (model, ...args) => this.__onPanelCommandExecute(model, ...args));

        this.popupView = menu;
    },

    __createButtonView() {
        const stateItems = this.popupView.model.get('items').filter(x => x.type !== toolbarItemType.HEADLINE);
        const initState = this.model.get('stateIndex') || 0;
        this.buttonView = new SplitButtonActionView({ model: this.model });
        this.buttonView.model.set({
            stateIndex: initState,
            iconClass: stateItems[initState].iconClass
        });
        this.buttonView.render();
        if (this.juggleStates) {
            this.collectionGenerator.next();
        }
    },

    __onPanelCommandExecute(actionModel, options) {
        const stateData = actionModel.toJSON();
        const stateIndex = this.model.get('items').findIndex(x => _.isEqual(x, stateData));

        this.buttonView.model.set({
            stateIndex,
            iconClass: stateData.iconClass
        });
        this.buttonView.render();
        this.popupView.close();
        if (this.juggleStates) {
            this.collectionGenerator.next();
        }
        this.trigger('action:click', actionModel, options);
    },

    __onButtonCommandExecute(actionModel, options) {
        this.trigger('action:click', actionModel, options);
    }
});
